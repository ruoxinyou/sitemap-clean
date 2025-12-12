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

    // Mapping from hreflang code to country info
    hreflangMapping: {
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
        email?: string[];
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
        'www.smallerearth.com': { countryCode: 'WW', defaultLocale: 'en-US' },
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
        'ie': { countryCode: 'IE', defaultLocale: 'en-IE' },
        'de': { countryCode: 'DE', defaultLocale: 'de-DE' },
        'es': { countryCode: 'ES', defaultLocale: 'es-ES' },
        'rosa': { countryCode: 'ROSA', defaultLocale: 'es-419' },
        'ww': { countryCode: 'WW', defaultLocale: 'en-US' },
        'eu': { countryCode: 'EU', defaultLocale: 'en-EU' },
    },

    hreflangMapping: {
        'en-IE': { countryCode: 'IE', defaultLocale: 'en-IE' },
        'en-AU': { countryCode: 'AU', defaultLocale: 'en-AU' },
        'en-NZ': { countryCode: 'NZ', defaultLocale: 'en-NZ' },
        'de-DE': { countryCode: 'DE', defaultLocale: 'de-DE' },
        'es-ES': { countryCode: 'ES', defaultLocale: 'es-ES' },
        'hu': { countryCode: 'HU', defaultLocale: 'hu-HU' },
        'pl': { countryCode: 'PL', defaultLocale: 'pl-PL' },
        'sk': { countryCode: 'SK', defaultLocale: 'sk-SK' },
        'es-MX': { countryCode: 'MX', defaultLocale: 'es-MX' },
        'es-CO': { countryCode: 'CO', defaultLocale: 'es-CO' },
        'en-FR': { countryCode: 'EU', defaultLocale: 'en-EU' }, // Mapped to EU per user request
        'en': { countryCode: 'WW', defaultLocale: 'en-US' },    // Mapped to WW per user request
        'es-AR': { countryCode: 'ROSA', defaultLocale: 'es-419' }, // Mapped to ROSA per user request
        'nl': { countryCode: 'NL', defaultLocale: 'nl-NL' },
        'cs': { countryCode: 'CZ', defaultLocale: 'cs-CZ' },
        'en-ZA': { countryCode: 'ZA', defaultLocale: 'en-ZA' },
        'en-US': { countryCode: 'US', defaultLocale: 'en-US' },
        'en-GB': { countryCode: 'UK', defaultLocale: 'en-GB' },
    },

    contactPagePatterns: [
        '/contact',
        '/kontakt',
        '/contact-us',
        '/contactus',
        '/nous-contacter',
        '/o-nas/kontakty',
        '/about/contact',
        '/kapcsolat',
        '/contato',
        '/mais-informacao/contato',
        '/rolunk/kapcsolat',
        '/get-in-touch',
        '/reach-us',
        '/connect',
        '/support',
        '/help',
        '/acerca-de/contactenos', // Spanish variation seen in sitemap
        '/nosotros/contactanos', // Another Spanish variation
        '/about/contact-us' // Common variation
    ],

    selectors: {
        footer: ['footer', '.footer', '#footer', '.site-footer', '.footer-link-wrapper', '.footer-bottom', '.section_footer'],
        nav: ['nav', '.navbar', '.nav', '.main-nav', 'header', '.w-nav', '.navbar_component'],
        address: ['address', '.address', '.contact-address', '.footer-address'],
        email: ['.email', '.contact-email', '.mail', '.contact-info-email']
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
