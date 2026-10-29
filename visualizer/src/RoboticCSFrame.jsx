import React from 'react';
import { Html } from '@react-three/drei';

export default function RoboticCSFrame({ scale = 1.0, posLength = 3.2, negLength = 2.5, origin = [0, 0, 0], rotation = [0, -Math.PI / 2, 0] }) {
  const coneLen = 0.5;
  const shaftPosLen = posLength - coneLen;

  return (
    <group position={origin} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Origin Sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* X AXIS (Red - Right Hand Rule: Left (-X) -> Origin -> Right (+X))   */}
      {/* ------------------------------------------------------------------ */}
      <group rotation={[0, 0, -Math.PI / 2]}>
        {/* Negative Segment (-X to 0) */}
        <mesh position={[0, -negLength / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, negLength, 16]} />
          <meshStandardMaterial color="#FF0055" transparent={true} opacity={0.4} emissive="#FF0055" emissiveIntensity={0.3} />
        </mesh>
        {/* Positive Shaft (0 to +shaftPosLen) */}
        <mesh position={[0, shaftPosLen / 2, 0]}>
          <cylinderGeometry args={[0.035, 0.035, shaftPosLen, 16]} />
          <meshStandardMaterial color="#FF0055" emissive="#FF0055" emissiveIntensity={0.7} />
        </mesh>
        {/* Arrowhead Cone (+shaftPosLen to +posLength) */}
        <mesh position={[0, shaftPosLen + coneLen / 2, 0]}>
          <coneGeometry args={[0.1, coneLen, 16]} />
          <meshStandardMaterial color="#FF0055" emissive="#FF0055" emissiveIntensity={0.9} />
        </mesh>
      </group>
      {/* Labels */}
      <Html position={[-negLength - 0.25, 0, 0]} center occlude style={{ pointerEvents: 'none' }}>
        <div style={{ 
          color: 'rgba(255, 0, 85, 0.6)', 
          fontWeight: '500', 
          fontSize: '11px', 
          fontFamily: 'system-ui, sans-serif',
          background: 'rgba(7, 10, 19, 0.6)',
          padding: '1px 4px',
          borderRadius: '3px',
          border: '1px dashed rgba(255, 0, 85, 0.3)'
        }}>
          -X
        </div>
      </Html>
      <Html position={[posLength + 0.35, 0, 0]} center occlude style={{ pointerEvents: 'none' }}>
        <div style={{ 
          color: '#FF0055', 
          fontWeight: 'bold', 
          fontSize: '13px', 
          fontFamily: 'system-ui, sans-serif',
          background: 'rgba(7, 10, 19, 0.85)',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 0, 85, 0.5)',
          boxShadow: '0 0 8px rgba(255, 0, 85, 0.4)'
        }}>
          +X
        </div>
      </Html>

      {/* ------------------------------------------------------------------ */}
      {/* Z AXIS (Blue - Robotics Standard: Down (-Z) -> Origin -> Up (+Z))  */}
      {/* ------------------------------------------------------------------ */}
      <group rotation={[0, 0, 0]}>
        {/* Negative Segment (-Z to 0) */}
        <mesh position={[0, -negLength / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, negLength, 16]} />
          <meshStandardMaterial color="#00F0FF" transparent={true} opacity={0.4} emissive="#00F0FF" emissiveIntensity={0.3} />
        </mesh>
        {/* Positive Shaft (0 to +shaftPosLen) */}
        <mesh position={[0, shaftPosLen / 2, 0]}>
          <cylinderGeometry args={[0.035, 0.035, shaftPosLen, 16]} />
          <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.7} />
        </mesh>
        {/* Arrowhead Cone (+shaftPosLen to +posLength) */}
        <mesh position={[0, shaftPosLen + coneLen / 2, 0]}>
          <coneGeometry args={[0.1, coneLen, 16]} />
          <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.9} />
        </mesh>
      </group>
      {/* Labels */}
      <Html position={[0, -negLength - 0.25, 0]} center occlude style={{ pointerEvents: 'none' }}>
        <div style={{ 
          color: 'rgba(0, 240, 255, 0.6)', 
          fontWeight: '500', 
          fontSize: '11px', 
          fontFamily: 'system-ui, sans-serif',
          background: 'rgba(7, 10, 19, 0.6)',
          padding: '1px 4px',
          borderRadius: '3px',
          border: '1px dashed rgba(0, 240, 255, 0.3)'
        }}>
          -Z
        </div>
      </Html>
      <Html position={[0, posLength + 0.35, 0]} center occlude style={{ pointerEvents: 'none' }}>
        <div style={{ 
          color: '#00F0FF', 
          fontWeight: 'bold', 
          fontSize: '13px', 
          fontFamily: 'system-ui, sans-serif',
          background: 'rgba(7, 10, 19, 0.85)',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(0, 240, 255, 0.5)',
          boxShadow: '0 0 8px rgba(0, 240, 255, 0.4)'
        }}>
          +Z
        </div>
      </Html>

      {/* ------------------------------------------------------------------ */}
      {/* Y AXIS (Green - Right Hand Rule: Front (-Y) -> Origin -> Depth (+Y)) */}
      {/* ------------------------------------------------------------------ */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Negative Segment (-Y to 0) */}
        <mesh position={[0, -negLength / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, negLength, 16]} />
          <meshStandardMaterial color="#39FF14" transparent={true} opacity={0.4} emissive="#39FF14" emissiveIntensity={0.3} />
        </mesh>
        {/* Positive Shaft (0 to +shaftPosLen) */}
        <mesh position={[0, shaftPosLen / 2, 0]}>
          <cylinderGeometry args={[0.035, 0.035, shaftPosLen, 16]} />
          <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={0.7} />
        </mesh>
        {/* Arrowhead Cone (+shaftPosLen to +posLength) */}
        <mesh position={[0, shaftPosLen + coneLen / 2, 0]}>
          <coneGeometry args={[0.1, coneLen, 16]} />
          <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={0.9} />
        </mesh>
      </group>
      {/* Labels */}
      <Html position={[0, 0, negLength + 0.25]} center occlude style={{ pointerEvents: 'none' }}>
        <div style={{ 
          color: 'rgba(57, 255, 20, 0.6)', 
          fontWeight: '500', 
          fontSize: '11px', 
          fontFamily: 'system-ui, sans-serif',
          background: 'rgba(7, 10, 19, 0.6)',
          padding: '1px 4px',
          borderRadius: '3px',
          border: '1px dashed rgba(57, 255, 20, 0.3)'
        }}>
          -Y
        </div>
      </Html>
      <Html position={[0, 0, -posLength - 0.35]} center occlude style={{ pointerEvents: 'none' }}>
        <div style={{ 
          color: '#39FF14', 
          fontWeight: 'bold', 
          fontSize: '13px', 
          fontFamily: 'system-ui, sans-serif',
          background: 'rgba(7, 10, 19, 0.85)',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(57, 255, 20, 0.5)',
          boxShadow: '0 0 8px rgba(57, 255, 20, 0.4)'
        }}>
          +Y
        </div>
      </Html>
    </group>
  );
}
