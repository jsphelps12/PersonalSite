// File and git helpers for the posting server. Everything here works on the
// site repo this file lives in, never on the caller's working directory.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONTENT = 'src/content';

/** Today in the local timezone, as YYYY-MM-DD. */
export function today() {
  return new Date().toLocaleDateString('en-CA');
}

export function slugify(text: string, maxWords = 8) {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/['\u2019]/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .trim()
      .split(/\s+/)
      .slice(0, maxWords)
      .join('-') || 'untitled'
  );
}

/** A repo-relative path that doesn't exist yet: base.md, base-2.md, ... */
export function freePath(dir: string, base: string, ext = '.md') {
  for (let n = 1; ; n++) {
    const rel = path.join(dir, `${base}${n === 1 ? '' : `-${n}`}${ext}`);
    if (!existsSync(path.join(ROOT, rel))) return rel;
  }
}

export function exists(rel: string) {
  return existsSync(path.join(ROOT, rel));
}

export function writeEntry(rel: string, frontmatter: Record<string, unknown>, body = '') {
  const file = path.join(ROOT, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  const yaml = stringify(frontmatter, { lineWidth: 0 }).trimEnd();
  writeFileSync(file, `---\n${yaml}\n---\n${body ? `\n${body.trim()}\n` : ''}`);
}

export function readEntry(rel: string) {
  const raw = readFileSync(path.join(ROOT, rel), 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${rel} has no frontmatter`);
  return { data: (parse(match[1]) ?? {}) as Record<string, unknown>, body: match[2].trim() };
}

/** Repo-relative path of an entry, whether it's .md or .mdx. */
export function findEntry(collection: string, id: string) {
  for (const ext of ['.md', '.mdx']) {
    const rel = path.join(CONTENT, collection, `${id}${ext}`);
    if (exists(rel)) return rel;
  }
  return undefined;
}

export function listEntries(collection: string) {
  const dir = path.join(ROOT, CONTENT, collection);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => ({ id: f.replace(/\.mdx?$/, ''), rel: path.join(CONTENT, collection, f) }));
}

export function writeJson(rel: string, data: unknown) {
  writeFileSync(path.join(ROOT, rel), `${JSON.stringify(data, null, 2)}\n`);
}

export function readJson(rel: string) {
  return JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));
}

function git(...args: string[]) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

/** Commit exactly these paths, leaving anything else in the tree alone. */
export function commit(paths: string[], message: string) {
  git('add', '--', ...paths);
  git('commit', '-m', message, '--', ...paths);
  return git('rev-parse', '--short', 'HEAD');
}

export function currentBranch() {
  return git('rev-parse', '--abbrev-ref', 'HEAD');
}

/** Commits on HEAD that origin doesn't have yet. */
export function unpushed() {
  git('fetch', '--quiet', 'origin');
  const log = git('log', '--oneline', '@{upstream}..HEAD');
  return log ? log.split('\n') : [];
}

export function push() {
  git('push', '--quiet', 'origin', 'HEAD');
}
