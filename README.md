# Schema Markup CLI Tool

A powerful, configurable CLI tool designed to parse sitemaps, group pages across multiple locales, and extract organization structured data (Schema.org) for large-scale international websites.

## 🚀 Key Features

- **Intelligent Sitemap Parsing**: Automatically groups pages into logical sets based on `hreflang` alternates or URL patterns.
- **Multi-Country Support**: Generates country-specific configurations by detecting locales from hostnames (e.g., `uk.example.com`) or path prefixes (e.g., `/uk/`, `/cz/`).
- **Smart Contact Extraction**:
  - Automatically identifies contact pages using configurable patterns.
  - **Phone Number Prioritization**: Prioritizes local phone numbers matching the country's international calling code (e.g., selects `+420` numbers for Czech Republic).
  - Fallback logic to filter out foreign numbers (e.g., US toll-free) when local numbers are present.
- **Unified Page IDs**: Generates consistent `pageId`s across all locales using canonical URL strategies, stripping locale prefixes for clean grouping.
- **Robust Filtering**:
  - Automatically ignores URLs containing specific patterns (e.g., "review", "copy").
  - Filters based on both raw URLs and derived Page IDs.
- **Social Media Discovery**: Extracts social profile links from page footers with whitelist validation.

## 🛠️ Installation

```bash
npm install
```

## 📖 Usage

Run the tool by providing a sitemap URL:

```bash
npm start -- --sitemap https://www.example.com/sitemap.xml
```

The tool will generate a `country-config.json` file containing the structured data configuration for each identified country.

## ⚙️ Configuration

The tool is highly configurable via `src/config/config.ts`:

- **`countryMapping`**: Map domains to country codes.
- **`pathPrefixMapping`**: Map URL path prefixes (e.g., `uk`, `cz`) to country codes.
- **`contactPagePatterns`**: URL patterns to identify contact pages (checks both URL and Page ID).
- **`urlIgnorePatterns`**: Patterns to exclude from processing (e.g., `['review', 'copy']`).
- **`selectors`**: CSS selectors for extracting content (footer, nav, address).
- **`countryCallingCodes`**: Map of country codes to calling codes for phone prioritization.

## 🏗️ Build

To compile the TypeScript source:

```bash
npm run build
```
# sitemap-clean
