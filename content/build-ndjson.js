#!/usr/bin/env node
/**
 * Reads content/articles/*.md (frontmatter + markdown), converts the body to
 * Sanity Portable Text, and writes content/posts.ndjson:
 *   - 1 author  (published, placeholder — rename in Studio)
 *   - N categories (published)
 *   - one post per article as a DRAFT (drafts.* — review then publish in Studio)
 *
 * Then import from the studio folder:
 *   cd /Users/eskimibd/studio-rizeup-global
 *   npx sanity dataset import /Users/eskimibd/rizeup\ new\ white/content/posts.ndjson production --replace
 */
const fs = require('fs');
const path = require('path');

// Real counsellors. (Photos to be added in the Studio.)
const AUTHORS = [
  {
    _id: 'author-saiful-alam', _type: 'author', name: 'Saiful Alam',
    slug: {_type: 'slug', current: 'saiful-alam'}, role: 'Senior Counselor',
    bio: 'Senior counsellor at RizeUp Global, helping Bangladeshi students study abroad. University of Lincoln.',
    credentials: ['University of Lincoln'],
  },
  {
    _id: 'author-tufayel-hossain', _type: 'author', name: 'Tufayel Hossain',
    slug: {_type: 'slug', current: 'tufayel-hossain'}, role: 'Senior Counselor',
    bio: 'Senior counsellor at RizeUp Global, helping Bangladeshi students study abroad. Bangladesh University of Professionals.',
    credentials: ['Bangladesh University of Professionals'],
  },
  {
    _id: 'author-israt-jahan', _type: 'author', name: 'Israt Jahan',
    slug: {_type: 'slug', current: 'israt-jahan'}, role: 'Counselor',
    bio: 'Counsellor at RizeUp Global, helping Bangladeshi students study abroad. International Islamic University Chittagong.',
    credentials: ['International Islamic University Chittagong'],
  },
];

const dir = path.join(__dirname, 'articles');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();

function parse(raw) {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!m) throw new Error('Missing frontmatter');
  const meta = {};
  m[1].split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx > -1) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  });
  return {meta, body: m[2].trim()};
}

function makeKeygen() { let n = 0; return () => 'k' + (n++).toString(36); }

function inline(text, keygen) {
  const children = [];
  const markDefs = [];
  const push = (t, marks = []) => { if (t) children.push({_type: 'span', _key: keygen(), text: t, marks}); };
  const re = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) push(text.slice(last, m.index));
    if (m[1]) push(m[2], ['strong']);
    else { const key = keygen(); markDefs.push({_type: 'link', _key: key, href: m[5]}); push(m[4], [key]); }
    last = re.lastIndex;
  }
  if (last < text.length) push(text.slice(last));
  if (!children.length) push('');
  return {children, markDefs};
}

function mdToPt(md, keygen) {
  const blocks = [];
  let para = [];
  const flush = () => {
    if (!para.length) return;
    const {children, markDefs} = inline(para.join(' ').trim(), keygen);
    blocks.push({_type: 'block', _key: keygen(), style: 'normal', markDefs, children});
    para = [];
  };
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    let m;
    if (!line) { flush(); }
    else if ((m = /^###\s+(.*)/.exec(line))) { flush(); const x = inline(m[1], keygen); blocks.push({_type: 'block', _key: keygen(), style: 'h3', ...x}); }
    else if ((m = /^##\s+(.*)/.exec(line))) { flush(); const x = inline(m[1], keygen); blocks.push({_type: 'block', _key: keygen(), style: 'h2', ...x}); }
    else if ((m = /^>\s+(.*)/.exec(line))) { flush(); const x = inline(m[1], keygen); blocks.push({_type: 'block', _key: keygen(), style: 'blockquote', ...x}); }
    else if ((m = /^[-*]\s+(.*)/.exec(line))) { flush(); const x = inline(m[1], keygen); blocks.push({_type: 'block', _key: keygen(), style: 'normal', listItem: 'bullet', level: 1, ...x}); }
    else if ((m = /^\d+\.\s+(.*)/.exec(line))) { flush(); const x = inline(m[1], keygen); blocks.push({_type: 'block', _key: keygen(), style: 'normal', listItem: 'number', level: 1, ...x}); }
    else para.push(line);
  }
  flush();
  return blocks;
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cats = new Map();
const out = [];

files.forEach((f, i) => {
  const {meta, body} = parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const catName = meta.category || 'Study Abroad';
  const catSlug = slugify(catName);
  if (!cats.has(catSlug)) {
    cats.set(catSlug, {_id: `category-${catSlug}`, _type: 'category', title: catName, slug: {_type: 'slug', current: catSlug}});
  }
  const author = AUTHORS[i % AUTHORS.length]; // round-robin across counsellors
  const keygen = makeKeygen();
  out.push({
    _id: `drafts.post-${meta.slug}`,
    _type: 'post',
    title: meta.title,
    slug: {_type: 'slug', current: meta.slug},
    excerpt: meta.excerpt || '',
    author: {_type: 'reference', _ref: author._id},
    categories: [{_type: 'reference', _key: 'c0', _ref: `category-${catSlug}`}],
    body: mdToPt(body, keygen),
    seo: {_type: 'object', title: meta.seoTitle || '', description: meta.seoDescription || ''},
  });
});

const all = [...AUTHORS, ...cats.values(), ...out];
fs.writeFileSync(path.join(__dirname, 'posts.ndjson'), all.map((d) => JSON.stringify(d)).join('\n') + '\n');
console.error(`Wrote ${all.length} docs (${out.length} posts, ${cats.size} categories, ${AUTHORS.length} authors) -> content/posts.ndjson`);
