import fs from 'fs';

function inspect() {
  const bldgBuf = fs.readFileSync('public/models/Waterfront_18F_optimized.glb');
  const bldgChunk0Length = bldgBuf.readUInt32LE(12);
  const bldgGltf = JSON.parse(bldgBuf.toString('utf8', 20, 20 + bldgChunk0Length));

  console.log('=== WATERFRONT 18F NODE HIERARCHY ===');
  // Find all nodes that have "Level" or "Podium" or "Roof" or "Crown" or "Floor" in name
  const levelMap = {};
  bldgGltf.nodes?.forEach((n, idx) => {
    if (!n.name) return;
    const match = n.name.match(/Level\s*(\d+)/i) || n.name.match(/(Podium|Roof|Crown|Ground|Basement)/i);
    if (match) {
      const key = match[0];
      if (!levelMap[key]) levelMap[key] = [];
      levelMap[key].push({ idx, name: n.name, translation: n.translation });
    }
  });

  Object.keys(levelMap).sort().forEach(k => {
    console.log(`Key: "${k}" -> ${levelMap[k].length} nodes (sample: ${levelMap[k].slice(0, 3).map(x => x.name).join(', ')})`);
  });

  const intBuf = fs.readFileSync('public/models/Interior_asset_optimized.glb');
  const intChunk0Length = intBuf.readUInt32LE(12);
  const intGltf = JSON.parse(intBuf.toString('utf8', 20, 20 + intChunk0Length));

  console.log('\n=== INTERIOR ASSET NODE HIERARCHY ===');
  const intCategories = {};
  intGltf.nodes?.forEach((n, idx) => {
    if (!n.name) return;
    // Categorize by room / furniture
    const parts = n.name.split(/[_\s0-9]/).filter(Boolean);
    const category = parts[0] || 'Other';
    if (!intCategories[category]) intCategories[category] = [];
    intCategories[category].push({ idx, name: n.name, mesh: n.mesh, translation: n.translation });
  });

  Object.keys(intCategories).sort().forEach(c => {
    console.log(`Category: "${c}" -> ${intCategories[c].length} nodes (sample: ${intCategories[c].slice(0, 3).map(x => x.name).join(', ')})`);
  });
}

inspect();
