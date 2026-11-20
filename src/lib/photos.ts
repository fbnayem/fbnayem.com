// Drop photos into public/photos/ and they appear automatically on the next build:
//   portrait.(jpg|jpeg|png|webp)  -> homepage hero and About page header
//   working.(jpg|jpeg|png|webp)   -> About page "how I work" photo
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'public', 'photos');
const exts = ['webp', 'jpg', 'jpeg', 'png', 'avif'];

export function photo(name: 'portrait' | 'working'): string | null {
  for (const ext of exts) {
    if (fs.existsSync(path.join(dir, `${name}.${ext}`))) return `/photos/${name}.${ext}`;
  }
  return null;
}
