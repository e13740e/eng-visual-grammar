import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Text } from '@react-three/drei';
import * as THREE from 'three';
import IntroAnimation from './IntroAnimation';
import RoboticCSFrame from './RoboticCSFrame';
import RoboticHandFrame from './RoboticHandFrame';
import grammarData from './grammar_data.json';

const sentenceTypes = [
  "Affirmative",
  "Negative full (not)",
  "Negative contracted (n't)",
  "Interrogative about Affirmative",
  "Interrogative about Negative full (not)",
  "Interrogative about Negative contracted (n't)"
];

const aspects = ["Simple", "Continuous", "Perfect", "Perfect Continuous"];
const times = ["Present", "Past", "Future", "Future in the Past"];

// Concept B: Monochromatic Harmonic Hierarchy (Cohesive tones, Zero clashing)
// L1: Pure vibrant tone (Affirmative)
// L2-L3: Muted pair with distinct brightness (Negative group)
// L4-L6: Luminous gradient trio (Interrogative group: L4 pure, L5-L6 deeper rich tones)
const selectColors = [
  "#39FF14", // L1: Affirmative - Яскравий неоново-зелений (базовий сигнал)
  "#10B981", // L2: Negative full - Смарагдовий (стриманий)
  "#059669", // L3: Negative contracted - Глибший смарагдово-хвойний
  "#00F0FF", // L4: Interrogative about Aff - Неоново-бірюзовий ціан (чисте інверсійне світло)
  "#0284C7", // L5: Interrogative about Neg full - Насичений кобальтово-блакитний
  "#2563EB"  // L6: Interrogative about Neg contr - Глибокий ультрамариновий
];

const selectColorsToBe = [
  "#FFE600", // L1: Affirmative (to be) - Сяючий сонячно-жовтий
  "#F59E0B", // L2: Negative full (to be) - Теплий бурштин
  "#D97706", // L3: Negative contracted (to be) - Глибока бронза
  "#FB923C", // L4: Interrogative about Aff (to be) - Неоново-помаранчевий
  "#EA580C", // L5: Interrogative about Neg full (to be) - Насичений теракот
  "#C2410C"  // L6: Interrogative about Neg contr (to be) - Глибокий мідно-вогняний
];

// -------------------------------------------------------------
// Shakespeare Holographic Quote Banner
// Dynamically triggers when verbType changes to/from 'to be'
// Glides smoothly above the matrix oriented towards camera
// Completely unrendered (visible = false) when inactive to prevent dark silhouettes
// -------------------------------------------------------------
function ShakespeareQuoteBanner({ verbType, isIntroActive }) {
  const groupRef = useRef();
  const textRef = useRef();
  const authorRef = useRef();

  const prevVerbType = useRef(verbType);
  const animTime = useRef(0);
  const isPlaying = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (prevVerbType.current !== verbType && !isIntroActive) {
      prevVerbType.current = verbType;
      animTime.current = 0;
      isPlaying.current = true;
      if (groupRef.current) {
        groupRef.current.visible = true;
      }
    }
  }, [verbType, isIntroActive]);

  useFrame(({ camera }, delta) => {
    if (!isPlaying.current) return;

    animTime.current += delta;
    const t = animTime.current;
    const duration = 2.8; // 2.8 seconds total presentation

    if (t > duration) {
      isPlaying.current = false;
      if (groupRef.current) groupRef.current.visible = false;
      if (textRef.current) textRef.current.fillOpacity = 0;
      if (authorRef.current) authorRef.current.fillOpacity = 0;
      return;
    }

    // Envelope: Fade-in 0..0.4s, Hold 0.4..2.0s, Fade-out 2.0..2.8s
    let opacity = 0;
    if (t < 0.4) {
      opacity = t / 0.4;
    } else if (t < 2.0) {
      opacity = 1.0;
    } else {
      opacity = (duration - t) / 0.8;
    }

    // Billboarding: Face the camera directly
    if (groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
      // Gentle floating ascent
      const yOffset = 5.2 + (t * 0.18);
      groupRef.current.position.set(0, yOffset, -1.65);
    }

    // Simultaneously control fillOpacity and outlineOpacity so outline never casts dark silhouette
    if (textRef.current) {
      textRef.current.fillOpacity = opacity;
      textRef.current.outlineOpacity = opacity;
    }
    if (authorRef.current) {
      authorRef.current.fillOpacity = opacity * 0.9;
      authorRef.current.outlineOpacity = opacity * 0.9;
    }
  });

  const mainText = "“To be, or not to be, that is the question”";
  const subText = "— William Shakespeare, Hamlet (Act III, Scene 1)";
  const mainColor = "#FFE600";
  const subColor = "#FFAF00";

  return (
    <group ref={groupRef} position={[0, 5.2, -1.65]} visible={false}>
      <Text
        ref={textRef}
        position={[0, 0.22, 0]}
        fontSize={0.24}
        color={mainColor}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
        outlineWidth={0.015}
        outlineColor="#070A13"
        fillOpacity={0}
        outlineOpacity={0}
        renderOrder={30}
      >
        {mainText}
      </Text>
      <Text
        ref={authorRef}
        position={[0, -0.10, 0]}
        fontSize={0.13}
        color={subColor}
        fontStyle="italic"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        outlineWidth={0.008}
        outlineColor="#070A13"
        fillOpacity={0}
        outlineOpacity={0}
        renderOrder={30}
      >
        {subText}
      </Text>
    </group>
  );
}

export default function GrammarCube({ 
  selectedCell, 
  setSelectedCell, 
  filters,
  verbType,
  isExploded,
  explodeSubMode = 'off',
  selectedLayerIdx = 0,
  onSelectLayer,
  showRobotCS,
  showRobotHand = false,
  showAxisHeaders = true,
  robotCSScale = 1.0,
  robotHandScale = 1.0,
  handMaterialStyle = 'hologram',
  isIntroActive,
  isIntroStarted = false,
  onIntroComplete
}) {
  const spacing = 2.2;
  const size = 1.4;

  // Track hovered cell
  const [hoveredCell, setHoveredCell] = useState(null);

  // Track previously selected cell ID to know which cell was just deselected and needs to smoothly slide back
  const prevSelectedCellIdRef = useRef(null);
  const selectedCellId = selectedCell ? `${selectedCell.voice}-${selectedCell.aspect}-${selectedCell.time}` : null;
  const lastDeselectedCellIdRef = useRef(null);

  useEffect(() => {
    if (prevSelectedCellIdRef.current && prevSelectedCellIdRef.current !== selectedCellId) {
      lastDeselectedCellIdRef.current = prevSelectedCellIdRef.current;
    }
    prevSelectedCellIdRef.current = selectedCellId;
  }, [selectedCellId]);

  return (
    <group>
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Robotic Coordinate System Frame (XYZ Axis Arrows) */}
      {showRobotCS && <RoboticCSFrame scale={robotCSScale} origin={[0, 0, -1.65]} />}

      {/* Robotic Hand Frame (Right-Hand Rule: Index: +X, Middle: +Y, Thumb: +Z) */}
      {/* Kept mounted with visible={showRobotHand} so vertex colors and STL buffers initialize at start, making toggling instantaneous */}
      <group visible={showRobotHand}>
        <RoboticHandFrame 
          scale={robotHandScale} 
          origin={[0, 0, -1.65]} 
          handMaterialStyle={handMaterialStyle} 
          visible={showRobotHand}
        />
      </group>

      {/* Shakespeare Holographic Quote Banner: triggers on "to be" toggle */}
      <ShakespeareQuoteBanner verbType={verbType} isIntroActive={isIntroActive} />

      {/* Step 3: Matrix Grid Headers (Aspects along X, Times along Y, Voices along Z) with Dual Perspective (Active <-> Passive) */}
      {!isIntroActive && showAxisHeaders && (
        <AxisHeaders 
          spacing={spacing} 
          filters={filters} 
          selectedCell={selectedCell} 
        />
      )}

      {/* Intro Animation */}
      {isIntroActive && <IntroAnimation isStarted={isIntroStarted} onComplete={onIntroComplete} />}

      {/* Grid of cells - kept mounted in background to pre-compile geometry and text shaders, eliminating Suspense drop-out */}
      <group visible={!isIntroActive}>
        {["Active", "Passive"].map((voice, zIdx) => {
        const isVoiceActive = !filters.voice || filters.voice === voice;
        const z_coord = -zIdx * (spacing * 1.5);

        return times.map((time, yIdx) => {
          const isTimeActive = !filters.time || filters.time === time;
          const y_coord = (1.5 - yIdx) * spacing;

          return aspects.map((aspect, xIdx) => {
            const isAspectActive = !filters.aspect || filters.aspect === aspect;
            const x_coord = (xIdx - 1.5) * spacing;

            const cellId = `${voice}-${aspect}-${time}`;
            const isSelected = selectedCell && 
                              selectedCell.voice === voice && 
                              selectedCell.aspect === aspect && 
                              selectedCell.time === time;
            
            const isActive = isVoiceActive && isTimeActive && isAspectActive;

            // Grid base position
            const gridPos = [x_coord, y_coord, z_coord];

            // Hover state
            const isHovered = hoveredCell === cellId;

            // Color scheme
            const isToBeCell = voice === "Active" && aspect === "Simple" && (time === "Present" || time === "Past");
            const isCurrentToBeActive = isToBeCell && verbType === "to be";

            const baseColor = voice === "Active" ? (isCurrentToBeActive ? "#FFAF00" : "#00F0FF") : "#FF007F";
            const hoverColor = voice === "Active" ? (isCurrentToBeActive ? "#ffc247" : "#66f5ff") : "#ff4da6";
            const selectColor = isCurrentToBeActive ? "#FFE600" : "#39FF14";

            let cellColor = baseColor;
            if (isSelected) cellColor = selectColor;
            else if (isHovered) cellColor = hoverColor;

            const isPassiveDisabled = voice === "Passive" && verbType === "to be";
            const isClickable = isActive && !isPassiveDisabled;

            // Opacity settings
            let opacity = 0.5;
            if (isPassiveDisabled || !isActive) {
              opacity = 0.015;
            } else if (isSelected) {
              opacity = 0.6;
            } else if (isHovered) {
              opacity = 0.35;
            }

            let edgeOpacity = 0.8;
            if (isPassiveDisabled) {
              edgeOpacity = 0.05;
            } else if (!isActive) {
              edgeOpacity = 0.08;
            }

            // Render selected cell with silky-smooth 6-layer fluid animation
            if (isSelected) {
              const rainbowPalette = isCurrentToBeActive ? selectColorsToBe : selectColors;

              return (
                <SelectedCellLayeredGroup
                  key={cellId}
                  cellId={cellId}
                  basePos={gridPos}
                  voice={voice}
                  aspect={aspect}
                  time={time}
                  verbType={verbType}
                  size={size}
                  isExploded={isExploded}
                  explodeSubMode={explodeSubMode}
                  selectedLayerIdx={selectedLayerIdx}
                  cellColor={cellColor}
                  rainbowPalette={rainbowPalette}
                  opacity={opacity}
                  edgeOpacity={edgeOpacity}
                  isClickable={isClickable}
                  onHover={(hover) => {
                    if (isClickable) setHoveredCell(hover ? cellId : null);
                  }}
                  onClick={() => {
                    if (isClickable) setSelectedCell({ voice, aspect, time });
                  }}
                  onSelectLayer={onSelectLayer}
                />
              );
            }

            const isJustDeselected = lastDeselectedCellIdRef.current === cellId;

            // Standard cell rendering
            return (
              <CellBox
                key={cellId}
                id={cellId}
                voice={voice}
                aspect={aspect}
                time={time}
                position={gridPos}
                args={[size, size, size]}
                color={cellColor}
                opacity={opacity}
                edgeOpacity={edgeOpacity}
                isActive={isClickable}
                isHovered={isHovered}
                wasJustDeselected={isJustDeselected}
                zIdx={zIdx}
                yIdx={yIdx}
                xIdx={xIdx}
                isIntroActive={isIntroActive}
                onHover={(hover) => {
                  if (isClickable) setHoveredCell(hover ? cellId : null);
                }}
                onClick={() => {
                  if (isClickable) {
                    setSelectedCell({ voice, aspect, time });
                  }
                }}
              />
            );
          });
        });
      })}
      </group>
    </group>
  );
}

// Silky smooth group for selected cell:
// Point 4 (explode = OFF): 100% SOLID MONOLITHIC SINGLE CUBE sliding smoothly to Z + 0.8 / -0.8 (ZERO internal seam lines).
// Point 5 (explode = ON, explodeSubMode = 'off'): EXACT ORIGINAL SILKY SMOOTH 6-layer fanning out (gap 0.0 -> 0.38, Z 0.8 -> 2.6).
// Point 6 (explode = ON, explodeSubMode = 'all'): 6 layers expand (gap = 0.65), rotate 90° (±X) & morph to 2.8 x 0.7 x 0.2333 boards.
// Point 7 (explode = ON, explodeSubMode = 'single'): Focused layer advances to Z ± 3.4, rotates 90° (±X), re-centers to Y_cell (100% opacity); other 5 layers dim to 15% opacity.
function SelectedCellLayeredGroup({
  cellId,
  basePos,
  voice,
  aspect,
  time,
  verbType = 'Standard Verb',
  size,
  isExploded,
  explodeSubMode = 'off',
  selectedLayerIdx = 0,
  cellColor,
  rainbowPalette,
  opacity,
  edgeOpacity,
  isClickable,
  onHover,
  onClick,
  onSelectLayer
}) {
  const singleMeshRef = useRef();
  const singleMatRef = useRef();

  // Primary animation refs for Z-glide (0.0 -> 0.8 -> 2.6) and Gap-fanout (0.0 -> 0.38 -> 0.65)
  const curZOffset = useRef(isExploded ? 2.6 : 0.0);
  const curGap = useRef(isExploded ? (explodeSubMode === 'all' ? 0.65 : 0.38) : 0.0);

  const targetZOffset = isExploded ? 2.6 : 0.8;
  const targetGap = isExploded ? (explodeSubMode === 'all' ? 0.65 : 0.38) : 0.0;

  const layerMeshRefs = useRef([]);
  const layerMatRefs = useRef([]);
  const layerColorRefs = useRef(rainbowPalette.map(() => new THREE.Color(cellColor)));

  // Secondary transformation refs ONLY for sub-modes 'all' and 'single'
  const curRotX = useRef(Array.from({ length: 6 }).map(() => 0));
  const curScaleX = useRef(Array.from({ length: 6 }).map(() => 1.0));
  const curScaleY = useRef(Array.from({ length: 6 }).map(() => 1.0));
  const curScaleZ = useRef(Array.from({ length: 6 }).map(() => 1.0));
  const curSingleY = useRef(Array.from({ length: 6 }).map(() => basePos[1]));
  const curSingleZ = useRef(Array.from({ length: 6 }).map(() => basePos[2] + (voice === "Active" ? 3.7 : -3.7)));
  const curOpacity = useRef(Array.from({ length: 6 }).map(() => opacity));
  const curTextOpacity = useRef(Array.from({ length: 6 }).map(() => 0.0));
  const titleTextRefs = useRef([]);
  const formulaTextRefs = useRef([]);
  const activeFocusedLayerIdxRef = useRef(selectedLayerIdx);
  const [hoveredLayerIdx, setHoveredLayerIdx] = useState(null);
  const solidTextRef = useRef();
  // Only enter layer animation if the cell is currently exploded OR has been exploded during this selection
  const hasBeenExplodedRef = useRef(isExploded);
  if (isExploded) {
    hasBeenExplodedRef.current = true;
  }
  const [isRetractedState, setIsRetractedState] = useState(!isExploded);

  useFrame(() => {
    const fastLerpFactor = 0.055; // Fast lerp for gap separation & height shrinking
    const rotLerpFactor = 0.050;  // Slow, smooth lerp for rotation to lag behind gap expansion

    // Smooth Z-slide lerp (increased from 0.025 to 0.055 so extension is twice as fast with smooth damping)
    curZOffset.current += (targetZOffset - curZOffset.current) * 0.055;
    // Smooth vertical gap fanning lerp (happens fast so plates separate before rotating)
    curGap.current += (targetGap - curGap.current) * fastLerpFactor;

    const zSign = voice === "Active" ? 1 : -1;
    const currentZ = basePos[2] + zSign * curZOffset.current;

    // Check if layers are completely collapsed back into monolithic position
    const maxRotRemaining = Math.max(...curRotX.current.map(r => Math.abs(r)));
    const isRetracted = !isExploded && curGap.current <= 0.015 && Math.abs(curZOffset.current - 0.8) <= 0.05 && maxRotRemaining <= 0.05;

    if (isRetracted !== isRetractedState) {
      setIsRetractedState(isRetracted);
    }

    // Keep monolithic single mesh position updated for when it is displayed
    if (singleMeshRef.current) {
      singleMeshRef.current.position.set(basePos[0], basePos[1], currentZ);
    }

    // When not retracted, animate the 6 layers dynamically (both expanding on explode: ON and retracting on explode: OFF)
    const layerHeight = size / 6;
    const gap = curGap.current;
    const totalHeight = 6 * layerHeight + 5 * gap;
    const activeRotX = voice === "Active" ? Math.PI / 2 : -Math.PI / 2;

      // Sequential layer handoff check for Stage 7:
      // If user selected a new layer, wait for active layer to fully retract to stack before switching focus
      if (explodeSubMode === 'single') {
        if (activeFocusedLayerIdxRef.current === null || activeFocusedLayerIdxRef.current === undefined) {
          activeFocusedLayerIdxRef.current = selectedLayerIdx;
        } else if (activeFocusedLayerIdxRef.current !== selectedLayerIdx) {
          const oldIdx = activeFocusedLayerIdxRef.current;
          const oldDefaultZ = currentZ;
          const oldRot = Math.abs(curRotX.current[oldIdx]);
          const oldZAdv = Math.abs(curSingleZ.current[oldIdx] - oldDefaultZ);

          // Handoff to new layer ONLY when old layer has completed 3-phase reverse retraction back to stack
          if (oldRot < 0.20 && oldZAdv <= 0.65) {
            activeFocusedLayerIdxRef.current = selectedLayerIdx;
          }
        }
      } else {
        activeFocusedLayerIdxRef.current = selectedLayerIdx;
      }

      for (let i = 0; i < 6; i++) {
        const mesh = layerMeshRefs.current[i];
        const mat = layerMatRefs.current[i];

        // Position slices from Top (L1: i=0) to Bottom (L6: i=5)
        const defaultY = basePos[1] + totalHeight / 2 - layerHeight / 2 - i * (layerHeight + gap);
        const defaultZ = currentZ;

        let targetRotXVal = 0;
        let targetSx = 1.0; // local X scale (1.4 * 2.0 = 2.8000 World Width X)
        let targetSy = 1.0; // local Y scale (0.2333 * 1.0 = 0.2333 World Thickness Z after 90° X rot)
        let targetSz = 1.0; // local Z scale (1.4 * 0.5 = 0.7000 World Height Y after 90° X rot)
        let targetOp = opacity;
        let targetY = defaultY;
        let targetZ = defaultZ;

        if (explodeSubMode === 'all') {
          // Point 6: All 6 layers rotate 90° (±X) & morph to 2.8000 x 0.7000 x 0.2333 boards
          targetRotXVal = activeRotX;
          targetSx = 2.0; // World Width X = 2.8000
          targetSy = 1.0; // World Thickness Z = 0.2333
          targetSz = 0.5; // World Height Y = 0.7000
          targetOp = 0.85;
        } else if (explodeSubMode === 'single') {
          // Point 7: Strict 4-Phase Sequential Kinematic Sequence for Forward Activation & Reverse Retraction
          const currentActiveIdx = activeFocusedLayerIdxRef.current;
          const zPhase1Out = basePos[2] + zSign * 4.1;   // Clearance advance Z = ±4.1
          const zFinalSettle = basePos[2] + zSign * 3.7; // Final resting Z = ±3.7

          if (i === currentActiveIdx) {
            const zAdvanced = Math.abs(curSingleZ.current[i] - defaultZ);
            const rotProgress = Math.abs(curRotX.current[i]) / (Math.PI / 2);
            const yCentered = Math.abs(curSingleY.current[i] - basePos[1]) <= 0.08;
            const yAtDefault = Math.abs(curSingleY.current[i] - defaultY) <= 0.08;

            // Case A: Target selected layer -> STRICT 4-PHASE FORWARD ANIMATION
            if (selectedLayerIdx === i) {
              targetSx = 2.0;
              targetSy = 1.0;
              targetSz = 0.5;
              targetOp = 1.0;

              // Forward Phase 4: Settle back Z = ±4.1 -> ±3.7 (rotated 90°, Y centered at basePos[1])
              if (rotProgress >= 0.75 && yCentered) { /////////////////////
                targetY = basePos[1];
                targetZ = zFinalSettle;
                targetRotXVal = activeRotX;
              }
              // Forward Phase 3: Center Y (defaultY -> basePos[1]) at Z = ±4.1 (rotated 90°)
              else if (rotProgress >= 0.75) {         /////////////////////
                targetY = basePos[1];
                targetZ = zPhase1Out;
                targetRotXVal = activeRotX;
              }
              // Forward Phase 2: Rotate 90° in open space at Z = ±4.1 (Y stays at defaultY stack level)
              else if (zAdvanced >= 1.25 || Math.abs(curRotX.current[i]) > 0.1) {
                targetY = defaultY;
                targetZ = zPhase1Out;
                targetRotXVal = activeRotX;
              }
              // Forward Phase 1: Slide out Z = ±2.6 -> ±4.1 flat (0°) with parallel size morphing (Y at defaultY)
              else {
                targetY = defaultY;
                targetZ = zPhase1Out;
                targetRotXVal = 0;
              }
            } 
            // Case B: Retracting layer -> STRICT 4-PHASE REVERSE ANIMATION (EXACT MIRROR INVERSION)
            else {
              targetOp = 1.0;

              // Reverse Phase 1: Advance out Z = ±3.7 -> ±4.1 as rotated vertical board (Y centered at basePos[1])
              if (rotProgress >= 0.75 && zAdvanced < 1.25) { /////////////////
                targetY = basePos[1];
                targetZ = zPhase1Out;
                targetRotXVal = activeRotX; // Stay rotated 90° while pushing out to Z = 4.1
                targetSx = 2.0;
                targetSy = 1.0;
                targetSz = 0.5;
              }
              // Reverse Phase 2: Return Y from basePos[1] -> defaultY at Z = ±4.1 while vertical (90°)
              else if (rotProgress >= 0.75 && !yAtDefault) { ////////////////////
                targetY = defaultY;
                targetZ = zPhase1Out;
                targetRotXVal = activeRotX; // Stay vertical while returning Y to stack level
                targetSx = 2.0;
                targetSy = 1.0;
                targetSz = 0.5;
              }
              // Reverse Phase 3: Un-rotate 90° -> 0° in open space at Z = ±4.1 (Y at defaultY stack level)
              else if (Math.abs(curRotX.current[i]) > 0.05) {
                targetY = defaultY;
                targetZ = zPhase1Out;
                targetRotXVal = 0; // Un-rotate back to flat horizontal in open space
                targetSx = 2.0;
                targetSy = 1.0;
                targetSz = 0.5;
              }
              // Reverse Phase 4: Slide back Z = ±4.1 -> ±2.6 into stack & morph back to original dimensions (1.0)
              else {
                targetY = defaultY;
                targetZ = defaultZ;
                targetRotXVal = 0;
                targetSx = 1.0;
                targetSy = 1.0;
                targetSz = 1.0;
              }
            }
          } else {
            // Un-focused layers in single mode: subtle opacity (0.15) or clear highlight (0.55) when hovered
            targetOp = (hoveredLayerIdx === i) ? 0.55 : 0.15;
          }
        }

        // Interpolate submode transformations smoothly (rotation lags behind gap expansion to avoid corner clipping!)
        curRotX.current[i] += (targetRotXVal - curRotX.current[i]) * rotLerpFactor;
        curScaleX.current[i] += (targetSx - curScaleX.current[i]) * fastLerpFactor;
        curScaleY.current[i] += (targetSy - curScaleY.current[i]) * fastLerpFactor;
        curScaleZ.current[i] += (targetSz - curScaleZ.current[i]) * fastLerpFactor;
        curSingleY.current[i] += (targetY - curSingleY.current[i]) * fastLerpFactor;
        curSingleZ.current[i] += (targetZ - curSingleZ.current[i]) * fastLerpFactor;
        curOpacity.current[i] += (targetOp - curOpacity.current[i]) * fastLerpFactor;

        // Compute kinematics completion progress for board transformation:
        // 1. Rotation completion: curRotX must be >= 95% of 90° (Math.PI / 2)
        const rotProgress = Math.min(1.0, Math.abs(curRotX.current[i]) / (Math.PI / 2));
        const isRotCompleted = rotProgress >= 0.95;

        // 2. Scale morphing completion: curScaleX must reach >= 1.9 (out of 2.0)
        const isScaleCompleted = curScaleX.current[i] >= 1.90;

        // 3. Position settle completion:
        // In 'all' mode: curGap must be close to targetGap (0.65)
        // In 'single' mode: focused layer must be settled near target Z (±3.7) and centered Y
        let isPositionSettled = false;
        if (explodeSubMode === 'all') {
          isPositionSettled = curGap.current >= 0.60;
        } else if (explodeSubMode === 'single') {
          const zFinalTarget = basePos[2] + zSign * 3.7;
          const zSettled = Math.abs(curSingleZ.current[i] - zFinalTarget) <= 0.15;
          const ySettled = Math.abs(curSingleY.current[i] - basePos[1]) <= 0.10;
          isPositionSettled = zSettled && ySettled;
        }

        // Text manifests ONLY when transformation is fully completed!
        const isReadyForText = isRotCompleted && isScaleCompleted && isPositionSettled;

        let targetTextOp = 0.0;
        if (isReadyForText) {
          if (explodeSubMode === 'all') {
            targetTextOp = 0.95;
          } else if (explodeSubMode === 'single' && i === selectedLayerIdx) {
            targetTextOp = 1.0;
          }
        }

        // Fast clean fade-in once ready, instant fade-out if moving
        const textLerp = targetTextOp > 0 ? 0.12 : 0.25;
        curTextOpacity.current[i] += (targetTextOp - curTextOpacity.current[i]) * textLerp;

        if (mesh) {
          // In 'off' mode, position Y and Z use EXACT original direct calculation
          const finalY = explodeSubMode === 'off' ? defaultY : curSingleY.current[i];
          const finalZ = explodeSubMode === 'off' ? defaultZ : curSingleZ.current[i];

          mesh.position.set(basePos[0], finalY, finalZ);
          mesh.rotation.x = curRotX.current[i];
          mesh.scale.set(curScaleX.current[i], curScaleY.current[i], curScaleZ.current[i]);

          // Position text group at the front face of the board in world space (without anisotropic scale distortion!)
          if (titleTextRefs.current[i]) {
            const isVisible = (explodeSubMode === 'all') || (explodeSubMode === 'single' && i === selectedLayerIdx);
            titleTextRefs.current[i].visible = isVisible && curTextOpacity.current[i] > 0.01;

            if (titleTextRefs.current[i].visible) {
              const zFrontOffset = (voice === 'Active' ? 1 : -1) * (0.2333 / 2 + 0.006);
              titleTextRefs.current[i].position.set(basePos[0], finalY, finalZ + zFrontOffset);
              titleTextRefs.current[i].rotation.y = (voice === 'Active' ? 0 : Math.PI);

              // Update fillOpacity on Troika Text children
              titleTextRefs.current[i].traverse((child) => {
                if (child && child.fillOpacity !== undefined) {
                  child.fillOpacity = curTextOpacity.current[i];
                }
              });
            }
          }
        }

        if (mat) {
          // Smooth tonal morphing per layer: to rainbowPalette when exploded, back to cellColor when retracting to solid cube
          const targetColor = isExploded ? new THREE.Color(rainbowPalette[i]) : new THREE.Color(cellColor);
          layerColorRefs.current[i].lerp(targetColor, fastLerpFactor);
          mat.color.copy(layerColorRefs.current[i]);
          mat.opacity = curOpacity.current[i];
        }
      }
  });

  // Stage 1 (Point 4): explode = OFF -> Render 1 single solid cube (ZERO internal seam lines!)
  // If cell was never exploded in this selection, OR if retraction has finished, render monolithic cube directly!
  if (!isExploded && (!hasBeenExplodedRef.current || isRetractedState)) {
    const isFrontVoice = voice === "Active";
    const textZFront = (isFrontVoice ? 1 : -1) * (size / 2 + 0.005);
    const textRotY = isFrontVoice ? 0 : Math.PI;

    return (
      <mesh
        ref={singleMeshRef}
        position={[basePos[0], basePos[1], basePos[2] + (isFrontVoice ? 1 : -1) * 0.8]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (isClickable) {
            document.body.style.cursor = 'pointer';
            onHover(true);
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
          onHover(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isClickable) onClick();
        }}
      >
        <boxGeometry args={[size, size, size]} />
        <meshPhysicalMaterial
          ref={singleMatRef}
          color={cellColor}
          transparent={true}
          opacity={opacity}
          roughness={0.1}
          metalness={0.1}
          transmission={0.3}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
        <Edges
          scale={1.0}
          threshold={15}
          color={cellColor}
          opacity={edgeOpacity}
          transparent={true}
        />

        {/* Front Face Text Header for Selected Sliding Cube */}
        <group position={[0, 0, textZFront]} rotation={[0, textRotY, 0]}>
          <Text
            position={[0, 0.28, 0]}
            fontSize={0.13}
            color={cellColor}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.05}
            outlineWidth={0.010}
            outlineColor="#070A13"
            renderOrder={15}
          >
            {time.toUpperCase()}
          </Text>
          <Text
            position={[0, 0.04, 0]}
            fontSize={0.12}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.04}
            outlineWidth={0.009}
            outlineColor="#070A13"
            renderOrder={15}
          >
            {aspect.toUpperCase()}
          </Text>
          <Text
            position={[0, -0.25, 0]}
            fontSize={0.09}
            color={isFrontVoice ? "#00F0FF" : "#FF007F"}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
            outlineWidth={0.007}
            outlineColor="#070A13"
            renderOrder={15}
          >
            {`${voice.toUpperCase()} VOICE`}
          </Text>
        </group>
      </mesh>
    );
  }

  // Stage 2 (Points 5, 6, 7): explode = ON -> Render 6 stacked horizontal slices / information boards
  const layerHeight = size / 6;

  return (
    <group>
      {Array.from({ length: 6 }).map((_, idx) => {
        const layerId = `${cellId}-layer-${idx}`;
        const isFocused = explodeSubMode === 'single' && idx === selectedLayerIdx;

        // Retrieve exact grammar data formula for this layer:
        const sType = sentenceTypes[idx];
        const voiceKey = voice === 'Active' ? 'Active Voice' : 'Passive Voice';
        const vTypeKey = voice === 'Passive' ? 'Standard Verb' : verbType;
        const layerGrammar = grammarData?.[voiceKey]?.[vTypeKey]?.[aspect]?.[time]?.[sType];
        const formulaText = layerGrammar?.formula || sType;

        // Visual board dimensions in mesh local space:
        // Local X is width (size = 1.4), Local Y is board height (when rotated around X, Y+ faces front Z+)
        const textYOffset = voice === 'Active' ? (layerHeight / 2 + 0.006) : (-layerHeight / 2 - 0.006);
        const textRotX = voice === 'Active' ? -Math.PI / 2 : Math.PI / 2;

        // In 'single' mode, ONLY the focused layer (idx === selectedLayerIdx) should show text.
        // In 'all' mode, all 6 layers show text.
        const shouldRenderText = (explodeSubMode === 'all') || (explodeSubMode === 'single' && isFocused);

        return (
          <group key={layerId}>
            {/* The 3D Glass Layer / Board Mesh */}
            <mesh
              ref={(el) => (layerMeshRefs.current[idx] = el)}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (isClickable) {
                  document.body.style.cursor = 'pointer';
                  setHoveredLayerIdx(idx);
                  onHover(true);
                }
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'default';
                setHoveredLayerIdx(null);
                onHover(false);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isClickable) {
                  if (onSelectLayer) {
                    onSelectLayer(idx);
                  }
                }
              }}
            >
              <boxGeometry args={[size, layerHeight, size]} />
              <meshPhysicalMaterial
                ref={(el) => (layerMatRefs.current[idx] = el)}
                color={cellColor}
                transparent={true}
                opacity={opacity}
                roughness={0.1}
                metalness={0.1}
                transmission={0.3}
                thickness={0.5}
                side={THREE.DoubleSide}
              />
              <Edges
                scale={1.0}
                threshold={15}
                color={rainbowPalette[idx]}
                opacity={isFocused ? 1.0 : (explodeSubMode === 'single' ? (hoveredLayerIdx === idx ? 0.95 : 0.35) : 0.85)}
                transparent={true}
              />
            </mesh>

            {/* Board Text Labels - Grouped separately so mesh scale (2.0x, 0.5x) does NOT stretch the font */}
            {/* Kept permanently mounted to prevent React.Suspense from unmounting the canvas scene during font compilation */}
            <group ref={(el) => (titleTextRefs.current[idx] = el)} visible={false} raycast={() => null}>
              {/* Board Header (Sentence Type) */}
              <Text
                position={[-1.25, 0.22, 0.005]}
                fontSize={0.08}
                color={rainbowPalette[idx]}
                anchorX="left"
                anchorY="middle"
                outlineWidth={0.006}
                outlineColor="#070A13"
                renderOrder={10}
                fillOpacity={0}
                raycast={() => null}
              >
                {sType}
              </Text>

              {/* Board Central Grammar Formula Syntax (Perfect 1:1 Aspect Ratio) */}
              <Text
                position={[0, -0.05, 0.005]}
                fontSize={0.095}
                maxWidth={2.60}
                textAlign="center"
                lineHeight={1.25}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.008}
                outlineColor="#070A13"
                renderOrder={10}
                fillOpacity={0}
                raycast={() => null}
              >
                {formulaText}
              </Text>
            </group>
          </group>
        );
      })}
    </group>
  );
}

// Standard single cell box component with Step 2 Face Labels
function CellBox({ 
  id,
  voice,
  aspect,
  time,
  position, 
  args, 
  color, 
  opacity, 
  edgeOpacity, 
  isActive, 
  isHovered = false,
  wasJustDeselected = false,
  zIdx = 0,
  yIdx = 0,
  xIdx = 0,
  isIntroActive = false,
  onHover, 
  onClick 
}) {
  const meshRef = useRef();
  const materialRef = useRef();

  const textRef = useRef();
  // If this cube was just deselected, smoothly start at its extended position (Z = basePos.z ± 0.8) so it glides back into grid seamlessly!
  const zSign = voice === "Active" ? 1 : -1;
  const initialZ = wasJustDeselected ? (position[2] + zSign * 0.8) : position[2];
  const currentPos = useRef(new THREE.Vector3(position[0], position[1], initialZ));
  const currentColor = useRef(new THREE.Color(color));

  // Staggered text wave: spreads smoothly across the matrix
  // x: aspect (0..3), y: time (0..3), z: voice (0..1)
  const staggerDelay = (xIdx * 0.05) + (yIdx * 0.04) + (zIdx * 0.22);
  const timeSinceIntroDone = useRef(0);
  const curTextOpacity = useRef(0.0);

  useFrame((_, delta) => {
    if (meshRef.current) {
      currentPos.current.lerp(new THREE.Vector3(...position), 0.075);
      meshRef.current.position.copy(currentPos.current);
    }
    if (materialRef.current) {
      currentColor.current.lerp(new THREE.Color(color), 0.07);
      materialRef.current.color.copy(currentColor.current);
    }

    if (isIntroActive) {
      timeSinceIntroDone.current = 0;
      curTextOpacity.current = 0.0;
    } else {
      timeSinceIntroDone.current += delta;
      const targetBaseOpacity = !isActive ? 0.08 : (opacity >= 0.3 ? 0.95 : 0.65);
      
      if (timeSinceIntroDone.current > staggerDelay) {
        curTextOpacity.current = THREE.MathUtils.lerp(curTextOpacity.current, targetBaseOpacity, 0.10);
      } else {
        curTextOpacity.current = 0.0;
      }
    }

    if (textRef.current) {
      textRef.current.fillOpacity = curTextOpacity.current;
    }
  });

  const isFrontVoice = voice === "Active";
  const size = args ? args[0] : 1.4;
  const textZFront = (isFrontVoice ? 1 : -1) * (size / 2 + 0.005);
  const textRotY = isFrontVoice ? 0 : Math.PI;

  // Short clean labels
  const timeShort = time === "Future in the Past" ? "F.I.P." : time.toUpperCase();
  const aspectShort = aspect === "Perfect Continuous" ? "PERF. CONT." : aspect.toUpperCase();

  // High contrast text opacity: dim when inactive, bright when hovered/active
  const textFillOpacity = !isActive ? 0.08 : (opacity >= 0.3 ? 0.95 : 0.65);

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (isActive) {
          document.body.style.cursor = 'pointer';
          onHover(true);
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
        onHover(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isActive) onClick();
      }}
    >
      <boxGeometry args={args} />
      {isHovered ? (
        <meshPhysicalMaterial
          ref={materialRef}
          color={color}
          transparent={true}
          opacity={opacity}
          roughness={0.1}
          metalness={0.1}
          transmission={0.3}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          transparent={true}
          opacity={opacity}
          roughness={0.15}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      )}
      <Edges
        scale={1.0}
        threshold={15}
        color={color}
        opacity={edgeOpacity}
        transparent={true}
      />

      {/* Step 2: Face Typography for 32 Grid Cubes (Consolidated to 1 Draw Call per cell) */}
      <group position={[0, 0, textZFront]} rotation={[0, textRotY, 0]}>
        <Text
          ref={textRef}
          position={[0, -0.04, 0]}
          fontSize={0.095}
          lineHeight={1.45}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
          outlineWidth={0.007}
          outlineColor="#070A13"
          fillOpacity={0.0}
          renderOrder={12}
        >
          {`${timeShort}\n${aspectShort}\n${voice.toUpperCase()}`}
        </Text>
      </group>
    </mesh>
  );
}

// -------------------------------------------------------------
// Step 3 Component: Dual-Perspective Axis Headers (Active <-> Passive)
// Dynamically detects camera position relative to matrix center Z = -1.65.
// Smoothly fades to invisible during edge-on (side profile) rotation,
// and orients typography directly towards the viewer on both sides.
// -------------------------------------------------------------
function AxisHeaders({ spacing, filters, selectedCell }) {
  const groupRef = useRef();
  const curOpacity = useRef(1.0);
  const curZ = useRef(0.75);
  const curRotY = useRef(0);
  const curSideX = useRef(-4.35);

  const zActive = 0.75;
  const zPassive = -4.05;
  const zCenter = -1.65;

  const [isPassiveView, setIsPassiveView] = useState(false);
  const entranceTimer = useRef(0);
  const entranceOpacity = useRef(0.0);

  useFrame(({ camera }, delta) => {
    // Smooth entrance fade-in (appears softly ~0.35s after intro completes, perfectly timed with wave)
    entranceTimer.current += delta;
    if (entranceTimer.current > 0.35) {
      entranceOpacity.current = THREE.MathUtils.lerp(entranceOpacity.current, 1.0, 0.08);
    }

    // Delta Z from matrix center to camera
    const deltaZ = camera.position.z - zCenter;
    const shouldBePassive = deltaZ < 0;

    if (shouldBePassive !== isPassiveView) {
      setIsPassiveView(shouldBePassive);
    }

    // Edge-on fade zone: when |deltaZ| is between 0 and 2.0, smoothly fade out to 0
    const edgeThreshold = 2.0;
    const targetAngleOpacity = THREE.MathUtils.clamp(Math.abs(deltaZ) / edgeThreshold, 0, 1);
    curOpacity.current = THREE.MathUtils.lerp(curOpacity.current, targetAngleOpacity, 0.18);

    const combinedOpacity = curOpacity.current * entranceOpacity.current;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child && child.fillOpacity !== undefined) {
          child.fillOpacity = (child.userData?.baseOpacity || 1.0) * combinedOpacity;
        } else if (child && child.isMesh && child.material) {
          child.material.opacity = (child.userData?.baseOpacity || 0.3) * combinedOpacity;
        }
      });
    }
  });

  // Current orientation parameters
  const currentZ = isPassiveView ? zPassive : zActive;
  const rotY = isPassiveView ? Math.PI : 0;
  // Rigorous symmetry:
  // In Active View: rotY = 0, sideX = -4.35, anchorX = "right". The text starts further left and ends at -4.35.
  // In Passive View: looking from -Z with rotY = Math.PI, the local +X axis points LEFT in viewer's space!
  // Therefore, setting sideX = +4.35, anchorX = "right" produces the EXACT MIRROR geometry:
  // The anchor point is at world X = +4.35, and text extends to the viewer's left (towards higher world X).
  const sideX = isPassiveView ? 4.35 : -4.35;
  const textAnchor = "right";
  const bracketOffset = 0.16;

  const frontVoiceName = isPassiveView ? "PASSIVE VOICE" : "ACTIVE VOICE";
  const backVoiceName = isPassiveView ? "ACTIVE VOICE" : "PASSIVE VOICE";
  const frontVoiceColor = isPassiveView ? "#FF007F" : "#00F0FF";
  const backVoiceColor = isPassiveView ? "#00F0FF" : "#FF007F";
  const otherZ = isPassiveView ? zActive : zPassive;

  return (
    <group ref={groupRef}>
      {/* 1. Top Aspect Headers along X (above Present row at Y = +4.25) */}
      {aspects.map((aspect, idx) => {
        const x_coord = (idx - 1.5) * spacing;
        const isAspectHighlighted = filters.aspect === aspect || (selectedCell && selectedCell.aspect === aspect);

        return (
          <group 
            key={`header-aspect-${aspect}`} 
            position={[x_coord, 4.25, currentZ]}
            rotation={[0, rotY, 0]}
          >
            <Text
              position={[0, 0, 0]}
              fontSize={0.16}
              color={isAspectHighlighted ? "#FFE600" : "#FFFFFF"}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.06}
              outlineWidth={0.012}
              outlineColor="#070A13"
              renderOrder={20}
              userData={{ baseOpacity: 1.0 }}
            >
              {aspect.toUpperCase()}
            </Text>
            {/* Visual marker bracket under header */}
            <mesh position={[0, -0.16, 0]} userData={{ baseOpacity: isAspectHighlighted ? 0.9 : 0.35 }}>
              <boxGeometry args={[1.2, 0.02, 0.02]} />
              <meshBasicMaterial 
                color={isAspectHighlighted ? "#FFE600" : "#FFFFFF"} 
                transparent={true}
                opacity={isAspectHighlighted ? 0.9 : 0.35}
              />
            </mesh>
          </group>
        );
      })}

      {/* 2. Side Time Perspective Headers along Y */}
      {times.map((time, idx) => {
        const y_coord = (1.5 - idx) * spacing;
        const isTimeHighlighted = filters.time === time || (selectedCell && selectedCell.time === time);

        return (
          <group 
            key={`header-time-${time}`} 
            position={[sideX, y_coord, currentZ]}
            rotation={[0, rotY, 0]}
          >
            <Text
              position={[0, 0, 0]}
              fontSize={0.15}
              color={isTimeHighlighted ? "#00F0FF" : "#94A3B8"}
              anchorX={textAnchor}
              anchorY="middle"
              letterSpacing={0.05}
              outlineWidth={0.012}
              outlineColor="#070A13"
              renderOrder={20}
              userData={{ baseOpacity: isTimeHighlighted ? 1.0 : 0.8 }}
            >
              {time.toUpperCase()}
            </Text>
            {/* Visual marker bracket next to header */}
            <mesh position={[bracketOffset, 0, 0]} userData={{ baseOpacity: isTimeHighlighted ? 0.9 : 0.25 }}>
              <boxGeometry args={[0.02, 0.8, 0.02]} />
              <meshBasicMaterial 
                color={isTimeHighlighted ? "#00F0FF" : "#FFFFFF"} 
                transparent={true}
                opacity={isTimeHighlighted ? 0.9 : 0.25}
              />
            </mesh>
          </group>
        );
      })}

      {/* 3. Front Voice Plane Header */}
      <group position={[sideX, 4.25, currentZ]} rotation={[0, rotY, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.16}
          color={frontVoiceColor}
          anchorX={textAnchor}
          anchorY="middle"
          letterSpacing={0.08}
          outlineWidth={0.012}
          outlineColor="#070A13"
          renderOrder={20}
          userData={{ baseOpacity: 1.0 }}
        >
          {frontVoiceName}
        </Text>
      </group>

      {/* 4. Back Voice Plane Header (Visible in depth behind the matrix) */}
      <group position={[sideX, 4.25, otherZ]} rotation={[0, rotY, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.16}
          color={backVoiceColor}
          anchorX={textAnchor}
          anchorY="middle"
          letterSpacing={0.08}
          outlineWidth={0.012}
          outlineColor="#070A13"
          renderOrder={20}
          userData={{ baseOpacity: 0.65 }}
        >
          {backVoiceName}
        </Text>
      </group>
    </group>
  );
}

