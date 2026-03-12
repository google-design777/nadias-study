// Fetch posts from Sanity during Eleventy build.
// Requires env vars:
//   SANITY_PROJECT_ID=...
//   SANITY_DATASET=production
//   SANITY_API_VERSION=YYYY-MM-DD

const dotenv = require('dotenv');
dotenv.config();

const { createClient } = require('@sanity/client');

module.exports = async function () {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || 'production';
  const apiVersion = process.env.SANITY_API_VERSION || '2026-03-12';

  if (!projectId) {
    // Fail soft locally, but make it obvious.
    console.warn('[sanityPosts] Missing SANITY_PROJECT_ID; returning empty list.');
    return [];
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
  });

  const query = `*[_type == "post" && defined(slug.current)]|order(coalesce(publishedAt, date) desc){
    title,
    "slug": slug.current,
    date,
    publishedAt,
    pinned,
    mood,
    tags,
    excerpt,
    body
  }`;

  const posts = await client.fetch(query);

  // Normalize
  return (posts || []).map((p) => ({
    title: p.title || '',
    slug: p.slug,
    date: p.publishedAt || p.date || null,
    pinned: !!p.pinned,
    mood: p.mood || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    excerpt: p.excerpt || '',
    body: p.body || [],
  }));
};
