import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function download() {
  const dir = 'public/textures/pbr/plaster';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const zipPath = path.join(dir, 'plaster.zip');
  const file = fs.createWriteStream(zipPath);

  const url = 'https://acg-download.struffelproductions.com/file/ambientCG-Web/download/Plaster001_SLyYfa9J/Plaster001_1K-JPG.zip';
  console.log('Downloading ambientCG Plaster001...');

  await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });

  console.log('Download complete. Extracting with tar...');
  execSync(`tar -xf "${zipPath}" -C "${dir}"`);
  console.log('Extracted files:', fs.readdirSync(dir));
  fs.unlinkSync(zipPath);
  console.log('Done.');
}

download().catch(console.error);
