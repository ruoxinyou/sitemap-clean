import axios from 'axios';
import * as cheerio from 'cheerio';
import { SocialLinks } from '../types/types';
import { config } from '../config/config';

export async function extractFooterSocial(url: string): Promise<SocialLinks> {
    console.log(`Extracting social links from footer of: ${url}`);
    const social: SocialLinks = {};

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Find footer
        let footer = null;
        for (const selector of config.selectors.footer) {
            const el = $(selector);
            if (el.length) {
                footer = el;
                break;
            }
        }

        if (!footer) {
            console.warn(`[WARN] No footer found for ${url} using selectors: ${config.selectors.footer.join(', ')}`);
            // Log body length to see if we got content
            console.log(`[DEBUG] Page content length: ${response.data.length}`);
            return social;
        }

        // Find social links in footer
        footer.find('a').each((_, el) => {
            const href = $(el).attr('href');
            if (!href) return;

            // Check against whitelist and ignore list
            const isWhitelisted = config.socialWhitelist.some(domain => href.includes(domain));
            const isIgnored = config.socialIgnorePatterns.some(pattern => href.includes(pattern));

            if (isWhitelisted && !isIgnored) {
                // Determine platform
                if (href.includes('facebook.com')) social.facebook = href;
                else if (href.includes('instagram.com')) social.instagram = href;
                else if (href.includes('youtube.com')) social.youtube = href;
                else if (href.includes('linkedin.com')) social.linkedin = href;
                else if (href.includes('tiktok.com')) social.tiktok = href;
                else if (href.includes('x.com') || href.includes('twitter.com')) social.x = href;
                // Add others as needed
            }
        });

    } catch (error) {
        console.error(`Error extracting social links from ${url}:`, error);
    }

    return social;
}
