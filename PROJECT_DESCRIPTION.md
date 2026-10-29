# ENG Visual Grammar

## 1. General Concept and Project Philosophy

**ENG Visual Grammar** is a dynamic spatial linguistic visualization system for the spatial representation of the English grammar structure.

The core idea of the project is to present the English grammatical system as a metaphorical cohesive spherical object that transforms into a 5-parameter matrix representation in 3D space.

1.1. Grammatical parametrization of the English language:

1.1.1. **Base state space of the English grammatical system:**
* **Aspects:** 4
  * `Simple`
  * `Continuous`
  * `Perfect`
  * `Perfect Continuous`
* **Tenses:** 4
  * `Present`
  * `Past`
  * `Future`
  * `Future in the Past`
* **Voices:** 2
  * `Active Voice`
  * `Passive Voice`
* **Sentence Types:** 6
  * `Affirmative`
  * `Negative full (not)`
  * `Negative contracted (n't)`
  * `Interrogative about Affirmative` 
  * `Interrogative about Negative full (not)` 
  * `Interrogative about Negative contracted (n't)`

  $$4 \text{ Aspects} \times 4 \text{ Tenses} \times 2 \text{ Voices} \times 6 \text{ Sentence Types} = 192 \text{ base formula templates}$$

1.1.2. **Polymorphic conditional branch (Polymorphic IF-branch) for the verb *to be*:**
  $$+12 \text{ specialized templates} \quad (2 \text{ Tenses} \times 1 \text{ Aspect} \times 1 \text{ Voice} \times 6 \text{ Sentence Types})$$

In total, this 5-level grammatical structure spatially incorporates **204 grammatical configurations**.

---

## 2. Spatial Architecture of the Grammar Matrix

The spatial representation is implemented within the **World CS (Three.js)** coordinate system, where conventionally:
* the **X-axis** is horizontal (directed horizontally to the right);
* the **Y-axis** is vertical (directed vertically upwards);
* the **Z-axis** is depth (directed perpendicular to the screen, towards the viewer).

```
               Y-axis World CS (Tenses: Present, Past, Future, Future in the Past)
                 ▲
                 │   ┌─────────────────────────┐
                 │  /                         /│
                 │ /                         / │
                 │/                         /  │
                 │─────────────────────────┼───┼──► X-axis World CS (Aspects: Simple, Continuous, Perfect, Perfect Continuous)
                /│                         │   /
               / │                         │  /
              /  │                         │ /
             ▼   └─────────────────────────┘/
   Z-axis World CS (Voice: Active / Passive)
```

### 2.1. Matrix Axes in the World Coordinate System **World CS (Three.js)**

1. **X-axis (4 Aspects):**
   * `Simple`
   * `Continuous`
   * `Perfect`
   * `Perfect Continuous`
2. **Y-axis (4 Tenses):**
   * `Present`
   * `Past`
   * `Future`
   * `Future in the Past`
3. **Z-axis (2 Voice Layers):**
   * `Active Voice` — Front matrix layer
   * `Passive Voice` — Back matrix layer

### 2.2. Visual Spatial Frame in the Scene

For engineering spatial interpretation, a 3D visualization frame **Robot CS (XYZ Frame)** and an anatomical human hand representation **Robotic Right-Hand Rule Frame** have been integrated into the scene in accordance with the **International Industrial Robotics Standard (ISO 9787 / Right-Hand Rule)**. (P.S. The project author deliberately chose this spatial representation methodology in this hobby project solely because they work and study in the field of industrial robotic automation).

#### Positioning of the **Robotic Right-Hand Rule Frame** relative to **World CS (Three.js)**:
* **$\vec{X}_{\text{robot}}$ (Red vector / `Index` finger):**
  * Directed along the $+Z_{\text{world}}$ axis.
* **$\vec{Y}_{\text{robot}}$ (Green vector / `Middle` finger):**
  * Directed along the $+X_{\text{world}}$ axis.
* **$\vec{Z}_{\text{robot}}$ (Cyan vector / `Thumb`):**
  * Directed along the $+Y_{\text{world}}$ axis (vertically upwards).

```
               Z-axis World CS (Tenses: Present, Past, Future, Future in the Past)
                 ▲
                 │   ┌─────────────────────────┐
                 │  /                         /│
                 │ /                         / │
                 │/                         /  │
                 │─────────────────────────┼───┼──► Y-axis World CS (Aspects: Simple, Continuous, Perfect, Perfect Continuous)
                /│                         │   /
               / │                         │  /
              /  │                         │ /
             ▼   └─────────────────────────┘/
   X-axis World CS (Voice: Active / Passive)                 
```

### 2.3. Internal Vector V (6 Information Slabs in Each Cell)

Upon entering the exploded view mode (`explode`), the active cube (one of 32) splits into 6 horizontal slabs/boards, each corresponding to a designated sentence type:
1. **Affirmative** — Neon Green (`#39FF14`) / Gold (`#FFE600`)
2. **Negative full (not)** — Mint (`#00FF88`) / Golden Yellow (`#FFAF00`)
3. **Negative contracted (n't)** — Cyan (`#00F0FF`) / Orange (`#FF7A00`)
4. **Interrogative about Affirmative** — Blue (`#007FFF`) / Red-Orange (`#FF4500`)
5. **Interrogative about Negative full (not)** — Violet (`#8F00FF`) / Carmine (`#FF003C`)
6. **Interrogative about Negative contracted (n't)** — Magenta (`#FF007F`) / Purple (`#E600FF`)

### 2.4. Polymorphic `to be` Switch and Dynamic Passive Voice Invalidation

* **Exception Handling Logic:** The `to be` toggle switches the matrix into the specialized linking verb operation mode. In the `Present Simple Active` and `Past Simple Active` cells, the syntactic model automatically reconstructs (removing auxiliary operators *do/does/did*), and the color palette transitions to noble gold (`#FFE600` / `#FFAF00`).
* **Absolute Passive Voice Blocking:** Since the intransitive verb *to be* grammatically cannot form a Passive Voice, activating the `to be` switch instantly renders the entire rear Passive Voice layer ($16 \text{ cubes}$) inactive: opacity drops to $1.5\%$, and clicks as well as raycasting are completely blocked.

---

## 3. Intro Animation Model

The intro sequence demonstrates the presentation of a cohesive spherical object followed by its topological transformation: first into a cubic object, which in turn transforms into a cuboid (parallelepiped), which then separates into 32 individual cubes.

### 3.1. Volume Conservation

The total volume of material in the scene is a strict invariant constant **$V_{total} = 87.808 \text{ cubic units}$** across all transformation phases — from the initial perfect sphere to the 32 matrix cubes:

$$V_{total} = V_{sphere} = V_{cube} = V_{parallelepiped} = \sum_{i=1}^{32} V_{grid\_cube_i} = 87.808$$

$$\begin{aligned}
V_{sphere} &= \frac{4}{3} \pi R^3 = 87.808 \quad \Longrightarrow \quad R = \sqrt[3]{\frac{3 \cdot 87.808}{4\pi}} \approx 2.7573 \\
V_{cube} &= (4.4447)^3 = 87.808 \\
V_{parallelepiped} &= 5.6 \times 5.6 \times 2.8 = 87.808 \\
V_{32\_cubes} &= 32 \times (1.4)^3 = 32 \times 2.744 = 87.808
\end{aligned}$$

```
  ╭────────╮         ┌────────────────┐         ┌──────────────────────────────┐         ┌───┐ ┌───┐ ┌───┐ ┌───┐
 │          │        │                │         │                              │         └───┘ └───┘ └───┘ └───┘
│   SPHERE   │ ────► │  PERFECT CUBE  │  ─────► │      PLASTIC PARALLELEPIPED  │  ─────► ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ (R=2.7573) │       │                │         │                              │         └───┘ └───┘ └───┘ └───┘
 │          │        │  (S = 4.4447)  │         │      (5.6 x 5.6 x 2.8)       │         32 MATRIX CUBES
  ╰────────╯         └────────────────┘         └──────────────────────────────┘         (1.4 x 1.4 x 1.4 each)
```

### 3.2. Stages of Intro Morphing and Decomposition

1. **Phase 0: Initial Sphere and Morphing into Monolithic Cube ($t \in [0.0\text{s}, 1.5\text{s}]$):**
   * The scene opens with a **perfect neon sphere** of radius $R = 2.7573$ as a symbol of the undivided and holistic nature of language prior to formalization.
   * A high-density polygonal mesh (Subdivision 24 segments) is utilized.
   * A smooth vertex morphing of positions and normals takes place along a $C^2$-smooth quintic curve: every point on the spherical surface migrates to the coordinates of a perfect cube with side $S = 4.4447$ with zero volume loss.
2. **Phase 1: Monolithic Cube ($t \in [0.00, 0.15]$ of the intro cycle):**
   * Settling of the perfect neon-emerald cube ($4.4447 \times 4.4447 \times 4.4447$) with sharp outline edges (`<Edges opacity={0.95}>`).
3. **Phase 2: Non-linear Stretching ($t \in [0.15, 0.48]$):**
   * Two-phase elongation into a plastic cuboid ($5.6 \times 5.6 \times 2.8$): the first 80% of travel progresses dynamically, while the final 20% cushions with gentle damping.
4. **Phase 3: Emergence of Internal Seams ($t \in [0.48, 0.58]$):**
   * Internal seams and partitioning into 32 cells smoothly fade in via optical cross-fading without visual artifacts.
5. **Phase 4: Smooth Dispersion into 32 Cubes ($t \in [0.58, 1.00]$):**
   * Expansion of the 32 cubes to their target grid coordinates governed by a second-order Smoothstep quintic curve:
     $$\mathbf{easeP4}(p_4) = 6 p_4^5 - 15 p_4^4 + 10 p_4^3$$
     ensuring zero initial and final acceleration ($f'(0)=0, f''(0)=0, f'(1)=0, f''(1)=0$).

---

## 4. Complete 7-Stage Kinematics and Interactivity Specification

The system implements continuous, physically coherent transformation kinematics for each of the 32 grammatical cubes:

### Stage 1: Monolithic Cube Activation (`explode: OFF`)
* Clicking on any of the 32 grid cubes initiates a smooth glide forward along the Z-axis ($Z = basePos.z \pm 0.8$) via a smoothed equation `lerp(..., 0.055)`.
* The cube renders as a **100% solid monolithic glass object without internal lines or seams**, featuring crisp 3D typography for tense, aspect, and voice on the front face.

### Stage 2: Smooth Retraction into the Matrix on Cube Deselection
* Upon deactivation or switching to another cube, the previous cube does not snap or disappear abruptly; it smoothly glides back into its original grid slot (`wasJustDeselected` reverse `lerp(..., 0.075)` mechanism), eliminating any visual discreteness.

### Stage 3: Expansion into 6 Layers (`explode: ON / Submode: Off`)
* The cube advances to distance $Z = basePos.z \pm 2.6$ and smoothly expands vertically into 6 horizontal slabs with an initial clearance gap `curGap = 0.38`.

### Stage 4: All Information Boards Mode (`Submode: All 6`)
* All 6 slabs expand to gap `0.65`, synchronously rotate by $90^\circ$ around the X-axis, morph from dimensions $1.4 \times 0.2333 \times 1.4$ into wide-format posters $2.8000 \times 0.7000 \times 0.2333$, and display the complete grammatical formula with a smooth fade-in.

### Stages 5–7: 4-Phase Single Focus Kinematics (`Submode: Single`)
Transitioning to a specific formula triggers a strict 4-phase collision-free translation cycle:

```
        [ Matrix Stack Z = 2.6 ]
                   │
                   ▼  Phase 1 (Slide Out 0°)
        [ Clearance Zone Z = 4.1 ]
                   │
                   ▼  Phase 2 (90° In-Flight Rotation)
        [ Vertical Board Z = 4.1 at Layer Elevation ]
                   │
                   ▼  Phase 3 (Centering along Y)
        [ Vertical Board Z = 4.1 centered at Y_cell ]
                   │
                   ▼  Phase 4 (Settle Retraction)
        [ Final Focus Position Z = 3.7 centered at Y_cell ]
```

* **Sequential Handoff:** When switching to another layer, the active board first traverses all 4 phases in reverse to return to the stack before the newly selected layer begins its forward trajectory.
* **Seamless Assembly into Cube on `explode: OFF`:** Slabs smoothly revert rotation, collapse vertical gaps (`gap -> 0.0`), retract along Z to distance 0.8, and only upon full contact seamlessly switch to the solid monolithic cube representation.

### 4.3. Direct In-Scene 3D Interactivity (Layer Picking)
* In `Single` mode, users can click not only in the sidebar, but also **directly on inactive slabs within the 3D space**.
* Hovering over a slab in the stack smoothly raises its brightness from $15\%$ to $55\%$, intensifies the neon outline of the formula up to $95\%$, and changes the cursor to `pointer`. Clicking instantly triggers the focus-change kinematics.

---

## 5. Specialized Visual and Educational Modules

### 5.1. Right-Hand Rule
To facilitate spatial retention of grammatical dimensions, a high-detail 3D STL model of an anatomical human hand is integrated into the scene:
* **Vector-to-Grammar Alignment:**
  * **Index finger ($+X$)** $\to$ Voice (`Active Voice`).
  * **Middle finger ($+Y$)** $\to$ Aspects (`Simple`, `Continuous`, `Perfect`, `Perfect Continuous`).
  * **Thumb ($+Z$)** $\to$ Tenses (`Present`, `Past`, `Future`, `Future in the Past`).

* **5 Visual Hand Styles:**
  1. 🎯 *Chromatic Axes* (White Palm + RGB fingers corresponding to XYZ axes);
  2. 🔷 *Hologram Cyber-Cyan* (Neon cyber glow);
  3. 💜 *Royal Violet Crystal* (Crystal translucent glass);
  4. ⚡ *Electric White Sensor* (Electric white sensor);
  5. 🔶 *Warm Amber Glass* (Warm amber photopolymer).

* **Interactive Floating HTML Badges (Axes Badges):** Anchored to fingertips, smoothly billboarding toward the camera to indicate current axes.
* **Size Adjustment:** Smooth scale slider ranging from $0.5\times$ to $3.0\times$.

### 5.2. Spatial Frame (Coordinate System) (Robotic CS Frame)
* Orthogonal vector basis $X, Y, Z$ with orientation markers and a dedicated scale slider from $0.5\times$ to $3.0\times$.

### 5.3. Dual-Perspective Headers
* Typographic neon indicators of tense and aspect planes situated above the matrix.
* **Automatic View Vector Tracking:** When orbiting from the X-axis side (Active Voice) around the Y-axis of **World CS (Three.js)** (or equivalently, around the Z-axis of **Robotic Right-Hand Rule Frame**) and intersecting the YZ plane of **World CS (Three.js)** (XY of **Robotic Right-Hand Rule Frame**), labels smoothly fade out in profile and mirror $180^\circ$ to face the viewer from the Passive Voice side.

### 5.4. Shakespeare Holographic Quote Banner
* Every toggle of the `to be` switch triggers a cinematic 3D floating hologram above the matrix:
  > *“To be, or not to be, that is the question” — William Shakespeare*
* Implements a smooth 3-phase lifecycle (flash intensity $\to$ gentle spatial drift $\to$ complete fade to black with zero lingering shadows).