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

        if (selectedTel) {
            contact.telephone = selectedTel;
        }

        // Extract Email
        const mailLink = $('a[href^="mailto:"]').first().attr('href');
        if (mailLink) {
            contact.email = mailLink.replace('mailto:', '').trim();
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
