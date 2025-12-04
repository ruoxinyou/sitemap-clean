export type CountryCode = string;   // e.g. "UK", "DE"
export type LocaleCode = string;    // e.g. "en-GB", "de-DE";

export interface PageLocale {
    locale: LocaleCode;
    countryCode: CountryCode;
    url: string;
}

export interface PageGroup {
    pageId: string;       // internal ID to link same logical page across locales
    locales: PageLocale[];
}

export interface SocialLinks {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
    x?: string;           // Twitter/X
    [key: string]: string | undefined;  // allow extensibility
}

export interface OrganizationAddress {
    streetAddress?: string;
    postalCode?: string;
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
    raw?: string;         // fallback: full address as a single string
}

export interface OrganizationContact {
    telephone?: string;
    email?: string;
    address?: OrganizationAddress;
    contactPageUrl: string;
}

export interface PageEntry {
    pageId: string;
    url: string;
}

export interface CountryOrganizationConfig {
    countryCode: CountryCode;
    defaultLocale: LocaleCode;
    availableLocales: LocaleCode[];
    baseDomain?: string;      // e.g. "uk.example.com"
    organization: {
        name?: string;
        legalName?: string;
        url?: string;
        contact: OrganizationContact;
        social: SocialLinks;
    };
    pages: PageEntry[];
}
