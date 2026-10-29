import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

// Quintic C2 continuous smoothstep curve: 6p^5 - 15p^4 + 10p^3
function smoothstepQuintic(p) {
  const clampP = Math.max(0, Math.min(1, p));
  return clampP * clampP * clampP * (clampP * (clampP * 6 - 15) + 10);
}

const aspects = ["Simple", "Continuous", "Perfect", "Perfect Continuous"];
const times = ["Present", "Past", "Future", "Future in the Past"];
const voices = ["Active", "Passive"];

export default function IntroAnimation({ isStarted = false, onComplete }) {
  const singleMeshRef = useRef();
  const singleGroupRef = useRef();
  const gridGroupRef = useRef();

  const cellRefs = useRef([]);
  const edgeRefs = useRef([]);
  const timeRef = useRef(0);

  // Geometry dimensions
  const initialSide = 4.4447; // Volume = 87.808
  const targetWidth = 5.6;
  const targetHeight = 5.6;
  const targetDepth = 2.8;

  // Sub-block dimensions (4 columns x 4 rows x 2 layers = 32 blocks)
  const initialSubW = initialSide / 4; // 1.111175
  const initialSubH = initialSide / 4; // 1.111175
  const initialSubD = initialSide / 2; // 2.22235

  const targetSubW = targetWidth / 4; // 1.4
  const targetSubH = targetHeight / 4; // 1.4
  const targetSubD = targetDepth / 2; // 1.4

  const spacing = 2.2;
  const centerZ = -1.65; // Fixed z-center throughout all phases

  // Sphere Volume V = 87.808 => Radius R = cbrt(3V / 4pi) = 2.7573
  const sphereRadius = Math.cbrt((3 * 87.808) / (4 * Math.PI));

  // Generate morphable geometry (BoxGeometry topology with dual Position & Normal lerping)
  const morphData = useMemo(() => {
    const subdivisions = 32;
    const geom = new THREE.BoxGeometry(initialSide, initialSide, initialSide, subdivisions, subdivisions, subdivisions);
    const posAttr = geom.attributes.position;
    const normAttr = geom.attributes.normal;
    const count = posAttr.count;

    const spherePositions = new Float32Array(count * 3);
    const cubePositions = new Float32Array(count * 3);
    const sphereNormals = new Float32Array(count * 3);
    const cubeNormals = new Float32Array(count * 3);
    const currentPositions = new Float32Array(count * 3);
    const currentNormals = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const cx = posAttr.getX(i);
      const cy = posAttr.getY(i);
      const cz = posAttr.getZ(i);

      cubePositions[i * 3] = cx;
      cubePositions[i * 3 + 1] = cy;
      cubePositions[i * 3 + 2] = cz;

      const cnx = normAttr.getX(i);
      const cny = normAttr.getY(i);
      const cnz = normAttr.getZ(i);

      cubeNormals[i * 3] = cnx;
      cubeNormals[i * 3 + 1] = cny;
      cubeNormals[i * 3 + 2] = cnz;

      // Distance from origin to vertex
      const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
      const dirX = len > 0.00001 ? cx / len : 0;
      const dirY = len > 0.00001 ? cy / len : 1;
      const dirZ = len > 0.00001 ? cz / len : 0;

      // Sphere position (R = 2.7573, V = 87.808)
      const sx = dirX * sphereRadius;
      const sy = dirY * sphereRadius;
      const sz = dirZ * sphereRadius;

      spherePositions[i * 3] = sx;
      spherePositions[i * 3 + 1] = sy;
      spherePositions[i * 3 + 2] = sz;

      // Sphere normal = radial direction
      sphereNormals[i * 3] = dirX;
      sphereNormals[i * 3 + 1] = dirY;
      sphereNormals[i * 3 + 2] = dirZ;

      // Initial state = sphere
      currentPositions[i * 3] = sx;
      currentPositions[i * 3 + 1] = sy;
      currentPositions[i * 3 + 2] = sz;

      currentNormals[i * 3] = dirX;
      currentNormals[i * 3 + 1] = dirY;
      currentNormals[i * 3 + 2] = dirZ;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(currentNormals, 3));

    return { geom, spherePositions, cubePositions, sphereNormals, cubeNormals };
  }, [initialSide, sphereRadius]);

  // Reset timeRef on mount
  useEffect(() => {
    timeRef.current = 0;
  }, []);

  useFrame((state, delta) => {
    // Only advance animation clock if user pressed Start / Activate
    if (isStarted) {
      const safeDelta = Math.min(delta, 0.033);
      timeRef.current += safeDelta;
    }
    const t = timeRef.current;

    // -------------------------------------------------------------
    // Phase 0: Perfect Sphere morphing to Monolithic Cube (0.0s -> 1.5s)
    // -------------------------------------------------------------
    const morphProgress = isStarted ? smoothstepQuintic(Math.min(1, t / 1.5)) : 0.0;

    const posAttr = morphData.geom.attributes.position;
    const normAttr = morphData.geom.attributes.normal;
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      const sx = morphData.spherePositions[i * 3];
      const sy = morphData.spherePositions[i * 3 + 1];
      const sz = morphData.spherePositions[i * 3 + 2];

      const cx = morphData.cubePositions[i * 3];
      const cy = morphData.cubePositions[i * 3 + 1];
      const cz = morphData.cubePositions[i * 3 + 2];

      // Smooth C2 position lerp from Sphere -> Monolithic Cube
      const px = sx + (cx - sx) * morphProgress;
      const py = sy + (cy - sy) * morphProgress;
      const pz = sz + (cz - sz) * morphProgress;

      posAttr.setXYZ(i, px, py, pz);

      // Smooth normal lerp from Spherical Normals -> Flat Cube Face Normals
      const snx = morphData.sphereNormals[i * 3];
      const sny = morphData.sphereNormals[i * 3 + 1];
      const snz = morphData.sphereNormals[i * 3 + 2];

      const cnx = morphData.cubeNormals[i * 3];
      const cny = morphData.cubeNormals[i * 3 + 1];
      const cnz = morphData.cubeNormals[i * 3 + 2];

      let nX = snx + (cnx - snx) * morphProgress;
      let nY = sny + (cny - sny) * morphProgress;
      let nZ = snz + (cnz - snz) * morphProgress;

      const nLen = Math.sqrt(nX * nX + nY * nY + nZ * nZ);
      if (nLen > 0.00001) {
        nX /= nLen;
        nY /= nLen;
        nZ /= nLen;
      }

      normAttr.setXYZ(i, nX, nY, nZ);
    }
    posAttr.needsUpdate = true;
    normAttr.needsUpdate = true;

    // -------------------------------------------------------------
    // Seamless Cross-Fade & Visibility Control (0.0s -> 7.3s)
    // -------------------------------------------------------------
    if (t < 1.5) {
      if (singleGroupRef.current) singleGroupRef.current.visible = true;
      if (gridGroupRef.current) gridGroupRef.current.visible = false;
      if (singleMeshRef.current && singleMeshRef.current.material) {
        singleMeshRef.current.material.opacity = 0.6;
      }
    } 
    // Smooth cross-fade between t = 1.5s and t = 1.8s
    else if (t >= 1.5 && t < 1.8) {
      if (singleGroupRef.current) singleGroupRef.current.visible = true;
      if (gridGroupRef.current) gridGroupRef.current.visible = true;

      const fadeOut = 1.0 - (t - 1.5) / 0.3; // 1.0 -> 0.0
      if (singleMeshRef.current && singleMeshRef.current.material) {
        singleMeshRef.current.material.opacity = 0.6 * fadeOut;
      }
    } 
    else {
      if (singleGroupRef.current) singleGroupRef.current.visible = false;
      if (gridGroupRef.current) gridGroupRef.current.visible = true;
    }

    if (t >= 1.5) {
      // Phase 1: Grid lines fade in from 0.0 to 0.8 (1.5s to 2.2s)
      let seamOpacity = 0.8;
      if (t >= 1.5 && t < 2.2) {
        seamOpacity = ((t - 1.5) / 0.7) * 0.8;
      }

      // Phase 2: Stretch progression (2.2s to 4.0s)
      let stretchProgress = 0;
      if (t >= 2.2 && t < 4.0) {
        const rawProgress = (t - 2.2) / 1.8;
        if (rawProgress < 0.8) {
          stretchProgress = (rawProgress / 0.8) * 0.9;
        } else {
          const rest = (rawProgress - 0.8) / 0.2;
          stretchProgress = 0.9 + rest * 0.1;
        }
      } else if (t >= 4.0) {
        stretchProgress = 1.0;
      }

      const curSubW = initialSubW + (targetSubW - initialSubW) * stretchProgress;
      const curSubH = initialSubH + (targetSubH - initialSubH) * stretchProgress;
      const curSubD = initialSubD + (targetSubD - initialSubD) * stretchProgress;

      // Phase 4: Separation progress (4.3s to 7.3s)
      let splitProgress = 0;
      if (t >= 4.3) {
        const p = Math.min(1, (t - 4.3) / 3.0);
        splitProgress = smoothstepQuintic(p);
      }

      // Update 32 sub-block meshes frame-by-frame at 60 FPS
      let idx = 0;
      voices.forEach((voice, zIdx) => {
        const touchZ = centerZ + (0.5 - zIdx) * curSubD;
        const finalZ = -zIdx * (spacing * 1.5);
        const curZ = touchZ + (finalZ - touchZ) * splitProgress;

        times.forEach((time, yIdx) => {
          const touchY = (1.5 - yIdx) * curSubH;
          const finalY = (1.5 - yIdx) * spacing;
          const curY = touchY + (finalY - touchY) * splitProgress;

          aspects.forEach((aspect, xIdx) => {
            const touchX = (xIdx - 1.5) * curSubW;
            const finalX = (xIdx - 1.5) * spacing;
            const curX = touchX + (finalX - touchX) * splitProgress;

            const mesh = cellRefs.current[idx];
            if (mesh) {
              mesh.position.set(curX, curY, curZ);
              mesh.scale.set(
                curSubW / targetSubW,
                curSubH / targetSubH,
                curSubD / targetSubD
              );

              // Smooth color transition from neon green to Voice colors during split
              const baseColorHex = voice === "Active" ? "#00F0FF" : "#FF007F";
              const startColor = new THREE.Color("#39FF14");
              const targetColor = new THREE.Color(baseColorHex);
              const currentColor = startColor.clone().lerp(targetColor, splitProgress);

              if (mesh.material) {
                mesh.material.color.copy(currentColor);
              }
            }

            // Smooth opacity for seam grid lines
            const edgeMesh = edgeRefs.current[idx];
            if (edgeMesh && edgeMesh.material) {
              edgeMesh.material.opacity = seamOpacity;
            }

            idx++;
          });
        });
      });
    }

    if (t >= 7.3) {
      if (onComplete) onComplete();
    }
  });

  const totalCells = voices.length * times.length * aspects.length;
  if (cellRefs.current.length !== totalCells) {
    cellRefs.current = Array(totalCells).fill(null);
    edgeRefs.current = Array(totalCells).fill(null);
  }

  return (
    <group>
      {/* Phase 0: Perfect Sphere morphing to Monolithic Cube (0.0s -> 1.5s) */}
      <group ref={singleGroupRef}>
        <mesh ref={singleMeshRef} geometry={morphData.geom} position={[0, 0, centerZ]}>
          <meshPhysicalMaterial
            color="#39FF14"
            transparent={true}
            opacity={0.6}
            roughness={0.1}
            metalness={0.1}
            transmission={0.3}
            thickness={0.5}
            side={THREE.DoubleSide}
          />
          <Edges scale={1.0} color="#39FF14" opacity={0.9} transparent={true} />
        </mesh>
      </group>

      {/* Phase 1-4: 32 Cubes Grid with Grid Markings Fading In, Stretching & Splitting */}
      <group ref={gridGroupRef} visible={false}>
        {voices.map((voice, zIdx) =>
          times.map((time, yIdx) =>
            aspects.map((aspect, xIdx) => {
              const flatIdx = zIdx * (times.length * aspects.length) + yIdx * aspects.length + xIdx;

              return (
                <mesh
                  key={`${voice}-${aspect}-${time}`}
                  ref={(el) => (cellRefs.current[flatIdx] = el)}
                  position={[0, 0, 0]}
                >
                  <boxGeometry args={[targetSubW, targetSubH, targetSubD]} />
                  <meshPhysicalMaterial
                    color="#39FF14"
                    transparent={true}
                    opacity={0.6}
                    roughness={0.1}
                    metalness={0.1}
                    transmission={0.3}
                    thickness={0.5}
                    side={THREE.DoubleSide}
                  />
                  <Edges
                    ref={(el) => (edgeRefs.current[flatIdx] = el)}
                    scale={1.0}
                    color="#39FF14"
                    opacity={0.0}
                    transparent={true}
                  />
                </mesh>
              );
            })
          )
        )}
      </group>
    </group>
  );
}
