#!/usr/bin/env node
import { loadSitemapRich } from './sitemap/loadSitemap';
import { groupPages } from './sitemap/groupPages';
import { buildCountryConfig } from './build/buildCountryConfig';
import axios from 'axios';

// Set default User-Agent
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const args = process.argv.slice(2);
    const sitemapArgIndex = args.findIndex(arg => arg === '--sitemap' || arg === '-s');

    if (sitemapArgIndex === -1 || sitemapArgIndex + 1 >= args.length) {
        console.error('Usage: node cli.js --sitemap <url>');
        process.exit(1);
    }

    const sitemapUrl = args[sitemapArgIndex + 1];

    console.log('--- Schema Markup CLI Tool ---');
    console.log('1. Loading Sitemap...');
    const parsedUrls = await loadSitemapRich(sitemapUrl);

    console.log('2. Grouping Pages...');
    const groups = groupPages(parsedUrls);
    console.log(`   Identified ${groups.length} logical page groups.`);

    console.log('3. Building Country Configuration...');
    const countryConfigs = await buildCountryConfig(groups);

    console.log('4. Writing Output...');
    const outputPath = path.resolve(process.cwd(), 'country-config.json');
    fs.writeFileSync(outputPath, JSON.stringify(countryConfigs, null, 2));

    console.log(`Success! Configuration written to ${outputPath}`);
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
