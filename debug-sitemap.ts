
import { loadSitemapRich } from './src/sitemap/loadSitemap';

async function debug() {
    const urls = await loadSitemapRich('https://www.smallerearth.com/sitemap.xml');
    console.log(`Total URLs: ${urls.length}`);
    if (urls.length > 0) {
        console.log('First URL:', JSON.stringify(urls[0], null, 2));
        const withAlternates = urls.find(u => u.alternates && u.alternates.length > 0);
        if (withAlternates) {
            console.log('URL with alternates:', JSON.stringify(withAlternates, null, 2));
        } else {
            console.log('No URLs with alternates found.');
        }
    }
}

debug().catch(console.error);
