const fs = require('fs');
const THREE = require('./node_modules/three');

const buffer = fs.readFileSync('public/RightHandRule.stl');
const triangleCount = buffer.readUInt32LE(80);
console.log('Triangles:', triangleCount);

const positions = [];
for (let i = 0; i < triangleCount; i++) {
  const offset = 84 + i * 50;
  for (let v = 0; v < 3; v++) {
    const vx = buffer.readFloatLE(offset + 12 + v * 12);
    const vy = buffer.readFloatLE(offset + 12 + v * 12 + 4);
    const vz = buffer.readFloatLE(offset + 12 + v * 12 + 8);
    positions.push(vx, vy, vz);
  }
}

const geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geom.translate(-5, 10, -8);

const baseRot = new THREE.Matrix4().makeRotationFromEuler(
  new THREE.Euler((228 * Math.PI) / 180, (29 * Math.PI) / 180, (65 * Math.PI) / 180, 'XYZ')
);
const alignRotZ = new THREE.Matrix4().makeRotationZ(-Math.PI / 2);
const alignRotX = new THREE.Matrix4().makeRotationX((55 * Math.PI) / 180);
const alignRotFrameY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, -1), (-10 * Math.PI) / 180);
const alignRotFrameZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), (-5 * Math.PI) / 180);
const rotMatrix = new THREE.Matrix4()
  .multiply(alignRotFrameZ)
  .multiply(alignRotFrameY)
  .multiply(alignRotX)
  .multiply(alignRotZ)
  .multiply(baseRot);
geom.applyMatrix4(rotMatrix);

const pos = geom.attributes.position;

console.log('=== THUMB VERTICES (y > 12.5) ===');
let thumbTotal = 0;
let thumbColoredCurrent = 0;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
  if (y > 12.5) {
    thumbTotal++;
    if (Math.hypot(x - (-4.8), z - (-4.2)) < 9.5) {
      thumbColoredCurrent++;
    }
  }
}
console.log(`Thumb: total with y>12.5: ${thumbTotal}, colored with current formula: ${thumbColoredCurrent} (${(thumbColoredCurrent/thumbTotal*100).toFixed(1)}%)`);

// Let's check max distance from (-4.8, -4.2) for y > 12.5
let maxDistThumb = 0;
let thumbDistances = [];
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
  if (y > 12.5) {
    const dist = Math.hypot(x - (-4.8), z - (-4.2));
    maxDistThumb = Math.max(maxDistThumb, dist);
    thumbDistances.push({x, y, z, dist});
  }
}
console.log(`Max dist of thumb verts from (-4.8, -4.2): ${maxDistThumb.toFixed(2)}`);
thumbDistances.sort((a,b) => b.dist - a.dist);
console.log('Top 5 uncolored thumb points:');
console.log(thumbDistances.slice(0, 5));

console.log('=== MIDDLE FINGER VERTICES (z < -11.5) ===');
let middleTotal = 0;
let middleColoredCurrent = 0;
let maxDistMiddle = 0;
let middleDistances = [];
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
  if (z < -11.5) {
    middleTotal++;
    const dist = Math.hypot(x - 5.5, y - (-6.8));
    if (dist < 11.5) {
      middleColoredCurrent++;
    }
    maxDistMiddle = Math.max(maxDistMiddle, dist);
    middleDistances.push({x, y, z, dist});
  }
}
console.log(`Middle: total with z<-11.5: ${middleTotal}, colored with current formula: ${middleColoredCurrent} (${(middleColoredCurrent/middleTotal*100).toFixed(1)}%)`);
console.log(`Max dist of middle verts from (5.5, -6.8): ${maxDistMiddle.toFixed(2)}`);
middleDistances.sort((a,b) => b.dist - a.dist);
console.log('Top 5 uncolored middle points:');
console.log(middleDistances.slice(0, 5));

// Check if any OTHER parts of mesh have y > 12.5 or z < -11.5
console.log('=== CHECK ENTIRE MESH IN THUMB REGION ===');
let allYgt125 = [];
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
  if (y > 12.5) allYgt125.push({x, y, z});
}
console.log(`Any vertex with y > 12.5: count=${allYgt125.length}`);
let minX = Math.min(...allYgt125.map(p=>p.x)), maxX = Math.max(...allYgt125.map(p=>p.x));
let minZ = Math.min(...allYgt125.map(p=>p.z)), maxZ = Math.max(...allYgt125.map(p=>p.z));
console.log(`Y > 12.5 bounding box: X=[${minX.toFixed(1)}, ${maxX.toFixed(1)}], Z=[${minZ.toFixed(1)}, ${maxZ.toFixed(1)}]`);

console.log('=== CHECK ENTIRE MESH IN MIDDLE REGION ===');
let allZltNeg11 = [];
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
  if (z < -11.5) allZltNeg11.push({x, y, z});
}
console.log(`Any vertex with z < -11.5: count=${allZltNeg11.length}`);
minX = Math.min(...allZltNeg11.map(p=>p.x)); maxX = Math.max(...allZltNeg11.map(p=>p.x));
let minY = Math.min(...allZltNeg11.map(p=>p.y)); let maxY = Math.max(...allZltNeg11.map(p=>p.y));
console.log(`Z < -11.5 bounding box: X=[${minX.toFixed(1)}, ${maxX.toFixed(1)}], Y=[${minY.toFixed(1)}, ${maxY.toFixed(1)}]`);
