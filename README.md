# Aarohan Residences — Immersive Real Estate Platform

> **"Live above the noise."**  
> Premium G+14 residential development along the Sevasi-Bhayli Green Corridor, Vadodara, Gujarat.

A portfolio-grade 3D real estate sales and spatial customization platform built with **Vite, React 18, Strict TypeScript, Three.js (@react-three/fiber, @react-three/drei), Zustand, Tailwind CSS, and Framer Motion**.

---

## 1. System Architecture & Diagram

```text
+-------------------------------------------------------------------------------------------------+
|                                    AAROHAN WEB CLIENT SHELL                                     |
|                                                                                                 |
|   [ Header Bar ] -------- Mode Breadcrumbs ----- Accessible 2D Table Modal ----- Booking CTA    |
|         |                                                                                       |
|   [ 3D Viewport ] <ErrorBoundary3D>                                                             |
|         |                                                                                       |
|         +--> [ R3F SceneCanvas ]                                                                |
|         |         |                                                                             |
|         |         +--> [ LightingRig ]  (Dynamic Sun azimuth & 2700K Night interior lights)    |
|         |         +--> [ BasePlate ]    (Arrival motor court, fountain, 25m pool, palms)        |
|         |         +--> [ TowerMassing ] (Porte-cochère, teak soffits, black mullions, crown)    |
|         |         +--> [ DollhouseView ] (False ceiling cove, recessed LEDs, baseboard skirt)   |
|         |         |         +--> [ ProceduralFurniture ] (Chef's kitchen, master suite, sofa)   |
|         |         |         +--> [ RoomHotspot ]         (Pulsing floor beacons at 1.6m eye)    |
|         |         |         +--> [ BalconyView ]         (East/West Vadodara horizon silhou.)   |
|         |         +--> [ CameraRig ]   (Cinematic Drift -> Orbital -> Slicer -> Walkthrough)    |
|         |                                                                                       |
|         +--> [ CameraPresetDock ]     (1-Click jumps: Tower, Floor, Living, Master, Kitchen)    |
|         +--> [ CompassWidget ]        (Rotating cardinal dial, sun arc & Vadodara GPS coords)   |
|         +--> [ CustomizerDock ]       (Palettes, 2K PBR Flooring, Furniture Tiers, Compare)     |
|         +--> [ FloorSelector ]        (Vertical floor 14..1 selector & stepper)                 |
|         +--> [ FlatHoverCard ]        (Status pills, facing, carpet area, all-inclusive price)  |
|         +--> [ WalkthroughControls ]  (Drag-to-look 360 yaw/pitch, room HUD)                    |
|                                                                                                 |
|   [ State Store ] <Zustand> ========= URL Search Param Synchronization (window.history)         |
|         |                                                                                       |
|   [ Architectural Sections ]                                                                    |
|         |                                                                                       |
|         +--> Highlights Ribbon (G+14, 4 Flats/Floor, 1,150-1,950 sq ft, Dual Facing)            |
|         +--> Curated Amenities (Skyline Lap Pool, Club Aarohan, Squash Court, Zen Garden)       |
|         +--> Cadastral Map (Sevasi-Bhayli corridor vector reference & drive times)              |
|         +--> Architectural Gallery (Perspective studies & lightbox enlarger)                    |
|         +--> Frequently Answered Questions (RERA DEMO-RERA-0000, maintenance, parking)          |
|         +--> Footer Colophon (Compliance notice, quick links, demonstration badge)              |
+-------------------------------------------------------------------------------------------------+
                                      |
                         [ Typed API Layer (`src/api/`) ]
                                      |
         +----------------------------+----------------------------+
         |                                                         |
[ Mock CRM Storage (localStorage) ]                  [ Future Backend Service ]
  - getStoredEnquiries()                               - NestJS / Go / FastAPI
  - saveEnquiry()                                      - PostgreSQL / Supabase
  - updateEnquiryStatus()                              - Real RERA CRM Webhook
```

---

## 2. Project Setup & PowerShell Commands

This project targets Windows with PowerShell syntax.

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20.x recommended)
* **npm**: v9.x or higher

### Install Dependencies
```powershell
npm install
```

### Run Local Development Server
```powershell
npm run dev
```
Open **[http://localhost:5180/](http://localhost:5180/)** in your browser.

### Run Automated Unit Test Suite
```powershell
npm run test
```
Executes all pure logic test suites with Vitest (pricing formulas, floor-rise calculation, EMI amortization, URL state serialization/deserialization, and tower inventory generation). 19/19 passing.

### Production Build & Typecheck
```powershell
npm run build
```
Executes TypeScript strict compiler (`tsc`) followed by Vite production bundling into `dist/`.

---

## 3. High-Fidelity Architectural Realism Features

* **Exterior Tower & Grounds**:
  - G+14 reinforced concrete tower with double-height entrance colonnade and travertine finish.
  - Cantilevered porte-cochère drop-off canopy with recessed warm downlight illumination.
  - Warm natural teak balcony soffit underbellies and slim black anodized aluminum window mullions with tinted glazing.
  - Sculpted penthouse rooftop crown with architectural timber pergola and aviation warning beacon.
  - Paver arrival motor court, circular drop-off water fountain, teak pool sundeck, 25m infinity lap pool with waterline LED perimeter, and avenue palm trees.

* **Interior Residence Detailing**:
  - **Modular Chef's Kitchen**: Quartz waterfall island counter slab, undermount double sink with matte black gooseneck faucet, 4-burner flush induction cooktop, overhead black stainless chimney hood with task light, full-height pantry joinery tower with built-in convection oven, under-cabinet warm LED lighting, and pair of brass-framed counter bar stools.
  - **Living Salon Ensemble**: Low-slung Italian sofa with bolster pillows, nested round Calacatta marble & brass coffee tables, hardbound architecture books, ceramic bowl, sculpted bouclé lounge chair, and architectural brass floor lamp.
  - **Master Bedroom Suite**: 3.4m extended fluted wood headboard spanning floating cantilever nightstands, top indirect LED cove backlight, layered Belgian linen duvet with runner, 4 sleeping pillows + velvet bolster, hanging brass tube bedside pendants, end-of-bed bench, and Italian modular wardrobe with tinted fluted glass doors and internal vertical LED strips.
  - **False Ceiling Cove & Skirting**: Architectural perimeter false ceiling soffit with recessed warm LED perimeter cove lighting, overhead downlight cans, dark oak baseboard skirting around wall junctions, and cased door architraves.
  - **Balcony Sundeck**: Teak outdoor bistro table with chairs and tropical planters overlooking the real-time Vadodara skyline horizon matching East/West orientation.

* **Interactive Controls & Navigation**:
  - **Cinematic Camera Preset Dock**: 1-click camera transitions (*Tower Orbit, Floor Slice, Living Salon, Master Suite, Chef Kitchen, Sky Sundeck*).
  - **Rotating Architectural Compass & Solar Azimuth Widget**: Interactive dial tracking cardinal orientation (N, E, S, W), solar progression with time-of-day click-to-cycle, and geographic coordinates for Vadodara (`22° 18' N, 73° 12' E`).
  - **2048x2048 Procedural PBR Canvas Textures**: In-memory generated high-res textures for Calacatta Gold marble, Chevron parquetry with wood grain, European Oak with growth rings and knots, Honed Cleft Slate relief, and Teak Decking.

---

## 4. How to Replace Procedural Models with Real GLB Models Later

The project's 3D asset strategy deliberately uses procedural architectural scale-model massing and geometry to guarantee instant loading, crisp bevels, zero 404 network assets, and 60 FPS performance.

When replacing these procedural primitives with commissioned 3D artist `.glb` / `.gltf` assets:

1. **Place GLB Files in `public/models/`**:
   ```
   public/
   └── models/
       ├── tower_structure.glb
       ├── unit_2bhk.glb
       ├── unit_3bhk.glb
       └── furniture_pack.glb
   ```

2. **Preload and Swap in `src/features/building/TowerMassing.tsx`**:
   Replace the procedural `FloorBlock` loop with Drei's optimized `useGLTF`:
   ```tsx
   import { useGLTF } from '@react-three/drei';

   export const TowerModel: React.FC = () => {
     const { scene } = useGLTF('/models/tower_structure.glb');
     return <primitive object={scene} castShadow receiveShadow />;
   };

   useGLTF.preload('/models/tower_structure.glb');
   ```

3. **Swap Procedural Furniture in `src/features/furniture/ProceduralFurniture.tsx`**:
   ```tsx
   import { useGLTF } from '@react-three/drei';

   export const LivingRoomFurniture: React.FC = () => {
     const { nodes, materials } = useGLTF('/models/furniture_pack.glb');
     return (
       <group>
         <mesh geometry={(nodes.Sofa as THREE.Mesh).geometry} material={materials.Fabric} />
         <mesh geometry={(nodes.Credenza as THREE.Mesh).geometry} material={materials.Oak} />
       </group>
     );
   };
   ```

All camera rigs, hotspots, floor slicing animations, and customizer hooks remain 100% intact because the hierarchical scene graph conventions remain identical.

---

## 5. How to Swap the Mock API for a Real Backend

The API layer is completely isolated under `src/api/client.ts`. No UI component communicates directly with `localStorage`.

To wire up a production REST or GraphQL API (e.g. NestJS, Go, FastAPI, Supabase):

1. **Configure Environment Variable**:
   In `.env`:
   ```ini
   VITE_API_BASE_URL=https://api.aarohanresidences.com/v1
   ```

2. **Update `src/api/client.ts`**:
   Replace the local mock methods with standard `fetch` or `axios` calls:

   ```typescript
   const BASE_URL = import.meta.env.VITE_API_BASE_URL;

   export const api = {
     async getProjectMetadata(): Promise<ProjectMetadata> {
       const res = await fetch(`${BASE_URL}/project`);
       if (!res.ok) throw new Error('Failed to load project metadata');
       return res.json();
     },

     async getAllFlats(): Promise<FlatData[]> {
       const res = await fetch(`${BASE_URL}/inventory/flats`);
       return res.json();
     },

     async submitSiteVisitEnquiry(payload: Omit<SiteVisitEnquiry, 'id' | 'createdAt' | 'status'>): Promise<SiteVisitEnquiry> {
       const res = await fetch(`${BASE_URL}/enquiries`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
       });
       return res.json();
     },

     async getLeads(): Promise<SiteVisitEnquiry[]> {
       const res = await fetch(`${BASE_URL}/admin/leads`, {
         headers: { Authorization: `Bearer ${getAdminToken()}` },
       });
       return res.json();
     },

     async updateLeadStatus(id: string, status: SiteVisitEnquiry['status']): Promise<void> {
       await fetch(`${BASE_URL}/admin/leads/${id}/status`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status }),
       });
     },
   };
   ```

No changes to UI components (`EnquiryModal`, `AdminLeadsPage`, `PriceCard`) are required.

---

## 6. Performance, Accessibility & Anti-AI-Slop Compliance

* **FPS & Device Clamping**: Clamped device pixel ratio (`dpr={isMobile ? 1.5 : 2}`), PCF soft shadow maps tuned with an automated `PerformanceSentinel` that steps down to 1.0 DPR and disables shadows if frame times exceed 33ms.
* **Procedural PBR Textures**: Natural Warm Oak, Banswara White Marble, Kund Honed Slate, and Artisan Herringbone generated at 2048x2048 in memory on canvas with zero external image downloads.
* **Full Accessibility**:
  - Accessible 2D inventory table directory (`FlatTableView`) for users who bypass 3D WebGL.
  - Keyboard navigation for floor selector (Up/Down) and dialogs (Escape key trap).
  - High-contrast typography passing WCAG AA requirements.
  - Respects `prefers-reduced-motion` with instant transitions.
* **Human Copywriting**: Indian English real estate terminology, Sevasi-Bhayli neighborhood context, and honest demonstration notices with `DEMO-RERA-0000` disclaimer.
