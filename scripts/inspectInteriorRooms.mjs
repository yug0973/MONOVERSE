import fs from 'fs';

function inspectInteriorRooms() {
  const buf = fs.readFileSync('public/models/Interior_asset_optimized.glb');
  const chunk0Length = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString('utf8', 20, 20 + chunk0Length));

  // Compute world transform or local bounding boxes
  // Let's find nodes that have room indicators
  const rooms = [
    'Living',
    'Dining',
    'Kitchen',
    'Master',
    'Ensuite',
    'Bath',
    'Lounge',
    'Bedroom',
    'Terrace',
    'Entry',
    'Lobby',
    'Powder',
    'Closet',
    'Skirting'
  ];

  rooms.forEach(roomName => {
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];
    let matchedCount = 0;

    gltf.nodes?.forEach((n, idx) => {
      if (n.name && n.name.toLowerCase().includes(roomName.toLowerCase())) {
        matchedCount++;
        // If it has mesh
        if (n.mesh !== undefined) {
          const mesh = gltf.meshes[n.mesh];
          mesh.primitives?.forEach(p => {
            const accIdx = p.attributes?.POSITION;
            if (accIdx !== undefined) {
              const acc = gltf.accessors[accIdx];
              if (acc && acc.min && acc.max) {
                // Approximate with node translation if present
                const t = n.translation || [0, 0, 0];
                for (let i = 0; i < 3; i++) {
                  const pMin = acc.min[i] + t[i];
                  const pMax = acc.max[i] + t[i];
                  if (pMin < min[i]) min[i] = pMin;
                  if (pMax > max[i]) max[i] = pMax;
                }
              }
            }
          });
        }
      }
    });

    if (matchedCount > 0 && min[0] !== Infinity) {
      const center = [(min[0]+max[0])/2, (min[1]+max[1])/2, (min[2]+max[2])/2];
      const size = [max[0]-min[0], max[1]-min[1], max[2]-min[2]];
      console.log(`Room [${roomName}] (${matchedCount} nodes) -> Center: [${center.map(v => v.toFixed(2))}], Size: [${size.map(v => v.toFixed(2))}]`);
    } else {
      console.log(`Room [${roomName}] (${matchedCount} nodes)`);
    }
  });

  // Check furniture objects
  console.log('\n--- Furniture & Decorative Items ---');
  const furnitureKeywords = [
    'Sofa', 'Table', 'Chair', 'Bed', 'Oven', 'Refrigerator', 'Chandelier',
    'Lamp', 'Pendant', 'Rug', 'Vase', 'Tree', 'Plant', 'Mirror', 'Nightstand',
    'Bathtub', 'Bath', 'Downlight', 'Cove'
  ];

  const furnitureNodes = gltf.nodes?.filter(n =>
    furnitureKeywords.some(kw => n.name && n.name.toLowerCase().includes(kw.toLowerCase()))
  );
  console.log(`Total furniture/lighting/decor nodes found: ${furnitureNodes.length}`);
  furnitureNodes.slice(0, 30).forEach(n => {
    console.log(`- "${n.name}" (mesh: ${n.mesh}, translation: ${JSON.stringify(n.translation)})`);
  });
}

inspectInteriorRooms();
