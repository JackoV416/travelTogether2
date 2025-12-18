const RSS2JSON_ENDPOINT = 'https://api.rss2json.com/v1/api.json';
const CACHE_KEY_PREFIX = 'tt_news_cache_v2_'; // Bump version to force refresh
const CACHE_TTL = 30 * 60 * 1000; // Reduce to 30 mins for testing

/**
 * Fetch news from Yahoo RSS via rss2json
 * @param {string} location - Name of the city or country
 * @param {string} lang - 'en' or 'zh-TW' (affects query mostly)
 * @returns {Promise<Array>} - Array of news items
 */
export const fetchNews = async (location, lang = 'zh-TW') => {
    try {
        if (!location) return [];

        // Check Cache
        const cacheKey = `${CACHE_KEY_PREFIX}${location}_${lang}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                console.log('News served from cache');
                return data;
            }
        }

        // Construct RSS URL
        // Google News RSS (Better for localized/Chinese content)
        // Query: Location + Travel/Tourism
        const query = lang === 'zh-TW' ? `${location} 旅遊` : `${location} travel`;
        console.log(`Fetching News for: ${location} (Query: ${query})`);

        // Use Google News RSS for HK/TW region
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=zh-TW&gl=HK&ceid=HK:zh-Hant`;

        // Fetch from rss2json
        const response = await fetch(`${RSS2JSON_ENDPOINT}?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();

        console.log('RSS2JSON Response:', data);

        if (data.status === 'ok') {
            const newsItems = data.items.map(item => ({
                id: item.guid || item.link,
                title: item.title,
                url: item.link,
                source: 'Google News',
                time: new Date(item.pubDate).toLocaleDateString(),
                summary: item.description?.replace(/<[^>]+>/g, '')?.replace('Google 新聞', '')?.slice(0, 100) + '...', // Strip HTML
                image: item.enclosure?.link || item.thumbnail || null
            })).slice(0, 4); // Limit to 4 items

            // Save to Cache
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: newsItems
            }));

            return newsItems;
        } else {
            console.warn('RSS2JSON error:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
};

/**
 * Fallback static news for dev/offline
 */
export const FALLBACK_NEWS = [
    {
        id: '1',
        title: 'Yahoo News API 連接中...',
        url: '#',
        source: 'System',
        time: 'Now',
        summary: '正在嘗試連接 Yahoo RSS feed...'
    }
];
