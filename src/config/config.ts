import { CountryCode, LocaleCode } from '../types/types';

export interface Config {
    // Mapping from hostname or path prefix to country/locale info
    countryMapping: {
        [key: string]: {
            countryCode: CountryCode;
            defaultLocale: LocaleCode;
        };
    };

    // Mapping from path prefix (e.g. "uk", "cz") to country/locale info
    pathPrefixMapping: {
        [key: string]: {
            countryCode: CountryCode;
            defaultLocale: LocaleCode;
        };
    };

    // URL patterns to identify contact pages
    contactPagePatterns: string[];

    // CSS selectors for extraction
    selectors: {
        footer: string[];
        nav: string[];
        address: string[];
    };

    // Social media whitelist
    socialWhitelist: string[];

    // Social share links to ignore
    socialIgnorePatterns: string[];

    // Concurrency control
    maxConcurrentRequests: number;

    // Page ID derivation strategy
    pageIdStrategy: 'path-no-locale' | 'path-full';

    // Patterns to ignore in URLs (e.g. "review", "copy")
    urlIgnorePatterns: string[];
}

export const config: Config = {
    countryMapping: {
        // Example mappings - user should customize this
        'uk.example.com': { countryCode: 'UK', defaultLocale: 'en-GB' },
        'de.example.com': { countryCode: 'DE', defaultLocale: 'de-DE' },
        'fr.example.com': { countryCode: 'FR', defaultLocale: 'fr-FR' },
        // Fallback or generic
        'www.example.com': { countryCode: 'US', defaultLocale: 'en-US' },
    },

    pathPrefixMapping: {
        'uk': { countryCode: 'UK', defaultLocale: 'en-GB' },
        'cz': { countryCode: 'CZ', defaultLocale: 'cs-CZ' },
        'hu': { countryCode: 'HU', defaultLocale: 'hu-HU' },
        'pl': { countryCode: 'PL', defaultLocale: 'pl-PL' },
        'sk': { countryCode: 'SK', defaultLocale: 'sk-SK' },
        'mx': { countryCode: 'MX', defaultLocale: 'es-MX' },
        'cl': { countryCode: 'CL', defaultLocale: 'es-CL' },
        'pe': { countryCode: 'PE', defaultLocale: 'es-PE' },
        'br': { countryCode: 'BR', defaultLocale: 'pt-BR' },
        'co': { countryCode: 'CO', defaultLocale: 'es-CO' },
        'nz': { countryCode: 'NZ', defaultLocale: 'en-NZ' },
        'au': { countryCode: 'AU', defaultLocale: 'en-AU' },
        'us': { countryCode: 'US', defaultLocale: 'en-US' },
    },

    contactPagePatterns: ['/contact', '/kontakt', '/contact-us', '/nous-contacter', '/o-nas/kontakty', '/about/contact', '/kapcsolat', '/contato', '/mais-informacao/contato', '/rolunk/kapcsolat'],

    selectors: {
        footer: ['footer', '.footer', '#footer', '.site-footer', '.footer-link-wrapper', '.footer-bottom', '.section_footer'],
        nav: ['nav', '.navbar', '.nav', '.main-nav', 'header', '.w-nav', '.navbar_component'],
        address: ['address', '.address', '.contact-address', '.footer-address']
    },

    socialWhitelist: [
        'facebook.com',
        'instagram.com',
        'linkedin.com',
        'youtube.com',
        'tiktok.com',
        'x.com',
        'twitter.com',
        'pinterest.com',
    ],

    socialIgnorePatterns: [
        'sharer.php',
        '/share',
        'intent/tweet',
    ],

    maxConcurrentRequests: 5,

    pageIdStrategy: 'path-no-locale',

    urlIgnorePatterns: ['review', 'copy'],
};
