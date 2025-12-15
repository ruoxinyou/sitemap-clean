#!/usr/bin/env node
import { loadSitemapRich } from './sitemap/loadSitemap';
import { groupPages } from './sitemap/groupPages';
import { buildCountryConfig } from './build/buildCountryConfig';
import axios from 'axios';

// Set default User-Agent
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

import * as fs from 'fs';
import * as path from 'path';
import { config } from './config/config';

async function main() {
    const args = process.argv.slice(2);
    const sitemapArgIndex = args.findIndex(arg => arg === '--sitemap' || arg === '-s');
    const ignoreArgIndex = args.findIndex(arg => arg === '--ignore' || arg === '-i');

    if (sitemapArgIndex === -1 || sitemapArgIndex + 1 >= args.length) {
        console.error('Usage: node cli.js --sitemap <url> [--ignore "pattern1,pattern2"]');
        process.exit(1);
    }

    const sitemapUrl = args[sitemapArgIndex + 1];

    // Handle ignore patterns
    if (ignoreArgIndex !== -1 && ignoreArgIndex + 1 < args.length) {
        const ignorePatterns = args[ignoreArgIndex + 1].split(',').map(p => p.trim()).filter(p => p.length > 0);
        if (ignorePatterns.length > 0) {
            console.log(`Overriding ignore patterns with: ${JSON.stringify(ignorePatterns)}`);
            config.urlIgnorePatterns = ignorePatterns;
        }
    }

    console.log('--- Schema Markup CLI Tool ---');
    console.log('1. Loading Sitemap...');
    const parsedUrls = await loadSitemapRich(sitemapUrl);

    console.log('2. Grouping Pages...');
    const groups = groupPages(parsedUrls);
    console.log(`   Identified ${groups.length} logical page groups.`);

    console.log('3. Building Country Configuration...');
    const countryConfigs = await buildCountryConfig(groups);

    console.log('4. Writing Output...');

    // Transform array to object keyed by countryCode
    const outputObject: Record<string, any> = {};
    for (const config of countryConfigs) {
        outputObject[config.countryCode] = config;
    }

    const outputPath = path.resolve(process.cwd(), 'country-config.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputObject, null, 2));

    console.log(`Success! Configuration written to ${outputPath}`);
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
