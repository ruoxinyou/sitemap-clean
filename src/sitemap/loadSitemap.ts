import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

interface SitemapUrl {
    loc: string;
    'xhtml:link'?: Array<{ '@_rel': string; '@_hreflang': string; '@_href': string }> | { '@_rel': string; '@_hreflang': string; '@_href': string };
}

interface SitemapIndex {
    sitemap: Array<{ loc: string }>;
}

interface UrlSet {
    url: SitemapUrl[];
}

export async function loadSitemap(url: string): Promise<string[]> {
    console.log(`Fetching sitemap from: ${url}`);
    try {
        const response = await axios.get(url);
        const xmlData = response.data;

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });

        const parsed = parser.parse(xmlData);
        const urls: string[] = [];

        // Check if it's a sitemap index
        if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
            const sitemaps = Array.isArray(parsed.sitemapindex.sitemap)
                ? parsed.sitemapindex.sitemap
                : [parsed.sitemapindex.sitemap];

            console.log(`Found ${sitemaps.length} sub-sitemaps.`);
            for (const sm of sitemaps) {
                if (sm.loc) {
                    const subUrls = await loadSitemap(sm.loc);
                    urls.push(...subUrls);
                }
            }
        }
        // Check if it's a urlset
        else if (parsed.urlset && parsed.urlset.url) {
            const urlEntries = Array.isArray(parsed.urlset.url)
                ? parsed.urlset.url
                : [parsed.urlset.url];

            console.log(`Found ${urlEntries.length} URLs in sitemap.`);
            for (const entry of urlEntries) {
                if (entry.loc) {
                    urls.push(entry.loc);
                }
                // We could also extract hreflang links here if needed, but for now we focus on the main loc
                // If we want to support hreflang discovery from sitemap, we would add them to the list or return a richer object.
                // For simplicity and per requirements, we'll start with just the locs, 
                // but the requirement says "Parse out... Any <xhtml:link ...> entries".
                // Let's stick to returning strings for now as the primary input for grouping, 
                // but if we need hreflang for grouping, we might need to refactor this to return objects.
                // Re-reading requirement: "Parse out: Each <loc> URL, Any <xhtml:link ...> entries"
                // And "Group pages... If the sitemap includes hreflang, use that to help map locales."
                // So we SHOULD return objects.
            }
        }

        return urls;
    } catch (error) {
        console.error(`Error loading sitemap ${url}:`, error);
        return [];
    }
}

// Refactored to return richer objects
export interface ParsedUrl {
    loc: string;
    alternates?: Array<{ hreflang: string; href: string }>;
}

export async function loadSitemapRich(url: string): Promise<ParsedUrl[]> {
    console.log(`Fetching sitemap from: ${url}`);
    try {
        const response = await axios.get(url);
        const xmlData = response.data;

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            isArray: (name, jpath, isLeafNode, isAttribute) => {
                if (name === 'url') return true;
                if (name === 'sitemap') return true;
                if (name === 'xhtml:link') return true;
                return false;
            }
        });

        const parsed = parser.parse(xmlData);
        const results: ParsedUrl[] = [];

        if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
            const sitemaps = parsed.sitemapindex.sitemap;
            console.log(`Found ${sitemaps.length} sub-sitemaps.`);
            for (const sm of sitemaps) {
                if (sm.loc) {
                    const subResults = await loadSitemapRich(sm.loc);
                    results.push(...subResults);
                }
            }
        } else if (parsed.urlset && parsed.urlset.url) {
            const urlEntries = parsed.urlset.url;
            console.log(`Found ${urlEntries.length} URLs in sitemap.`);
            for (const entry of urlEntries) {
                if (entry.loc) {
                    const alternates: Array<{ hreflang: string; href: string }> = [];
                    if (entry['xhtml:link']) {
                        entry['xhtml:link'].forEach((link: any) => {
                            if (link['@_rel'] === 'alternate' && link['@_hreflang']) {
                                alternates.push({
                                    hreflang: link['@_hreflang'],
                                    href: link['@_href']
                                });
                            }
                        });
                    }
                    results.push({
                        loc: entry.loc,
                        alternates: alternates.length > 0 ? alternates : undefined
                    } as ParsedUrl);
                }
            }
        }

        return results;
    } catch (error) {
        console.error(`Error loading sitemap ${url}:`, error);
        return [];
    }
}
