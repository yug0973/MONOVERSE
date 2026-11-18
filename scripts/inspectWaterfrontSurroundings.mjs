import fs from 'fs';

function inspectSurroundings() {
  const buf = fs.readFileSync('public/models/Waterfront_18F_optimized.glb');
  const chunk0Length = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString('utf8', 20, 20 + chunk0Length));

  const nonLevelNodes = gltf.nodes.filter(n =>
    n.name && !n.name.includes('Level') && !n.name.startsWith('unnamed')
  );

  console.log(`Found ${nonLevelNodes.length} non-level named nodes.`);
  const names = nonLevelNodes.map(n => n.name);
  const uniquePrefixes = new Set(names.map(name => name.split(/[\s_\.]/)[0]));
  console.log('Unique prefixes:', Array.from(uniquePrefixes));

  // Print sample nodes from each prefix
  Array.from(uniquePrefixes).forEach(pref => {
    const matching = nonLevelNodes.filter(n => n.name.startsWith(pref));
    console.log(`Prefix "${pref}" (${matching.length} nodes): sample: ${matching.slice(0, 4).map(n => n.name).join(', ')}`);
  });
}

inspectSurroundings();
