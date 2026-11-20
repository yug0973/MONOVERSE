import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_DIR = 'D:/CARRER PROJECTS/MONOVERSE/IMAGES/aarohan_assets_renamed/aarohan_assets';
const OUTPUT_DIR = path.resolve('public/assets');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'assets.manifest.json');

// Configuration rules per project specification
const CONFIG = {
  webpQuality: 80,
  stills: {
    desktopMaxWidth: 2560,
    mobileMaxWidth: 1280,
  },
  panoramas: {
    desktopMaxWidth: 4096,
    mobileMaxWidth: 2048,
  },
};

/**
 * Ensures target directory exists recursively
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Scan directory recursively for image files
 */
function scanFiles(dir, base = '') {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('_spare')) continue; // Ignore _spare per specification
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(scanFiles(fullPath, relPath));
    } else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) {
      results.push({ fullPath, relPath: relPath.replace(/\\/g, '/') });
    }
  }
  return results;
}

async function runAssetPipeline() {
  console.log('===========================================================');
  console.log(' AAROHAN RESIDENCES — PRODUCTION ASSET PIPELINE (MODULE 1)');
  console.log('===========================================================');
  console.log(`Source Directory: ${SOURCE_DIR}`);
  console.log(`Target Directory: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`ERROR: Source directory does not exist: ${SOURCE_DIR}`);
    process.exit(1);
  }

  ensureDir(OUTPUT_DIR);
  ensureDir(path.join(OUTPUT_DIR, 'desktop'));
  ensureDir(path.join(OUTPUT_DIR, 'mobile'));

  const files = scanFiles(SOURCE_DIR);
  console.log(`Found ${files.length} candidate image files in primary directories (excluding _spare).\n`);

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceDir: SOURCE_DIR,
    panoramasNote:
      'Panoramas are native 1774x887 (2:1). Preserved without artificial upscaling to avoid interpolation artifacts.',
    assets: {},
  };

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const file of files) {
    const isPano = file.relPath.includes('panorama') || file.relPath.startsWith('pano_');
    const relBase = file.relPath.replace(/\.[^/.]+$/, '');
    const category = file.relPath.split('/')[0];
    const filename = path.basename(file.relPath, path.extname(file.relPath));

    const originalStats = fs.statSync(file.fullPath);
    totalOriginalBytes += originalStats.size;

    const originalMeta = await sharp(file.fullPath).metadata();
    const origW = originalMeta.width || 0;
    const origH = originalMeta.height || 0;
    const aspectRatio = origH > 0 ? parseFloat((origW / origH).toFixed(4)) : 1.7778;

    // Desktop target
    const desktopRelDir = path.dirname(path.join('desktop', file.relPath));
    ensureDir(path.join(OUTPUT_DIR, desktopRelDir));
    const desktopFileName = `${filename}.webp`;
    const desktopOutPath = path.join(OUTPUT_DIR, desktopRelDir, desktopFileName);
    const desktopPublicPath = `/assets/${desktopRelDir.replace(/\\/g, '/')}/${desktopFileName}`;

    const desktopMaxW = isPano ? CONFIG.panoramas.desktopMaxWidth : CONFIG.stills.desktopMaxWidth;
    const desktopSharp = sharp(file.fullPath);
    if (origW > desktopMaxW) {
      desktopSharp.resize({ width: desktopMaxW, withoutEnlargement: true });
    }
    await desktopSharp.webp({ quality: CONFIG.webpQuality, effort: 6 }).toFile(desktopOutPath);
    const desktopStats = fs.statSync(desktopOutPath);
    const desktopMeta = await sharp(desktopOutPath).metadata();
    totalOptimizedBytes += desktopStats.size;

    // Mobile target
    const mobileRelDir = path.dirname(path.join('mobile', file.relPath));
    ensureDir(path.join(OUTPUT_DIR, mobileRelDir));
    const mobileFileName = `${filename}.webp`;
    const mobileOutPath = path.join(OUTPUT_DIR, mobileRelDir, mobileFileName);
    const mobilePublicPath = `/assets/${mobileRelDir.replace(/\\/g, '/')}/${mobileFileName}`;

    const mobileMaxW = isPano ? CONFIG.panoramas.mobileMaxWidth : CONFIG.stills.mobileMaxWidth;
    const mobileSharp = sharp(file.fullPath);
    // For mobile stills, resize to 1280; for panoramas, keep within 2048 without upscale
    if (origW > mobileMaxW) {
      mobileSharp.resize({ width: mobileMaxW, withoutEnlargement: true });
    } else if (!isPano && origW > 1280) {
      mobileSharp.resize({ width: 1280, withoutEnlargement: true });
    }
    await mobileSharp.webp({ quality: CONFIG.webpQuality, effort: 6 }).toFile(mobileOutPath);
    const mobileStats = fs.statSync(mobileOutPath);
    const mobileMeta = await sharp(mobileOutPath).metadata();
    totalOptimizedBytes += mobileStats.size;

    manifest.assets[relBase] = {
      id: relBase,
      category,
      name: filename,
      isPanorama: isPano,
      aspectRatio,
      original: {
        width: origW,
        height: origH,
        bytes: originalStats.size,
        format: originalMeta.format,
      },
      desktop: {
        path: desktopPublicPath,
        width: desktopMeta.width,
        height: desktopMeta.height,
        bytes: desktopStats.size,
        sizeKb: parseFloat((desktopStats.size / 1024).toFixed(1)),
      },
      mobile: {
        path: mobilePublicPath,
        width: mobileMeta.width,
        height: mobileMeta.height,
        bytes: mobileStats.size,
        sizeKb: parseFloat((mobileStats.size / 1024).toFixed(1)),
      },
    };

    console.log(
      `✓ Processed: ${file.relPath.padEnd(38)} [${origW}x${origH}] -> WebP Desktop (${(desktopStats.size / 1024).toFixed(1)} KB) | Mobile (${(mobileStats.size / 1024).toFixed(1)} KB)`
    );
  }

  // Save assets.manifest.json in public/assets
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\n→ Saved manifest to: ${MANIFEST_PATH}`);

  // Also write a copy to src/config/assets.manifest.json for clean type-safe imports in code
  const srcConfigDir = path.resolve('src/config');
  ensureDir(srcConfigDir);
  const srcManifestPath = path.join(srcConfigDir, 'assets.manifest.json');
  fs.writeFileSync(srcManifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`→ Mirrored manifest to: ${srcManifestPath}`);

  const origMb = (totalOriginalBytes / 1024 / 1024).toFixed(2);
  const optMb = (totalOptimizedBytes / 1024 / 1024).toFixed(2);
  const reduction = ((1 - totalOptimizedBytes / (totalOriginalBytes * 2)) * 100).toFixed(1);

  console.log('\n===========================================================');
  console.log(`Pipeline Summary:`);
  console.log(`Total Original PNG: ${origMb} MB`);
  console.log(`Total Optimized WebP (Desktop + Mobile combined): ${optMb} MB`);
  console.log(`Total Bandwidth Reduction: ~${reduction}%`);
  console.log('===========================================================');

  console.warn('\n***********************************************************');
  console.warn(' TECHNICAL ARTIST NOTICE (PER SPECIFICATION):');
  console.warn(' The living room panoramas are native 1774x887 px.');
  console.warn(' When mapped into a 360-degree equirectangular viewer on');
  console.warn(' 1080p and higher displays, they will exhibit visible softness.');
  console.warn(' Per project rules, we do NOT fake resolution with heavy');
  console.warn(' upscaling or synthetic sharpening filters.');
  console.warn('***********************************************************\n');
}

runAssetPipeline().catch((err) => {
  console.error('Fatal Asset Pipeline Error:', err);
  process.exit(1);
});
