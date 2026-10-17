// Photo prep for posts: orient, resize and re-encode as JPEG with all metadata
// (EXIF, GPS) dropped, so originals straight off a phone are safe to commit.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT, freePath, slugify } from './repo.ts';

const MAX_EDGE = 2000;
const IMAGE = /\.(jpe?g|png|webp|avif|tiff?|heic|heif)$/i;
// sharp's prebuilt libvips can't decode HEIC, so those go through macOS sips first.
const NEEDS_SIPS = /\.(heic|heif)$/i;

export function expandHome(p: string) {
  return p === '~' || p.startsWith('~/') ? path.join(os.homedir(), p.slice(1)) : p;
}

/** Image files in a folder, sorted by name. */
export function listImages(folder: string) {
  return readdirSync(folder)
    .filter((f) => IMAGE.test(f) && !f.startsWith('.'))
    .sort();
}

export interface Prepared {
  rel: string;
  from: string;
  width: number;
  height: number;
  kb: number;
}

/**
 * Process one image into `destDir` (repo-relative) as `<name>.jpg`, never
 * overwriting: a taken name becomes name-2.jpg and so on.
 */
export async function preparePhoto(src: string, destDir: string, name: string): Promise<Prepared> {
  let input = src;
  let tmp: string | undefined;
  if (NEEDS_SIPS.test(src)) {
    tmp = mkdtempSync(path.join(os.tmpdir(), 'site-photo-'));
    input = path.join(tmp, 'converted.jpg');
    execFileSync('sips', ['-s', 'format', 'jpeg', src, '--out', input], { stdio: 'ignore' });
  }
  try {
    const rel = freePath(destDir, slugify(name, 6), '.jpg');
    mkdirSync(path.join(ROOT, destDir), { recursive: true });
    // rotate() applies the EXIF orientation; sharp writes no metadata unless asked.
    const info = await sharp(input)
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(ROOT, rel));
    return { rel, from: path.basename(src), width: info.width, height: info.height, kb: Math.round(info.size / 1024) };
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
  }
}

export function assertFolder(folder: string) {
  if (!path.isAbsolute(folder)) throw new Error(`Give the photo folder as an absolute path or ~/..., not ${folder}`);
  if (!existsSync(folder)) throw new Error(`No folder at ${folder}`);
}
