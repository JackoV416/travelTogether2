import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://travel-together-2.web.app';
const PUBLIC_DIR = path.join(__dirname, '../public');

const routes = [
    '/',
    '/?view=tutorial',
    '/?view=profile'
];

const generateSitemap = () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${routes.map(route => `
    <url>
        <loc>${DOMAIN}${route.replace('/?', '?')}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${route === '/' ? '1.0' : '0.8'}</priority>
    </url>
    `).join('')}
</urlset>`;

    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);
    console.log('✅ Generated sitemap.xml in public directory');
};

generateSitemap();
