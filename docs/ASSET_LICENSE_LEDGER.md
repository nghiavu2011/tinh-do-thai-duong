# ASSET LICENSE LEDGER — PREHISTORIC EARTH
**Status:** ACTIVE AUDIT LEDGER  
**Review Gate:** Copyright & Asset Governance Board  
**Governing Standard:** Section 6 (Copyright / License Governance) & Section 14 (M1 Asset Research Ledger)  

---

## 1. Production Rule Reminder

> **Only assets with GREEN status are permitted in production rendering pipelines.**  
> Assets with YELLOW status are on hold and blocked from production until unambiguous written rights are secured.  
> Assets with RED status are permanently blocked.

---

## 2. 3D Asset Candidates Registry

| Asset ID | Asset Title / Subject | Creator / Institution | Source URL / Provenance | License Declared | Commercial Use | Attribution Required | Production Status | Scientific & Pipeline Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A3D-001** | Animated LowPoly Dinosaurs (T. rex, etc.) | Quaternius | [Quaternius Itch.io](https://quaternius.itch.io/animated-lowpoly-dinosaurs) | CC0 1.0 Universal | YES | Optional (Encouraged) | **GREEN (PROTOTYPE ONLY)** | Technical skeleton / control validation. Not suitable for final photoreal art. |
| **A3D-002** | T. rex skull cast (Museum of the Earth) | Digital Atlas of Ancient Life / PRI | [Sketchfab PRI Model](https://sketchfab.com/3d-models/vertebrate-tyrannosaurus-rex-skull-mote-cf48487de55d454b8adc92dce2840a0d) | CC0 1.0 Public Domain | YES | Optional (Scholarly cited) | **GREEN** | Science Lens specimen viewer (skull anatomy). Target for future LOD optimization. |
| **A3D-003** | T. rex tooth (PRI 55205) | Digital Atlas of Ancient Life / PRI | [Sketchfab PRI Model](https://sketchfab.com/3d-models/vertebrate-t-rex-tooth-pri-55205-353154e076364f6db8fd2b053f72be3f) | CC0 1.0 Public Domain | YES | Optional (Scholarly cited) | **GREEN** | Science Lens evidence interaction (dentition & serrations). |
| **A3D-004** | T. rex Cranial Musculoskeletal Dataset | Stephan Lautenschlager / Dryad 2015 | [Dryad Data Repository](https://datadryad.org/dataset/doi:10.5061/dryad.c75j9) | CC0 (Dryad policy) | YES | Optional (Scholarly cited) | **GREEN-CANDIDATE** | Reference research dataset for jaw mechanics. Needs inspection before use. |
| **A3D-005** | Nation's T. rex / Wankel T. rex 3D bones | Smithsonian 3D / NMNH | [Smithsonian 3D](https://3d.si.edu/object/3d/tyrannosaurus-and-triceratops:d8c62d28-4ebc-11ea-b77f-2e728ce88125) | Usage Conditions Apply (Non-commercial/Personal restrictions on files) | NO / RESTRICTED | Required | **YELLOW (BLOCKED FROM PROD)** | Strictly research reference. MUST NOT BE SHIPPED IN PRODUCTION BUILDS. |
| **A3D-006** | Triceratops horridus mounted skeleton | Smithsonian 3D / NMNH | [Smithsonian 3D](https://3d.si.edu/object/3d/triceratops-horridus-marsh-1889:d8c623be-4ebc-11ea-b77f-2e728ce88125) | CC0 / Public Domain explicit | YES | Optional (Encouraged) | **GREEN** | Future supporting species specimen view (Phase A). |

---

## 3. Environment & Texture Asset Candidates

| Asset ID | Asset Title / Subject | Source / Provider | License | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ENV-001** | HDRI & PBR Textures (Ground, Rock, Bark) | [Poly Haven](https://polyhaven.com/license) | CC0 1.0 Universal | **GREEN** | Approved for environment lighting and PBR ground materials. |
| **ENV-002** | Ultimate Nature Pack (Foliage proxies) | [Quaternius Nature](https://quaternius.com/packs/ultimatenature.html) | CC0 1.0 Universal | **GREEN (PROTOTYPE)** | Blocking and scale validation only. Generic modern plants must not be claimed as verified Cretaceous flora. |
| **ENV-003** | Ultimate Stylized Nature Pack | Quaternius | CC0 1.0 Universal | **GREEN (PROTOTYPE)** | Prototype blocking only if stylized direction is tested. |

---

## 4. Current Milestone Status

In work package **AG-001**, no external dinosaur 3D models or textures are bundled. The viewer utilizes a clean geometric procedural placeholder (`ModelPlaceholder.tsx`) ensuring 100% legal cleanliness while providing a complete drop-in interface for verified GLB models in subsequent milestones.
