import React, { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Sparkles, HelpCircle, RefreshCw, Layers, Compass, ZoomIn, RotateCcw, Play, Menu, X } from 'lucide-react';
import grammarData from './grammar_data.json';
import GrammarCube from './GrammarCube';
import './App.css';

const aspects = ["Simple", "Continuous", "Perfect", "Perfect Continuous"];
const times = ["Present", "Past", "Future", "Future in the Past"];
const voices = ["Active", "Passive"];

const sentenceTypes = [
  "Affirmative",
  "Negative full (not)",
  "Negative contracted (n't)",
  "Interrogative about Affirmative",
  "Interrogative about Negative full (not)",
  "Interrogative about Negative contracted (n't)"
];

// Helper component: pre-compiles all scene shaders to eliminate first-interaction hitching
function SceneWarmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    try {
      gl.compile(scene, camera);
    } catch (e) {
      // Graceful fallback if context is initializing
    }
  }, [gl, scene, camera]);
  return null;
}

export default function App() {
  const [selectedCell, setSelectedCell] = useState(null);

  const [filters, setFilters] = useState({
    voice: "",
    aspect: "",
    time: ""
  });

  const [verbType, setVerbType] = useState("Standard Verb");
  const [isExploded, setIsExploded] = useState(false);
  const [explodeSubMode, setExplodeSubMode] = useState('off'); // 'off' | 'all' | 'single'
  const [selectedLayerIdx, setSelectedLayerIdx] = useState(0); // 0..5
  const [showRobotCS, setShowRobotCS] = useState(false);
  const [showRobotHand, setShowRobotHand] = useState(false);
  const [showAxisHeaders, setShowAxisHeaders] = useState(true);
  const [robotCSScale, setRobotCSScale] = useState(1.0);
  const [robotHandScale, setRobotHandScale] = useState(1.0);
  const [handMaterialStyle, setHandMaterialStyle] = useState('chromatic_axes');
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [isIntroStarted, setIsIntroStarted] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Start Intro sequence animation
  const handleStartIntro = () => {
    setIsIntroStarted(true);
  };

  // Replay / Reset sequence back to solid monolithic cube at rest
  const handleReplayIntro = () => {
    setSelectedCell(null);
    setIsExploded(false);
    setExplodeSubMode('off');
    setSelectedLayerIdx(0);
    setIsIntroStarted(false);
    setIntroKey(prev => prev + 1);
    setIsIntroActive(true);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ voice: "", aspect: "", time: "" });
  };

  // Helper to extract formulas from json
  const getCellData = () => {
    if (!selectedCell) return null;
    const { voice, aspect, time } = selectedCell;

    // Check if cell is an exception for 'to be'
    const isException = voice === "Active" && aspect === "Simple" && (time === "Present" || time === "Past");
    const activeVerbType = isException ? verbType : "Standard Verb";
    const voiceKey = voice === "Active" ? "Active Voice" : (voice === "Passive" ? "Passive Voice" : voice);

    try {
      const data = grammarData[voiceKey]?.[activeVerbType]?.[aspect]?.[time];
      return data || null;
    } catch (e) {
      console.warn("Could not find data for selected cell", selectedCell, activeVerbType);
      return null;
    }
  };

  const handleSelectCell = (cell) => {
    if (!cell) {
      setSelectedCell(null);
      return;
    }
    if (selectedCell && 
        selectedCell.voice === cell.voice && 
        selectedCell.aspect === cell.aspect && 
        selectedCell.time === cell.time) {
      setSelectedCell(null);
    } else {
      setSelectedCell(cell);
    }
  };

  const cellData = getCellData();
  const isPassiveSelected = selectedCell !== null && selectedCell.voice === "Passive";
  const isToBeDisabled = isPassiveSelected;

  return (
    <div className="app-container">
      {/* Mobile Floating Toggle Button (shown only when drawer is closed) */}
      {!isMobileMenuOpen && (
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Backdrop for closing mobile sidebar on tap outside */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-backdrop" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`sidebar glass-panel ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="app-header" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="app-title">ENG Visual Grammar</h1>
              <p className="app-subtitle">Interactive 3D Grammar Matrix</p>
            </div>
            {/* Close button inside header on mobile */}
            <button 
              className="mobile-close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Action Button: Single full-width dynamic button (Start -> Replay) */}
          <div style={{ width: '100%', marginTop: '2px' }}>
            {!isIntroStarted ? (
              <button 
                onClick={handleStartIntro}
                className="filter-btn" 
                title="Start / Activate 3D Matrix Transformations"
                style={{ 
                  width: '100%',
                  padding: '9px 14px', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(57, 255, 20, 0.25)',
                  borderColor: '#39FF14',
                  color: '#39FF14',
                  boxShadow: '0 0 10px rgba(57, 255, 20, 0.4)',
                  cursor: 'pointer'
                }}
              >
                <Play size={15} fill="#39FF14" />
                Start
              </button>
            ) : (
              <button 
                onClick={handleReplayIntro}
                className="filter-btn" 
                title="Reset to Initial Sphere / Monolithic Cube"
                style={{ 
                  width: '100%',
                  padding: '9px 14px', 
                  fontSize: '0.85rem', 
                  fontWeight: '500',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={15} />
                Replay
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="panel-section" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="panel-title">Filters</h2>
            {(filters.voice || filters.aspect || filters.time) && (
              <button onClick={resetFilters} className="filter-btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                Reset
              </button>
            )}
          </div>

          {/* Robotic Coordinate System Toggles & Scale Slider */}
          <div className="switch-container" style={{ margin: '8px 0 14px 0', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Toggle 1: Standard Robot CS (XYZ Axes) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span className="switch-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <Compass size={14} style={{ color: '#00F0FF' }} />
                Robot CS (XYZ Frame)
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={showRobotCS} 
                  onChange={(e) => setShowRobotCS(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Toggle 2: Hand Frame (Right-Hand Rule) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="switch-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <span style={{ fontSize: '14px' }}>✋</span>
                Hand CS (Right-Hand Rule)
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={showRobotHand} 
                  onChange={(e) => setShowRobotHand(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Toggle 3: Matrix Plane Headers (Step 3) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="switch-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <Layers size={14} style={{ color: '#FFE600' }} />
                Matrix Axis Headers
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={showAxisHeaders} 
                  onChange={(e) => setShowAxisHeaders(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Toggle 4: Global Verb Type "to be" Switch */}
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '4px',
                width: '100%', 
                paddingTop: '6px', 
                borderTop: '1px solid rgba(255,255,255,0.04)',
                opacity: isToBeDisabled ? 0.38 : 1,
                filter: isToBeDisabled ? 'grayscale(80%)' : 'none',
                transition: 'opacity 0.2s ease, filter 0.2s ease'
              }}
              title={isToBeDisabled ? 'Disabled: Passive Voice does not use the irregular "to be" paradigm' : 'Toggle "to be" verb paradigm for Active Simple'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span className="switch-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isToBeDisabled ? '#64748b' : (verbType === 'to be' ? '#FFAF00' : '#e2e8f0') }}>
                  <Sparkles size={14} style={{ color: isToBeDisabled ? '#64748b' : '#FFAF00' }} />
                  Verb: "to be"
                </span>
                <label className="toggle-switch" style={{ cursor: isToBeDisabled ? 'not-allowed' : 'pointer' }}>
                  <input 
                    type="checkbox" 
                    disabled={isToBeDisabled}
                    checked={verbType === "to be"} 
                    onChange={(e) => setVerbType(e.target.checked ? "to be" : "Standard Verb")}
                    style={{ cursor: isToBeDisabled ? 'not-allowed' : 'pointer' }}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div style={{ 
                fontSize: '0.68rem', 
                fontStyle: 'italic', 
                color: verbType === 'to be' ? 'rgba(255, 230, 0, 0.85)' : '#64748b',
                paddingLeft: '20px',
                lineHeight: 1.25,
                transition: 'color 0.2s ease'
              }}>
                “To be, or not to be...” — W. Shakespeare
              </div>
            </div>

            {/* Slider 1: Frame Size (Active when showRobotCS is ON) */}
            {showRobotCS && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px', 
                width: '100%',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                transition: 'opacity 0.2s ease' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>Frame Size</span>
                  <span style={{ color: '#00F0FF', fontWeight: 'bold' }}>{robotCSScale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.0" 
                  step="0.1"
                  value={robotCSScale} 
                  onChange={(e) => setRobotCSScale(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#00F0FF', cursor: 'pointer', margin: 0, display: 'block' }}
                />
              </div>
            )}

            {/* Slider 2: Hand Size (Active when showRobotHand is ON) */}
            {showRobotHand && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                width: '100%',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                transition: 'opacity 0.2s ease' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>Hand Size</span>
                  <span style={{ color: '#00F0FF', fontWeight: 'bold' }}>{robotHandScale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.0" 
                  step="0.1"
                  value={robotHandScale} 
                  onChange={(e) => setRobotHandScale(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#00F0FF', cursor: 'pointer', margin: 0, display: 'block' }}
                />

                {/* Dropdown: Hand Material Style */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>Hand Material Style</span>
                  <select
                    value={handMaterialStyle}
                    onChange={(e) => setHandMaterialStyle(e.target.value)}
                    style={{
                      background: 'rgba(7, 10, 19, 0.85)',
                      color: '#f8fafc',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      fontSize: '0.75rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="chromatic_axes">🎯 Chromatic Axes (White Palm + RGB Fingers)</option>
                    <option value="hologram">🔷 Hologram Cyber-Cyan (Glow)</option>
                    <option value="royal_violet">💜 Royal Violet Crystal (Glow)</option>
                    <option value="electric_white">⚡ Electric White Sensor (Glow)</option>
                    <option value="amber_glass">🔶 Warm Amber Glass (Glow)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Voice Filter */}
          <div className="filter-group" style={{ display: 'flex', flexWrap: 'nowrap', gap: '4px' }}>
            {voices.map(v => (
              <button 
                key={v}
                className={`filter-btn ${filters.voice === v ? (v === 'Active' ? 'active' : 'active-passive') : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, voice: prev.voice === v ? "" : v }))}
                style={{ flex: 1, whiteSpace: 'nowrap', padding: '6px 4px', textAlign: 'center' }}
              >
                {v} Voice
              </button>
            ))}
          </div>

          {/* Aspect Filter - Forced Single Row with 4th column expanded so 'Perfect Continuous' is fully readable */}
          <div className="filter-group" style={{ display: 'flex', flexWrap: 'nowrap', gap: '3px' }}>
            {aspects.map((a, idx) => (
              <button 
                key={a}
                className={`filter-btn ${filters.aspect === a ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, aspect: prev.aspect === a ? "" : a }))}
                style={{ 
                  flex: idx === 3 ? 1.55 : 1, 
                  minWidth: 0,
                  whiteSpace: 'nowrap', 
                  padding: '5px 2px', 
                  fontSize: '0.66rem', 
                  textAlign: 'center'
                }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Time Filter - Forced Single Row with 4th column expanded so 'Future in the Past' is fully readable */}
          <div className="filter-group" style={{ display: 'flex', flexWrap: 'nowrap', gap: '3px' }}>
            {times.map((t, idx) => (
              <button 
                key={t}
                className={`filter-btn ${filters.time === t ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, time: prev.time === t ? "" : t }))}
                style={{ 
                  flex: idx === 3 ? 1.55 : 1, 
                  minWidth: 0,
                  whiteSpace: 'nowrap', 
                  padding: '5px 2px', 
                  fontSize: '0.66rem', 
                  textAlign: 'center'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="details-panel" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {selectedCell ? (
            <>
              <div className="details-header">
                <div>
                  <div className="details-breadcrumb">
                    {selectedCell.voice} • {selectedCell.aspect}
                  </div>
                  <h2 className="details-title">{selectedCell.time}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  {/* Explode Cell Toggle */}
                  <div className="switch-container">
                    <span className="switch-label">explode</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={isExploded} 
                        onChange={(e) => {
                          setIsExploded(e.target.checked);
                          if (!e.target.checked) {
                            setExplodeSubMode('off');
                          }
                        }}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sub-mode controls when explode is ON */}
              {isExploded && (
                <div style={{ padding: '8px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0, 240, 255, 0.02)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>3D Board Mode:</span>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <button 
                        className={`filter-btn ${explodeSubMode === 'off' ? 'active' : ''}`}
                        onClick={() => setExplodeSubMode('off')}
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        Off
                      </button>
                      <button 
                        className={`filter-btn ${explodeSubMode === 'all' ? 'active' : ''}`}
                        onClick={() => setExplodeSubMode('all')}
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        All 6
                      </button>
                      <button 
                        className={`filter-btn ${explodeSubMode === 'single' ? 'active' : ''}`}
                        onClick={() => setExplodeSubMode('single')}
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        Single
                      </button>
                    </div>
                  </div>

                  {/* Single Layer Selector (Full-Width Dropdown) */}
                  {explodeSubMode === 'single' && (
                    <div style={{ marginTop: '4px', width: '100%' }}>
                      {(() => {
                        const palette = verbType === 'to be' 
                          ? ["#FFE600", "#F59E0B", "#D97706", "#FB923C", "#EA580C", "#C2410C"]
                          : ["#39FF14", "#10B981", "#059669", "#00F0FF", "#0284C7", "#2563EB"];
                        const activeColor = palette[selectedLayerIdx];

                        return (
                          <select
                            value={selectedLayerIdx}
                            onChange={(e) => setSelectedLayerIdx(Number(e.target.value))}
                            className="filter-btn"
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: activeColor,
                              borderColor: activeColor,
                              background: 'rgba(7, 10, 19, 0.95)',
                              boxShadow: `0 0 10px ${activeColor}33`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              outline: 'none',
                              textAlign: 'left'
                            }}
                          >
                            {sentenceTypes.map((st, idx) => (
                              <option 
                                key={st} 
                                value={idx}
                                style={{
                                  background: '#070A13',
                                  color: palette[idx],
                                  padding: '6px'
                                }}
                              >
                                {st}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              <div className="sentences-list">
                {cellData ? (
                  sentenceTypes.map((type, idx) => {
                    const sData = cellData[type];
                    if (!sData) return null;
                    const isLayerHighlighted = isExploded && explodeSubMode === 'single' && selectedLayerIdx === idx;

                    const palette = verbType === 'to be' 
                      ? ["#FFE600", "#F59E0B", "#D97706", "#FB923C", "#EA580C", "#C2410C"]
                      : ["#39FF14", "#10B981", "#059669", "#00F0FF", "#0284C7", "#2563EB"];
                    const cardColor = palette[idx];

                    return (
                      <div 
                        key={type} 
                        className={`sentence-card ${isLayerHighlighted ? 'highlighted' : ''}`}
                        onClick={() => {
                          if (isExploded) {
                            setExplodeSubMode('single');
                            setSelectedLayerIdx(idx);
                          }
                        }}
                        style={{
                          cursor: isExploded ? 'pointer' : 'default',
                          border: isLayerHighlighted ? `1px solid ${cardColor}` : '1px solid rgba(255,255,255,0.06)',
                          background: isLayerHighlighted ? `${cardColor}1A` : 'rgba(255, 255, 255, 0.02)',
                          boxShadow: isLayerHighlighted ? `0 0 12px ${cardColor}33` : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="sentence-type" style={{ color: isLayerHighlighted ? cardColor : undefined }}>
                            {type}
                          </span>
                        </div>
                        <span className="sentence-formula">{sData.formula}</span>
                        {sData.notes && <span className="sentence-notes">{sData.notes}</span>}
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <HelpCircle size={40} />
                    <p>Formula data not available for this combination.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <HelpCircle size={48} style={{ marginBottom: '12px', color: '#475569' }} />
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>No Cell Selected</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Click on a 3D block to inspect its grammar formulas.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="canvas-container">
        <Canvas 
          dpr={[1, 1.75]} 
          camera={{ position: [5, 4, 8], fov: 45 }} 
          onPointerMissed={() => handleSelectCell(null)}
          gl={{ powerPreference: 'high-performance', antialias: true }}
        >
          <color attach="background" args={['#070a13']} />
          <SceneWarmup />
          <OrbitControls 
            enableDamping={true} 
            makeDefault={true}
            maxDistance={45}
            minDistance={1}
          />
          <React.Suspense fallback={null}>
            <GrammarCube 
              key={`cube-${introKey}`}
              selectedCell={selectedCell} 
              setSelectedCell={handleSelectCell}
              filters={filters}
              verbType={verbType}
              isExploded={isExploded}
              explodeSubMode={explodeSubMode}
              selectedLayerIdx={selectedLayerIdx}
              onSelectLayer={(idx) => {
                setExplodeSubMode('single');
                setSelectedLayerIdx(idx);
              }}
              showRobotCS={showRobotCS}
              showRobotHand={showRobotHand}
              showAxisHeaders={showAxisHeaders}
              robotCSScale={robotCSScale}
              robotHandScale={robotHandScale}
              handMaterialStyle={handMaterialStyle}
              isIntroActive={isIntroActive}
              isIntroStarted={isIntroStarted}
              onIntroComplete={() => setIsIntroActive(false)}
            />
          </React.Suspense>
        </Canvas>

        {/* Instructions Overlay */}
        <div className="instructions-overlay glass-panel">
          <div className="instruction-item">
            <Compass size={14} />
            <span><span className="instruction-key">L-Click + Drag</span> Rotate</span>
          </div>
          <div className="instruction-item">
            <ZoomIn size={14} />
            <span><span className="instruction-key">Scroll</span> Zoom</span>
          </div>
          <div className="instruction-item">
            <Sparkles size={14} />
            <span><span className="instruction-key">Click Box</span> Inspect Cell</span>
          </div>
        </div>
      </div>
    </div>
  );
}
