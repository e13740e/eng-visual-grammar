import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { stlDataUri } from './stlDataUri';

// Preload the STL binary asset immediately on module evaluation to eliminate first-toggle stutter
useLoader.preload(STLLoader, stlDataUri);

/**
 * RoboticHandFrame - Real Anatomical 3D STL Right-Hand Teaching Tool
 * Loads and renders the exact STL model: /RightHandRule.stl
 * Rotated and centered so that:
 *  - Index Finger aligns along +X
 *  - Middle Finger aligns along +Y
 *  - Thumb aligns along +Z (Upwards)
 */
export const HAND_MATERIAL_STYLES = {
  hologram: {
    name: 'Hologram Cyber-Cyan',
    color: '#00F0FF',
    emissive: '#00F0FF',
    emissiveIntensity: 0.35,
    roughness: 0.1,
    metalness: 0.8,
    opacity: 0.45
  },
  royal_violet: {
    name: 'Royal Violet Crystal',
    color: '#8B5CF6',
    emissive: '#7C3AED',
    emissiveIntensity: 0.45,
    roughness: 0.1,
    metalness: 0.6,
    opacity: 0.5
  },
  electric_white: {
    name: 'Electric White Sensor',
    color: '#F8FAFC',
    emissive: '#FFFFFF',
    emissiveIntensity: 0.4,
    roughness: 0.15,
    metalness: 0.3,
    opacity: 0.5
  },
  amber_glass: {
    name: 'Warm Amber Glass',
    color: '#FFAF00',
    emissive: '#FF7A00',
    emissiveIntensity: 0.3,
    roughness: 0.12,
    metalness: 0.6,
    opacity: 0.45
  },
  chromatic_axes: {
    name: 'Chromatic Axes (White Palm + RGB Fingers)',
    isMultiColor: true,
    roughness: 0.2,
    metalness: 0.3,
    opacity: 0.6
  }
};

export default function RoboticHandFrame({ 
  scale = 1.0, 
  origin = [0, 0, -1.65], 
  rotation = [0, -Math.PI / 2, 0],
  handMaterialStyle = 'hologram',
  visible = true
}) {
  const matConfig = HAND_MATERIAL_STYLES[handMaterialStyle] || HAND_MATERIAL_STYLES.hologram;
  // Load the embedded STL model from self-contained base64 data URI
  const stlGeometry = useLoader(STLLoader, stlDataUri);

  const processedGeometry = useMemo(() => {
    if (!stlGeometry) return null;
    const geom = stlGeometry.clone();
    geom.computeVertexNormals();

    // 1. Pivot at knuckle junction where thumb, index and middle meet
    geom.translate(-5, 10, -8);

    // 2. Rotate mesh so that:
    //    - Index finger points along +X (Red arrow)
    //    - Middle finger points along +Y (Green arrow)
    //    - Thumb points strictly along +Z (Cyan arrow, Upwards)
    const baseRot = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler((228 * Math.PI) / 180, (29 * Math.PI) / 180, (65 * Math.PI) / 180, 'XYZ')
    );
    const alignRotZ = new THREE.Matrix4().makeRotationZ(-Math.PI / 2);
    const alignRotX = new THREE.Matrix4().makeRotationX((55 * Math.PI) / 180); // 55° around X
    const alignRotFrameY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, -1), (-10 * Math.PI) / 180); // -10° around Frame Y axis
    const alignRotFrameZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), (-5 * Math.PI) / 180); // -5° around Frame Z axis
    const rotMatrix = new THREE.Matrix4()
      .multiply(alignRotFrameZ)
      .multiply(alignRotFrameY)
      .multiply(alignRotX)
      .multiply(alignRotZ)
      .multiply(baseRot);
    geom.applyMatrix4(rotMatrix);

    // 3. Compute Vertex Colors for 'chromatic_axes' style:
    //    - Palm/fist base: Pure White (#FFFFFF)
    //    - Index finger (along +X): Frame Red (#FF0055)
    //    - Thumb finger (along +Y in local / +Z world): Frame Cyan (#00F0FF)
    //    - Middle finger (along -Z in local / +Y world): Frame Neon Green (#39FF14)
    const pos = geom.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const colorWhite = new THREE.Color('#FFFFFF');
    const colorRed = new THREE.Color('#FF0055');
    const colorCyan = new THREE.Color('#00F0FF');
    const colorGreen = new THREE.Color('#39FF14');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      let targetColor = colorWhite;

      // 1. Index finger extends along +X (Knuckle begins at x ~ 14.0)
      if (x > 14.0 && Math.hypot(y, z) < 10.0) {
        targetColor = colorRed;
      }
      // 2. Thumb finger extends along +Y in local space (Knuckle begins at y ~ 12.0)
      // Thumb is completely isolated in the space y > 12.0
      else if (y > 12.0) {
        targetColor = colorCyan;
      }
      // 3. Middle finger extends along -Z in local space (Knuckle begins past z ~ -13.8)
      // Fully clears curled ring finger beneath it while keeping entire middle finger solid
      else if (z < -13.8) {
        targetColor = colorGreen;
      }

      colors[i * 3] = targetColor.r;
      colors[i * 3 + 1] = targetColor.g;
      colors[i * 3 + 2] = targetColor.b;
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geom;
  }, [stlGeometry]);

  return (
    <group position={origin} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Real Anatomical Right-Hand Model from STL */}
      {processedGeometry && (
        <group position={[0, 0, 0]} scale={[0.075, 0.075, 0.075]}>
          <mesh geometry={processedGeometry}>
            {matConfig.isMultiColor ? (
              <meshStandardMaterial 
                key="mat-chromatic-axes"
                vertexColors={true}
                color="#FFFFFF"
                roughness={matConfig.roughness} 
                metalness={matConfig.metalness} 
                transparent={true}
                opacity={matConfig.opacity}
                depthWrite={false}
                side={THREE.DoubleSide} 
              />
            ) : (
              <meshStandardMaterial 
                key={`mat-monochrome-${handMaterialStyle}`}
                color={matConfig.color}
                emissive={matConfig.emissive}
                emissiveIntensity={matConfig.emissiveIntensity}
                roughness={matConfig.roughness} 
                metalness={matConfig.metalness} 
                transparent={true}
                opacity={matConfig.opacity}
                depthWrite={false}
                side={THREE.DoubleSide} 
              />
            )}
          </mesh>
        </group>
      )}

      {/* Origin sphere and HTML badges - only rendered when visible is true */}
      {visible && (
        <>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Axis badges */}
          <Html position={[2.8, 0, 0]} center occlude style={{ pointerEvents: 'none' }}>
            <div style={{
              color: '#FF0055',
              fontSize: '11px',
              fontWeight: 'bold',
              background: 'rgba(7, 10, 19, 0.85)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 0, 85, 0.5)',
              boxShadow: '0 0 8px rgba(255, 0, 85, 0.4)',
              whiteSpace: 'nowrap'
            }}>
              ☝️ Index (+X)
            </div>
          </Html>

          <Html position={[0, 0, -2.8]} center occlude style={{ pointerEvents: 'none' }}>
            <div style={{
              color: '#39FF14',
              fontSize: '11px',
              fontWeight: 'bold',
              background: 'rgba(7, 10, 19, 0.85)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(57, 255, 20, 0.5)',
              boxShadow: '0 0 8px rgba(57, 255, 20, 0.4)',
              whiteSpace: 'nowrap'
            }}>
              🖕 Middle (+Y)
            </div>
          </Html>

          <Html position={[0, 2.8, 0]} center occlude style={{ pointerEvents: 'none' }}>
            <div style={{
              color: '#00F0FF',
              fontSize: '11px',
              fontWeight: 'bold',
              background: 'rgba(7, 10, 19, 0.85)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 240, 255, 0.5)',
              boxShadow: '0 0 8px rgba(0, 240, 255, 0.4)',
              whiteSpace: 'nowrap'
            }}>
              👍 Thumb (+Z)
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
