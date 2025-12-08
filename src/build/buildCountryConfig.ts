import { PageGroup, CountryOrganizationConfig, OrganizationContact, SocialLinks } from '../types/types';
import { extractContact } from '../extract/extractContact';
import { extractFooterSocial } from '../extract/extractFooterSocial';
import { config } from '../config/config';
import pLimit from 'p-limit';

export async function buildCountryConfig(groups: PageGroup[]): Promise<CountryOrganizationConfig[]> {
    const countryConfigs: Map<string, CountryOrganizationConfig> = new Map();
    const limit = pLimit(config.maxConcurrentRequests);

    // 1. Identify unique countries and their available locales
    for (const group of groups) {
        for (const locale of group.locales) {
            if (!countryConfigs.has(locale.countryCode)) {
                countryConfigs.set(locale.countryCode, {
                    countryCode: locale.countryCode,
                    defaultLocale: locale.locale, // Temporary, will refine
                    availableLocales: [],
                    organization: {
                        contact: { contactPageUrl: '' },
                        social: {}
                    },
                    pages: []
                });
            }
            const config = countryConfigs.get(locale.countryCode)!;
            if (!config.availableLocales.includes(locale.locale)) {
                config.availableLocales.push(locale.locale);
            }

            // Add page to the country config
            config.pages.push({
                pageId: group.pageId,
                url: locale.url
            });
        }
    }

    // 2. Process each country to extract info concurrently
    // 2. Process each country to extract info concurrently
    const tasks = Array.from(countryConfigs.values()).map(countryConfig => limit(async () => {

        let homepageUrl = '';
        let domain = '';

        // Find a URL for this country to determine homepage
        // We look through all groups to find a URL belonging to this country
        for (const group of groups) {
            const loc = group.locales.find(l => l.countryCode === countryConfig.countryCode);
            if (loc) {
                try {
                    const u = new URL(loc.url);
                    domain = u.hostname;

                    // Determine homepage with path prefix if applicable
                    let prefix = '';
                    const pathParts = u.pathname.split('/').filter(p => p.length > 0);
                    if (pathParts.length > 0) {
                        const p = pathParts[0];
                        if (config.pathPrefixMapping[p] && config.pathPrefixMapping[p].countryCode === countryConfig.countryCode) {
                            prefix = p;
                        }
                    }

                    homepageUrl = `${u.protocol}//${u.hostname}/${prefix ? prefix + '/' : ''}`;
                    countryConfig.baseDomain = domain;

                    // Refine default locale from config if possible
                    if (config.countryMapping[domain]) {
                        countryConfig.defaultLocale = config.countryMapping[domain].defaultLocale;
                    }
                    break;
                } catch (e) { }
            }
        }

        if (!homepageUrl) {
            console.warn(`Could not determine homepage for country ${countryConfig.countryCode}`);
            return;
        }

        countryConfig.organization.url = homepageUrl;

        // Extract social links from homepage
        try {
            const social = await extractFooterSocial(homepageUrl);
            countryConfig.organization.social = social;
        } catch (e) {
            console.error(`Error extracting social for ${countryConfig.countryCode}:`, e);
        }

        // Find contact page (Prioritize patterns order)
        let contactPageUrl = '';

        // Iterate through patterns in order of priority
        for (const pattern of config.contactPagePatterns) {
            // Check all pages for this country
            const foundGroup = groups.find(group => {
                const loc = group.locales.find(l => l.countryCode === countryConfig.countryCode);
                if (!loc) return false;

                // Check localized URL OR Page ID
                return loc.url.toLowerCase().includes(pattern.toLowerCase()) ||
                    group.pageId.toLowerCase().includes(pattern.toLowerCase());
            });

            if (foundGroup) {
                const loc = foundGroup.locales.find(l => l.countryCode === countryConfig.countryCode);
                if (loc) {
                    contactPageUrl = loc.url;
                    break; // Found the highest priority match
                }
            }
        }

        if (contactPageUrl) {
            try {
                const contact = await extractContact(contactPageUrl, countryConfig.countryCode);
                countryConfig.organization.contact = contact;
            } catch (e) {
                console.error(`Error extracting contact for ${countryConfig.countryCode}:`, e);
            }
        } else {
            console.warn(`No contact page found for ${countryConfig.countryCode} in sitemap.`);
        }
    }));

    await Promise.all(tasks);

    return Array.from(countryConfigs.values());
}
