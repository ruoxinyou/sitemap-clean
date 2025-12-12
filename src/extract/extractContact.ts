import axios from 'axios';
import * as cheerio from 'cheerio';
import { OrganizationContact, CountryCode } from '../types/types';
import { config } from '../config/config';
import { countryCallingCodes } from '../utils/countryCallingCodes';

export async function extractContact(url: string, countryCode?: CountryCode): Promise<OrganizationContact> {
    console.log(`Extracting contact info from: ${url}`);
    const contact: OrganizationContact = { contactPageUrl: url };

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Extract Telephone
        // Strategy: Get all tel links, prioritize one matching country calling code
        const telLinks: string[] = [];
        $('a[href^="tel:"]').each((_, el) => {
            const href = $(el).attr('href');
            if (href) telLinks.push(href.replace('tel:', '').trim());
        });

        let selectedTel = '';
        if (telLinks.length > 0) {
            if (countryCode && countryCallingCodes[countryCode]) {
                const callingCode = countryCallingCodes[countryCode];
                // Look for a number starting with calling code (allowing for +, 00, or just digits if formatted)
                // We'll strip non-digits for comparison
                const targetPrefix = callingCode.replace('+', '');

                const match = telLinks.find(tel => {
                    const cleanTel = tel.replace(/\D/g, '');
                    return cleanTel.startsWith(targetPrefix);
                });

                if (match) {
                    selectedTel = match;
                } else {
                    // Fallback: If no direct match, try to find a number that DOESN'T match other known major country codes (like US +1)
                    // This helps in cases like PL where the local number doesn't have +48 but there is also a US +1 number
                    const foreignPrefixes = ['1', '44']; // US/Canada, UK (common fallbacks)
                    const localCandidate = telLinks.find(tel => {
                        const cleanTel = tel.replace(/\D/g, '');
                        return !foreignPrefixes.some(prefix => cleanTel.startsWith(prefix));
                    });
                    selectedTel = localCandidate || telLinks[0];
                }
            } else {
                selectedTel = telLinks[0];
            }
        }

        // Fallback: Regex for Phone
        if (!selectedTel) {
            const bodyText = $('body').text();
            // Regex to match international numbers: 
            // Optional +
            // Optional country code (1-3 digits)
            // Separators (space, dot, dash)
            // Groups of digits
            // Minimum length check is important
            // This is a broad regex, we rely on filtering
            const phoneRegex = /(?:\+|00)(?:[0-9] ?){6,14}[0-9]/g;
            const matches = bodyText.match(phoneRegex) || [];

            if (matches.length > 0) {
                if (countryCode && countryCallingCodes[countryCode]) {
                    const callingCode = countryCallingCodes[countryCode];
                    const targetPrefix = callingCode.replace('+', '');

                    const match = matches.find(tel => {
                        const cleanTel = tel.replace(/\D/g, '');
                        return cleanTel.startsWith(targetPrefix);
                    });
                    if (match) selectedTel = match.trim();
                }

                // If still no match and we haven't found anything, take the first valid-looking one
                if (!selectedTel && matches.length > 0) {
                    const firstMatch = matches[0];
                    if (firstMatch) {
                        selectedTel = firstMatch.trim();
                    }
                }
            }
        }

        if (selectedTel) {
            contact.telephone = selectedTel;
        }

        // Extract Email
        // Priority: 1. mailto link, 2. CSS selectors, 3. Regex on spaced text
        let selectedEmail = '';

        // 1. mailto link
        const mailLink = $('a[href^="mailto:"]').first().attr('href');
        if (mailLink) {
            selectedEmail = mailLink.replace('mailto:', '').trim();
        }

        // 2. CSS selectors
        if (!selectedEmail && config.selectors.email) {
            for (const selector of config.selectors.email) {
                const el = $(selector).first();
                if (el.length) {
                    // Use text() but be careful, usually specific elements are fine
                    const text = el.text().trim();
                    // Basic validation
                    if (text.includes('@')) {
                        selectedEmail = text;
                        break;
                    }
                }
            }
        }

        // 3. Regex Fallback
        if (!selectedEmail) {
            // Helper to extract text with spacing to avoid concatenation issues
            // e.g. "Email" + "uk@..." -> "Email uk@..."
            const bodyText = $('body *').contents().map((_, el) => {
                return (el.type === 'text') ? $(el).text() + ' ' : '';
            }).get().join('');

            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const matches = bodyText.match(emailRegex);
            if (matches && matches.length > 0) {
                // Simple heuristic: take the first one
                selectedEmail = matches[0].trim();
            }
        }

        if (selectedEmail) {
            contact.email = selectedEmail;
        }

        // Extract Address
        let addressText = '';

        // Try <address> tag first
        const addressTag = $('address').first();
        if (addressTag.length) {
            addressText = addressTag.text().trim();
        } else {
            // Try configured selectors
            for (const selector of config.selectors.address) {
                const el = $(selector).first();
                if (el.length) {
                    addressText = el.text().trim();
                    break;
                }
            }
        }

        if (addressText) {
            // Simple parsing or just raw
            // For now, we store raw, but we could try to parse if we had a library or regex
            contact.address = {
                raw: addressText.replace(/\s+/g, ' ') // normalize whitespace
            };
        }

    } catch (error) {
        console.error(`Error extracting contact info from ${url}:`, error);
    }

    return contact;
}
