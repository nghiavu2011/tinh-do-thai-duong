# PREHISTORIC EARTH — PROJECT BIBLE
**Version:** 0.1 (Extracted from Round 01 Specification)  
**Status:** GOVERNING SPECIFICATION  
**Audience:** All Contributors, Builders, and Reviewers  

---

## 1. Product Statement

> **PREHISTORIC EARTH is a scientifically grounded interactive 3D world where children and families explore prehistoric life through play, evidence and discovery.**

Prehistoric Earth is not a static dinosaur encyclopedia. It is a family-oriented interactive 3D exploration and learning platform where prehistoric life is discovered through the pipeline:

$$\text{TIME} \rightarrow \text{EARTH} \rightarrow \text{ECOSYSTEM} \rightarrow \text{SPECIES} \rightarrow \text{3D BODY} \rightarrow \text{SKELETON/FOSSIL} \rightarrow \text{EVIDENCE} \rightarrow \text{LEARNING}$$

---

## 2. Core Values

1. **Explore** — User agency first.
2. **Experience** — 3D, sound, motion and spatial scale create wonder.
3. **Understand** — Science is explained, not dumped.
4. **Question** — Distinguish evidence from reconstruction and hypothesis.
5. **Learn Together** — Suitable for child + parent co-exploration.
6. **Copyright & Open-Source Discipline** — No asset enters production without a traceable source and verified license.

---

## 3. Primary Audience Layers & Adaptive Depth

- **Layer A (Explorer, ~6–11):** Visual discovery, short sentences, touch/drag interaction, simple comparisons, guided questions, minimal cognitive overload.
- **Layer B (Investigator, ~12–17):** Cause/effect, comparative anatomy, evolutionary context, fossil evidence, scientific uncertainty and debates.
- **Layer C (Parent / Educator / Deep Dive):** Source visibility, evidence quality, specimen information, deeper academic context, confidence that simplified child content is not misleading.

*Rule:* Never create three separate products. Use **adaptive information depth** over a single verified knowledge base.

---

## 4. Visual Direction

**Modern Natural History Museum × Cinematic Prehistoric World**

- **Avoid:** Cartoon preschool UI, rainbow gamified dashboard, Jurassic Park visual clone, dark horror game, static textbook/encyclopedia.
- **Embrace:** Premium, cinematic, scientific, natural, spatial, legible for children, credible for adults.
- **Palette:** Volcanic charcoal, deep forest, fossil sand, amber, bone ivory, ocean slate.
- **UI Hierarchy:**
  1. 3D subject / environment (dominant viewport)
  2. User interaction & exploration controls
  3. Story cue
  4. Concise fact layer
  5. Scientific evidence layer
  6. Source / reference layer

---

## 5. Scientific Governance & Evidence Classes

Every publishable claim must be classified under one of four Evidence Levels:

- **E1 — Direct Evidence:** Documented fossil anatomy, specimen locality, stratigraphy, trace fossils, preserved skin/feather/plant material. *(e.g., "Fossils show...", "This specimen preserves...")*
- **E2 — Strong Inference:** Evidence-based reconstruction supported by comparative anatomy, biomechanics, or converging data. *(e.g., "Scientists infer...", "Evidence strongly suggests...")*
- **E3 — Active Hypothesis / Debate:** Multiple defensible interpretations or actively contested conclusions. *(e.g., "One hypothesis is...", "Scientists disagree about...", "Current evidence does not yet settle...")*
- **E4 — Unknown / Speculative:** Not sufficiently supported for declarative educational content. *(e.g., "We don't know yet.")*

*Rule:* Never convert E2/E3/E4 into E1 language for dramatic storytelling.

### Source Hierarchy
1. Peer-reviewed primary research / scholarly datasets
2. Museum / scientific institution records
3. Geological surveys / institutional databases
4. Curated paleontological databases (e.g. PBDB)
5. Reputable secondary science communication
6. Community sources only for discovery, never as final authority without verification.

### AI Content Rules
- AI may summarize verified sources, adapt language by age, generate questions from approved facts, or propose story framing.
- AI may **NOT** fabricate unsupported biological behavior, create new scientific facts, resolve controversy without evidence, or publish source-free claims.

---

## 6. Copyright & Asset License Gate

Every asset must be registered in the Asset Registry with full provenance.

- **GREEN (Approved):** Explicit license compatible with public/commercial use (CC0, public domain with explicit reuse, MIT/Apache-2.0 for code). Only GREEN assets may enter production rendering.
- **YELLOW (Hold / Review):** Some rights available, but conditions are ambiguous or incompatible until clarified (e.g., Smithsonian media with non-commercial or restricted usage notes). Blocked from production.
- **RED (Blocked):** Unknown source/license, no redistribution rights, non-commercial only, ripped assets, copyrighted franchise models.

*Rule:* Open-source code does not imply open-source assets. Each asset and code dependency must be evaluated independently.

---

## 7. Child & Family Design Rules

- No manipulative streaks, loot-box mechanics, or commercial ads mixed with learning.
- No gore-focused violence; explain predation scientifically without sensationalism.
- No autoplay fear-based audio; audio must be user-controllable.
- Minimize data collection; no open user-to-user chat in MVP.
- Reward model prioritizes discovery and field notes over artificial currency farming.

---

## 8. Accessibility & Performance Baseline

- Keyboard navigation for non-3D UI with visible focus states.
- Touch targets $\ge 44\text{ px}$.
- Text alternatives for all essential 3D learning content.
- Respect `prefers-reduced-motion`.
- Evidence levels communicated via text labels + icons, never color alone.
- Performance budget: $\ge 60\text{ FPS}$ on desktop, $\ge 30\text{ FPS}$ on mid-range mobile, initial 3D payload target $\le 5\text{ MB}$, no duplicate render loops.
