import fs from 'fs';

function testVisibility() {
  const buf = fs.readFileSync('public/models/Interior_asset_optimized.glb');
  const chunk0Length = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString('utf8', 20, 20 + chunk0Length));

  const viewMode = 'dollhouse';
  const furniturePkg = 'premium';

  let hiddenNodes = [];
  let visibleNodes = [];

  gltf.nodes.forEach((child, idx) => {
    let visible = true;
    if (child.name) {
      const name = child.name.toLowerCase();
      const isCeiling =
        name.includes('ceiling') ||
        name.includes('fascia') ||
        name.includes('roof') ||
        name.includes('complete');

      if (viewMode === 'dollhouse' && isCeiling) {
        visible = false;
        hiddenNodes.push({ idx, name: child.name, children: child.children });
        return;
      }
    }
    visibleNodes.push({ idx, name: child.name, mesh: child.mesh });
  });

  console.log(`Total nodes: ${gltf.nodes.length}`);
  console.log(`Hidden nodes: ${hiddenNodes.length}`);
  console.log(`Visible nodes: ${visibleNodes.length}`);

  // Check if any hidden node has children
  const hiddenWithChildren = hiddenNodes.filter(n => n.children && n.children.length > 0);
  console.log(`Hidden nodes with children: ${hiddenWithChildren.length}`);
  hiddenWithChildren.forEach(n => {
    console.log(`Hidden parent: [${n.idx}] "${n.name}" has ${n.children.length} children! Children sample: ${n.children.slice(0, 5).join(', ')}`);
  });
}

testVisibility();
