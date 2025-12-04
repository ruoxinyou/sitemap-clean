import { URL } from 'url';
import { PageGroup, PageLocale, CountryCode, LocaleCode } from '../types/types';
import { config } from '../config/config';
import { ParsedUrl } from './loadSitemap';

export function groupPages(parsedUrls: ParsedUrl[]): PageGroup[] {
    const groups: Map<string, PageGroup> = new Map();

    for (const entry of parsedUrls) {
        const urlStr = entry.loc;
        try {
            // Check ignore patterns
            if (config.urlIgnorePatterns.some(pattern => urlStr.toLowerCase().includes(pattern.toLowerCase()))) {
                continue;
            }

            const url = new URL(urlStr);
            const { countryCode, locale } = deriveLocale(url);

            // Determine canonical URL for Page ID
            let canonicalUrlStr = urlStr;
            if (entry.alternates && entry.alternates.length > 0) {
                // Priority: x-default -> en-GB -> en-US -> first alternate
                const xDefault = entry.alternates.find(a => a.hreflang === 'x-default');
                const enGb = entry.alternates.find(a => a.hreflang === 'en-GB');
                const enUs = entry.alternates.find(a => a.hreflang === 'en-US');

                if (xDefault) canonicalUrlStr = xDefault.href;
                else if (enGb) canonicalUrlStr = enGb.href;
                else if (enUs) canonicalUrlStr = enUs.href;
                else canonicalUrlStr = entry.alternates[0].href;
            }

            const canonicalUrl = new URL(canonicalUrlStr);
            const pageId = derivePageId(canonicalUrl);

            // Check ignore patterns on Page ID as well
            if (config.urlIgnorePatterns.some(pattern => pageId.toLowerCase().includes(pattern.toLowerCase()))) {
                continue;
            }

            if (!groups.has(pageId)) {
                groups.set(pageId, { pageId, locales: [] });
            }

            const group = groups.get(pageId)!;

            // Avoid duplicates
            if (!group.locales.some(l => l.url === urlStr)) {
                group.locales.push({
                    locale,
                    countryCode,
                    url: urlStr
                });
            }

            // Note: We don't need to process alternates loop here because the sitemap 
            // usually contains an entry for each alternate anyway. 
            // By processing each entry independently but deriving the same Page ID,
            // they will naturally group together.

        } catch (e) {
            console.warn(`Skipping invalid URL: ${urlStr}`);
        }
    }

    return Array.from(groups.values());
}

function deriveLocale(url: URL): { countryCode: CountryCode; locale: LocaleCode } {
    const hostname = url.hostname;

    // Check config mapping (hostname)
    if (config.countryMapping[hostname]) {
        const mapping = config.countryMapping[hostname];
        return {
            countryCode: mapping.countryCode,
            locale: mapping.defaultLocale
        };
    }

    // Check path prefix
    const pathParts = url.pathname.split('/').filter(p => p.length > 0);
    if (pathParts.length > 0) {
        const prefix = pathParts[0];
        if (config.pathPrefixMapping[prefix]) {
            const mapping = config.pathPrefixMapping[prefix];
            return {
                countryCode: mapping.countryCode,
                locale: mapping.defaultLocale
            };
        }
    }

    // Fallback: try to guess from TLD or path (simple heuristic)
    // This is where user customization in config is key.
    // For now, return a default "Unknown" or generic
    return { countryCode: 'Unknown', locale: 'en-US' };
}

function derivePageId(url: URL): string {
    let path = url.pathname;

    // Remove trailing slash
    if (path.endsWith('/') && path.length > 1) {
        path = path.slice(0, -1);
    }

    // Remove locale prefix if present
    const pathParts = path.split('/').filter(p => p.length > 0);
    if (pathParts.length > 0) {
        const prefix = pathParts[0];
        if (config.pathPrefixMapping[prefix]) {
            // It is a known locale prefix, remove it
            // Reconstruct path without the first segment
            path = '/' + pathParts.slice(1).join('/');
        }
    }

    // Ensure root path is just "/"
    if (path === '') {
        path = '/';
    }

    return path;
}
