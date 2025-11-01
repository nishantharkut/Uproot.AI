import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { search, searchNews } from '../src/lib/googleSearch.js';

async function run() {
  console.log('Testing SerpAPI connectivity...');
  console.log('Working dir:', process.cwd());
  console.log('Loaded SERP_API_KEY present?:', !!process.env.SERP_API_KEY);
  try {
    const res = await search('software engineering jobs salary india 2025 payscale', 3, { gl: 'in' });
    console.log('Search results:', res.map(r => ({ title: r.title, link: r.link })));

    const news = await searchNews('software engineering industry india 2025 market trends', 3, { gl: 'in' });
    console.log('News results:', news.map(n => ({ title: n.title, link: n.link })));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

run();
