import fs from 'fs';

function findLevelElevations() {
  const buf = fs.readFileSync('public/models/Waterfront_18F_optimized.glb');
  const chunk0Length = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString('utf8', 20, 20 + chunk0Length));

  // In GLTF, a node's world Y position is the sum of parent translations and its translation
  // Let's build a parent map
  const parentMap = {};
  gltf.nodes.forEach((n, idx) => {
    n.children?.forEach(cIdx => {
      parentMap[cIdx] = idx;
    });
  });

  function getWorldTranslationY(nodeIdx) {
    let y = 0;
    let curr = nodeIdx;
    while (curr !== undefined) {
      const node = gltf.nodes[curr];
      if (node.translation) y += node.translation[1];
      curr = parentMap[curr];
    }
    return y;
  }

  // Find sample nodes for each level
  for (let i = 1; i <= 15; i++) {
    const pad = i.toString().padStart(2, '0');
    const search = `Level ${pad}`;
    const node = gltf.nodes.find(n => n.name && n.name.startsWith(search) && n.translation);
    if (node) {
      const idx = gltf.nodes.indexOf(node);
      const wy = getWorldTranslationY(idx);
      console.log(`Level ${pad}: "${node.name}" -> local Y: ${node.translation[1].toFixed(2)}, world Y: ${wy.toFixed(2)}`);
    } else {
      // Find any node containing it
      const anyNode = gltf.nodes.find(n => n.name && n.name.includes(search));
      if (anyNode) {
        const idx = gltf.nodes.indexOf(anyNode);
        console.log(`Level ${pad}: "${anyNode.name}" -> translation: ${JSON.stringify(anyNode.translation)}`);
      }
    }
  }
}

findLevelElevations();
