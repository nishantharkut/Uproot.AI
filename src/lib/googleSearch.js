import { getJson } from 'serpapi';

// Use the env var defined in the repo's .env: SERP_API_KEY
const API_KEY = process.env.SERP_API_KEY;

async function search(query, num = 3, opts = {}) {
  try {
    const params = {
      engine: 'google',
      q: query,
      api_key: API_KEY,
      num,
      hl: opts.hl || 'en',
      ...opts,
    };

    const res = await getJson(params);
    const organic = res.organic_results || [];
    if (organic.length) {
      return organic.slice(0, num).map((r) => ({
        title: r.title,
        snippet: r.snippet || (r.rich_snippet?.top?.text || ''),
        link: r.link,
        source: r.source || (r.link ? new URL(r.link).hostname : ''),
      }));
    }

    if (res.inline_results) {
      return res.inline_results.slice(0, num).map((r) => ({
        title: r.title || '',
        snippet: r.snippet || '',
        link: r.link || '',
        source: r.source || '',
      }));
    }

    return [];
  } catch (err) {
    console.error('SerpAPI search error:', err.message || err);
    return [];
  }
}

async function searchNews(query, num = 5, opts = {}) {
  try {
    const params = {
      engine: 'google_news',
      q: query,
      api_key: API_KEY,
      num,
      hl: opts.hl || 'en',
      ...opts,
    };

    const res = await getJson(params);
    const news = res.news_results || [];
    return news.slice(0, num).map((n) => ({
      title: n.title || '',
      snippet: n.snippet || n.abstract || '',
      link: n.link || n.source || '',
      source: n.source || (n.link ? new URL(n.link).hostname : ''),
    }));
  } catch (err) {
    console.error('SerpAPI news search error:', err.message || err);
    return [];
  }
}

export { search, searchNews };
