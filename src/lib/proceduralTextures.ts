import * as THREE from 'three';
import { FlooringId } from '../types/customizer';

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates ultra-high-resolution procedural PBR textures (2048x2048) in memory via HTML5 Canvas.
 * Generates photorealistic marble veining, chevron herringbone, natural oak grain, and cleft slate.
 * Zero external asset dependencies, 100% instant rendering.
 */
export function getProceduralFloorTexture(flooringId: FlooringId): THREE.CanvasTexture {
  if (textureCache.has(flooringId)) {
    return textureCache.get(flooringId)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  switch (flooringId) {
    case 'warm_oak':
      renderOakTexture(ctx, 2048, 2048);
      break;
    case 'light_marble':
      renderMarbleTexture(ctx, 2048, 2048);
      break;
    case 'dark_slate':
      renderSlateTexture(ctx, 2048, 2048);
      break;
    case 'herringbone':
      renderHerringboneTexture(ctx, 2048, 2048);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  textureCache.set(flooringId, texture);
  return texture;
}

/**
 * Procedural Teak Decking Texture for balconies and podium pool deck
 */
export function getTeakDeckTexture(): THREE.CanvasTexture {
  const key = 'teak_deck';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#8E6746';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankH = 1024 / 16;
    for (let i = 0; i < 16; i++) {
      const y = i * plankH;
      const shade = Math.sin(i * 2.3) * 10;
      ctx.fillStyle = `rgb(${142 + shade}, ${103 + shade * 0.75}, ${70 + shade * 0.5})`;
      ctx.fillRect(0, y, 1024, plankH - 3);

      // Fine grain
      ctx.fillStyle = 'rgba(70, 45, 25, 0.08)';
      for (let g = 0; g < 15; g++) {
        const gy = y + Math.random() * plankH;
        ctx.fillRect(0, gy, 1024, 1 + Math.random() * 2);
      }

      // Dark joint caulking
      ctx.fillStyle = '#2A1C12';
      ctx.fillRect(0, y + plankH - 3, 1024, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
}

function renderOakTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Rich natural European Oak base
  ctx.fillStyle = '#C89F70';
  ctx.fillRect(0, 0, w, h);

  const numPlanks = 10;
  const plankHeight = h / numPlanks;

  for (let i = 0; i < numPlanks; i++) {
    const y = i * plankHeight;
    // Plank-to-plank subtle color tone variance
    const toneMod = Math.sin(i * 1.9) * 16;
    ctx.fillStyle = `rgb(${198 + toneMod}, ${156 + toneMod * 0.8}, ${108 + toneMod * 0.6})`;
    ctx.fillRect(0, y, w, plankHeight - 4);

    // Fine wood grain growth rings
    ctx.strokeStyle = 'rgba(110, 75, 40, 0.07)';
    ctx.lineWidth = 1.5;
    for (let g = 0; g < 28; g++) {
      const gy = y + (g / 28) * plankHeight;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      for (let x = 0; x <= w; x += 100) {
        const wave = Math.sin((x + i * 200) * 0.008) * 4;
        ctx.lineTo(x, gy + wave);
      }
      ctx.stroke();
    }

    // Occasional subtle wood knots
    if (i % 3 === 0) {
      const knotX = (w * 0.35 + i * 140) % (w - 100);
      const knotY = y + plankHeight * 0.5;
      const knotGrad = ctx.createRadialGradient(knotX, knotY, 3, knotX, knotY, 18);
      knotGrad.addColorStop(0, 'rgba(90, 55, 30, 0.35)');
      knotGrad.addColorStop(1, 'rgba(90, 55, 30, 0)');
      ctx.fillStyle = knotGrad;
      ctx.beginPath();
      ctx.ellipse(knotX, knotY, 22, 10, Math.PI / 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Beveled V-groove seam between planks
    ctx.fillStyle = '#5A3D22';
    ctx.fillRect(0, y + plankHeight - 4, w, 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, y, w, 1);
  }

  // Staggered vertical butt seams
  ctx.fillStyle = '#5A3D22';
  for (let i = 0; i < numPlanks; i++) {
    const y = i * plankHeight;
    const offset = ((i * 3) % 4) * (w / 4);
    ctx.fillRect(offset, y, 4, plankHeight);
  }
}

function renderMarbleTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Pristine Banswara White Marble base
  ctx.fillStyle = '#FAF9F6';
  ctx.fillRect(0, 0, w, h);

  // Soft cloudy atmospheric depth
  for (let c = 0; c < 8; c++) {
    const cx = (Math.sin(c * 1.5) * 0.5 + 0.5) * w;
    const cy = (Math.cos(c * 1.2) * 0.5 + 0.5) * h;
    const rad = 300 + c * 50;
    const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, rad);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(238, 233, 224, 0.45)');
    grad.addColorStop(1, 'rgba(230, 225, 215, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Primary organic branching grey veins
  drawBranchingVein(ctx, 120, 0, w * 0.7, h, 'rgba(125, 128, 136, 0.22)', 4.5);
  drawBranchingVein(ctx, w * 0.85, 0, w * 0.25, h, 'rgba(115, 118, 126, 0.18)', 3.5);

  // Secondary delicate warm golden-amber fissures
  drawBranchingVein(ctx, w * 0.4, 0, w * 0.9, h, 'rgba(186, 155, 115, 0.14)', 2.5);
  drawBranchingVein(ctx, 0, h * 0.4, w, h * 0.6, 'rgba(175, 145, 105, 0.10)', 2.0);

  // Polished large slab joint lines (1200mm x 600mm format with delicate grout)
  ctx.strokeStyle = 'rgba(165, 160, 150, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // Highlight along grout edges for 3D bevel look
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2 + 2, 0);
  ctx.lineTo(w / 2 + 2, h);
  ctx.moveTo(0, h / 2 + 2);
  ctx.lineTo(w, h / 2 + 2);
  ctx.stroke();
}

function drawBranchingVein(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  width: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();

  let curX = startX;
  let curY = startY;
  ctx.moveTo(curX, curY);

  const steps = 30;
  const dy = (endY - startY) / steps;
  const dx = (endX - startX) / steps;

  for (let s = 1; s <= steps; s++) {
    const jitterX = (Math.sin(s * 0.8) + Math.cos(s * 1.3)) * 25;
    curX += dx + jitterX;
    curY += dy;
    ctx.lineTo(curX, curY);

    // Minor tributary shoot
    if (s % 7 === 0) {
      const branchLen = 60 + Math.random() * 40;
      ctx.moveTo(curX, curY);
      ctx.lineTo(curX + (s % 2 === 0 ? branchLen : -branchLen), curY + branchLen * 0.4);
      ctx.moveTo(curX, curY);
    }
  }
  ctx.stroke();
}

function renderSlateTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Deep Kund Honed Charcoal Slate base
  ctx.fillStyle = '#26282D';
  ctx.fillRect(0, 0, w, h);

  // Tactile mineral noise and stone cleft variance
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 32;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 1.05));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 1.1));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle natural cleft shading bands
  for (let b = 0; b < 6; b++) {
    const by = (b / 6) * h;
    const bandGrad = ctx.createLinearGradient(0, by, w, by + 180);
    bandGrad.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
    bandGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
    bandGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, by, w, 180);
  }

  // 600mm x 600mm architectural tile grid lines with dark charcoal grout
  ctx.strokeStyle = '#121418';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
}

function renderHerringboneTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Toasted smoked oak base
  ctx.fillStyle = '#6E4E32';
  ctx.fillRect(0, 0, w, h);

  const tileW = 96;
  const tileH = 192;

  for (let x = -tileH; x < w + tileH * 2; x += tileW * 2) {
    for (let y = -tileH; y < h + tileH * 2; y += tileH) {
      // Left chevron plank
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);

      const tone1 = Math.sin(x * 0.02 + y * 0.015) * 18;
      ctx.fillStyle = `rgb(${118 + tone1}, ${84 + tone1 * 0.8}, ${54 + tone1 * 0.6})`;
      ctx.fillRect(0, 0, tileW, tileH);

      // Fine timber grain lines
      ctx.fillStyle = 'rgba(50, 30, 15, 0.12)';
      for (let g = 0; g < 6; g++) {
        ctx.fillRect(g * 16, 0, 1.5, tileH);
      }

      // Dark joint groove
      ctx.strokeStyle = '#342113';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, 0, tileW, tileH);
      ctx.restore();

      // Right chevron plank
      ctx.save();
      ctx.translate(x + tileW, y);
      ctx.rotate(-Math.PI / 4);

      const tone2 = Math.cos(x * 0.018 + y * 0.022) * 18;
      ctx.fillStyle = `rgb(${110 + tone2}, ${78 + tone2 * 0.8}, ${48 + tone2 * 0.6})`;
      ctx.fillRect(0, 0, tileW, tileH);

      // Fine timber grain lines
      ctx.fillStyle = 'rgba(50, 30, 15, 0.12)';
      for (let g = 0; g < 6; g++) {
        ctx.fillRect(g * 16, 0, 1.5, tileH);
      }

      // Dark joint groove
      ctx.strokeStyle = '#342113';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, 0, tileW, tileH);
      ctx.restore();
    }
  }
}
