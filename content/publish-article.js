#!/usr/bin/env node
/**
 * Publish ONE article from content/articles/*.md straight into Sanity.
 *
 *   node content/publish-article.js 14-student-visa-refusal-bangladesh.md [--dry]
 *
 * Why this exists instead of content/build-ndjson.js:
 *
 * build-ndjson.js rebuilds every article, emits author documents with the old
 * hardcoded names, and the documented import uses --replace. Running it today
 * would overwrite author-saiful-alam (which now holds "Mohammad Shahriar")
 * back to "Saiful Alam", and create draft copies of all 13 live posts.
 *
 * This script only ever writes a single post document. It refuses to run if the
 * author or category it references does not already exist, so it can never
 * clobber them, and it uses createIfNotExists so it will not silently overwrite
 * a post someone edited in the Studio (pass --force to replace instead).
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECT = 'yjw01pkk';
const DATASET = 'production';
const API = `https://${PROJECT}.api.sanity.io/v2024-01-01`;

function token() {
  try {
    return JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config/sanity/config.json'), 'utf8')).authToken;
  } catch { return null; }
}

// ---- markdown -> portable text (same shapes build-ndjson.js produces) ----
function parse(raw) {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!m) throw new Error('Missing frontmatter');
  const meta = {};
  m[1].split('\n').forEach((line) => {
    const i = line.indexOf(':');
    if (i > -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  return {meta, body: m[2].trim()};
}
function makeKeygen() { let n = 0; return () => 'k' + (n++).toString(36); }
function inline(text, keygen) {
  const children = []; const markDefs = [];
  const push = (t, marks = []) => { if (t) children.push({_type: 'span', _key: keygen(), text: t, marks}); };
  const re = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) push(text.slice(last, m.index));
    if (m[1]) push(m[2], ['strong']);
    else { const k = keygen(); markDefs.push({_type: 'link', _key: k, href: m[5]}); push(m[4], [k]); }
    last = re.lastIndex;
  }
  if (last < text.length) push(text.slice(last));
  if (!children.length) push('');
  return {children, markDefs};
}
function mdToPt(md, keygen) {
  const blocks = []; let para = [];
  const flush = () => {
    if (!para.length) return;
    const {children, markDefs} = inline(para.join(' ').trim(), keygen);
    blocks.push({_type: 'block', _key: keygen(), style: 'normal', markDefs, children});
    para = [];
  };
  for (const raw of md.split('\n')) {
    const line = raw.trim(); let m;
    if (!line) flush();
    else if ((m = /^###\s+(.*)/.exec(line))) { flush(); blocks.push({_type: 'block', _key: keygen(), style: 'h3', ...inline(m[1], keygen)}); }
    else if ((m = /^##\s+(.*)/.exec(line))) { flush(); blocks.push({_type: 'block', _key: keygen(), style: 'h2', ...inline(m[1], keygen)}); }
    else if ((m = /^>\s+(.*)/.exec(line))) { flush(); blocks.push({_type: 'block', _key: keygen(), style: 'blockquote', ...inline(m[1], keygen)}); }
    else if ((m = /^[-*]\s+(.*)/.exec(line))) { flush(); blocks.push({_type: 'block', _key: keygen(), style: 'normal', listItem: 'bullet', level: 1, ...inline(m[1], keygen)}); }
    else if ((m = /^\d+\.\s+(.*)/.exec(line))) { flush(); blocks.push({_type: 'block', _key: keygen(), style: 'normal', listItem: 'number', level: 1, ...inline(m[1], keygen)}); }
    else para.push(line);
  }
  flush();
  return blocks;
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function query(q, tok) {
  const res = await fetch(`${API}/data/query/${DATASET}?query=${encodeURIComponent(q)}`,
    {headers: tok ? {Authorization: `Bearer ${tok}`} : {}});
  if (!res.ok) throw new Error(`query failed: ${res.status} ${await res.text()}`);
  return (await res.json()).result;
}

(async () => {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const force = args.includes('--force');
  const file = args.find((a) => a.endsWith('.md'));
  if (!file) { console.error('usage: node content/publish-article.js <file.md> [--dry] [--force]'); process.exit(1); }

  const tok = token();
  if (!tok && !dry) { console.error('No Sanity CLI token found. Run: npx sanity login'); process.exit(1); }

  const {meta, body} = parse(fs.readFileSync(path.join(__dirname, 'articles', file), 'utf8'));
  for (const k of ['title', 'slug', 'excerpt', 'category']) {
    if (!meta[k]) { console.error(`frontmatter is missing "${k}"`); process.exit(1); }
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.slug)) {
    console.error(`slug "${meta.slug}" must be lowercase-hyphenated`); process.exit(1);
  }

  const authorId = meta.authorId;
  if (!authorId) { console.error('frontmatter is missing "authorId"'); process.exit(1); }
  const catId = `category-${slugify(meta.category)}`;
  const postId = `post-${meta.slug}`;

  // Never create or overwrite authors/categories. Fail loudly instead.
  const existing = await query(
    `{"author": *[_id=="${authorId}"][0]{_id,name}, "cat": *[_id=="${catId}"][0]{_id,title}, "post": *[_id=="${postId}"][0]{_id}, "slugTaken": *[_type=="post" && slug.current=="${meta.slug}" && _id!="${postId}"][0]{_id}}`, tok);
  if (!existing.author) { console.error(`author "${authorId}" does not exist in Sanity. Create it in the Studio first.`); process.exit(1); }
  if (!existing.cat) { console.error(`category "${catId}" does not exist. Create it in the Studio, or match an existing category name.`); process.exit(1); }
  if (existing.slugTaken) { console.error(`slug "${meta.slug}" is already used by ${existing.slugTaken._id}`); process.exit(1); }
  if (existing.post && !force) { console.error(`${postId} already exists. Re-run with --force to replace it.`); process.exit(1); }

  const keygen = makeKeygen();
  const doc = {
    _id: postId,
    _type: 'post',
    title: meta.title,
    slug: {_type: 'slug', current: meta.slug},
    excerpt: meta.excerpt,
    publishedAt: meta.publishedAt || new Date().toISOString(),
    author: {_type: 'reference', _ref: authorId},
    categories: [{_type: 'reference', _key: 'c0', _ref: catId}],
    body: mdToPt(body, keygen),
    seo: {_type: 'object', title: meta.seoTitle || '', description: meta.seoDescription || ''},
  };

  console.log(`  post:     ${postId}`);
  console.log(`  title:    ${meta.title}`);
  console.log(`  author:   ${existing.author.name.trim()} (${authorId})`);
  console.log(`  category: ${existing.cat.title}`);
  console.log(`  blocks:   ${doc.body.length}`);
  console.log(`  cover:    none yet, add mainImage in the Studio`);

  if (dry) { console.log('\n  --dry, nothing written'); return; }

  const mutation = force ? {createOrReplace: doc} : {createIfNotExists: doc};
  const res = await fetch(`${API}/data/mutate/${DATASET}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${tok}`},
    body: JSON.stringify({mutations: [mutation]}),
  });
  const out = await res.json();
  if (!res.ok) { console.error(`\n  mutation failed: ${res.status} ${JSON.stringify(out)}`); process.exit(1); }
  console.log(`\n  published. ${JSON.stringify(out.results || out)}`);
})();
