---
name: Workbench
description: AI-gated reflection tool for higher-ed students
colors:
  primary: "#0d9488"
  primary-container: "#008378"
  on-primary: "#ffffff"
  on-primary-container: "#f4fffc"
  inverse-primary: "#6bd8cb"
  secondary: "#855300"
  secondary-container: "#fea619"
  on-secondary: "#ffffff"
  on-secondary-container: "#684000"
  tertiary: "#924628"
  tertiary-container: "#b05e3d"
  amber: "#f59e0b"
  surface: "#f5faf8"
  surface-dim: "#d6dbd9"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f0f5f2"
  surface-container: "#eaefed"
  surface-container-high: "#e4e9e7"
  surface-container-highest: "#dee4e1"
  on-surface: "#171d1c"
  on-surface-variant: "#3d4947"
  outline: "#6d7a77"
  outline-variant: "#bcc9c6"
  error: "#ba1a1a"
  error-container: "#ffdad6"
  on-error: "#ffffff"
  on-error-container: "#93000a"
typography:
  display:
    fontFamily: "Lexend, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.2
  headline:
    fontFamily: "Lexend, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Lexend, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-lg:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Lexend, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "0.25rem"
  DEFAULT: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  full: "9999px"
spacing:
  unit: "8px"
  gutter: "24px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.DEFAULT}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.DEFAULT}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.DEFAULT}"
    padding: "8px 16px"
  button-motivational:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.DEFAULT}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.DEFAULT}"
    padding: "8px 16px"
---

# Design System: Workbench

## 1. Overview

**Creative North Star: "The Patient Mentor"**

Workbench is a thinking tool for students who are learning to think alongside AI rather than through it. The visual system must communicate that rigor and warmth are not opposites — that structured reflection can feel like a supported act, not a bureaucratic hurdle. Every surface, state, and transition should reinforce a single message: your thinking matters here.

The aesthetic sits at the intersection of focused productivity software and cerebral reading apps — closer to Reflect than Canvas, closer to Linear than Duolingo. It is not trying to be fun; it is trying to be the kind of tool a sharp student actually wants to open. The warmth is real but understated: in the teal tints on active states, in the amber reward moments, in the generous line-height that makes writing feel unhurried.

The design explicitly rejects: AI product clichés (gradient glows, glassy cards, purple-to-blue gradients), generic SaaS sameness (flat grays, zero personality), corporate LMS coldness (institutional blue, dense table layouts), and hyper-gamified EdTech energy (mascots, streaks, confetti).

**Key Characteristics:**
- Tonal layering over shadow drama — depth through surface color, not elevation theater
- Warm near-black text on warm off-white backgrounds — never `#000` on `#fff`
- Teal signals focus, progress, and AI presence; amber signals completion and reward
- Rounded but not bubbly — 8px standard radius reads "friendly and precise" not "soft toy"
- Generous whitespace and 1.6 line-height throughout — the UI breathes so the student can think

## 2. Colors: The Thinking Palette

A restrained two-accent palette where teal handles logic and progress, amber handles reward and motivation, and warm neutral surfaces carry the day-to-day cognitive load.

### Primary
- **Focused Teal** (`#0d9488`): The primary action color. Used for progress indicators, primary buttons, focus rings, AI-generated content containers, and active nav states. Its presence signals "this is where thinking happens and where it pays off."
- **Deep Teal** (`#008378`): Hover/active state for primary elements. Slightly darker to provide clear state feedback without jarring contrast shifts.
- **Pale Teal Mint** (`#f4fffc`): The tinted near-white used on AI-generated content containers. Communicates "AI spoke here" through tone, not a heavy background color.

### Secondary
- **Warm Amber** (`#f59e0b`): The reward color. Used exclusively for motivational buttons ("Submit", "Finish"), completion milestones, and "aha moment" highlights. Its rarity is the point — when amber appears, something has been earned.
- **Amber Container** (`#fea619`): Hover/container variant of amber. Used on tag surfaces and active filter states.

### Tertiary
- **Warm Terra** (`#924628`): Reserved for tertiary accents and iconography that needs visual warmth without competing with teal or amber. Used sparingly.

### Neutral
- **Warm Charcoal** (`#171d1c`): Body text. Slightly warm-tinted dark — never pure black.
- **Teal-Grey** (`#3d4947`): Secondary text, captions, and supporting labels.
- **Muted Sage** (`#6d7a77`): Borders, dividers, placeholder text, and disabled UI.
- **Soft Border** (`#bcc9c6`): Card borders, input outlines at rest.
- **Warm Mist** (`#f5faf8`): App background and lowest-level surface. Tinted toward teal at near-zero chroma — never pure white.
- **Thinking White** (`#ffffff`): Student input areas (the "Sandbox"). Pure white creates a felt separation between the student's cognitive space and the surrounding surface — a blank sheet of paper inside the app.
- **AI Tint** (`#f0f5f2`): Subtle teal-grey surface for AI-generated content blocks. Tonal shift communicates "AI spoke here" without a colored box.

**The One Voice Rule.** Primary teal carries meaning. It is not used decoratively. If teal appears on a screen, it means: action available, focus is here, or AI is present. Diluting it into decorative accents destroys the signal.

**The Amber Rarity Rule.** Amber appears on one primary action per screen at most — the completion or submit action. It is never used for navigation, informational labels, or decorative elements.

## 3. Typography

**Heading Font:** Lexend (400, 500, 600 weights)
**Body Font:** Plus Jakarta Sans (400, 500, 600 weights)
**Icon System:** Material Symbols Outlined (variable font, 24px default)

**Character:** Lexend was designed specifically to reduce visual stress and improve reading proficiency — a purposeful choice for an educational tool. Plus Jakarta Sans pairs with it through similar rounded terminal geometry while providing excellent legibility for long-form input. Together they read as "thoughtful productivity" rather than corporate or playful.

### Hierarchy
- **Display** (Lexend 600, 2.5rem / 40px, lh 1.2): Page-level headings. Assignment titles, dashboard welcomes.
- **Headline** (Lexend 600, 1.875rem / 30px, lh 1.3): Section headings within a page.
- **Title** (Lexend 500, 1.5rem / 24px, lh 1.4): Card titles, modal headings, sidebar section labels.
- **Body** (Plus Jakarta Sans 400, 1rem / 16px, lh 1.6): All prose content. Max 65–75ch line length enforced on reading-heavy surfaces.
- **Body Large** (Plus Jakarta Sans 400, 1.125rem / 18px, lh 1.6): Student reflection input areas and primary instructional copy.
- **Label** (Lexend 600, 0.75rem / 12px, lh 1, tracking 0.05em, uppercase): Status chips, AI content labels, stepper steps, metadata fields.

**The Line-Height Rule.** Body and Body Large are always rendered at 1.6. This is non-negotiable on input surfaces. Students spending 15–20 minutes writing inside the tool must not feel visually compressed.

## 4. Elevation

Workbench uses **tonal layering** rather than shadows. Depth is communicated through surface color steps, not drop shadows. The exception is active focus states, which use a low-spread teal-tinted glow to signal interactivity.

The surface stack from lowest to highest:
- **Level 0 — App Background** (`#f5faf8`): The warm mist base. Navigation rails and page backgrounds.
- **Level 1 — Card / Container** (`#ffffff` with `1px #bcc9c6` border): The primary content surface. Student input areas ("The Sandbox") always sit at Level 1.
- **Level 2 — Raised / Active** (`#ffffff` + `box-shadow: 0 4px 20px rgba(13,148,136,0.12)`): Focused inputs, hovered cards. The teal-tinted shadow reinforces the "focus is here" signal.
- **AI Surface** (`#f0f5f2`): Not elevation — tonal differentiation. AI content containers use this surface to distinguish AI output from student input without height difference.

**The Flat-By-Default Rule.** Surfaces are flat at rest. The teal glow shadow appears only in response to user focus or hover — never as decoration. A shadow at rest signals interactivity that isn't there.

## 5. Components

### Buttons
Character: precise and purposeful — tactile enough to feel responsive, restrained enough not to dominate.

- **Shape:** Gently curved (8px / 0.5rem radius across all sizes)
- **Primary:** Focused Teal background (`#0d9488`), white text, padding `8px 16px` (md), `12px 24px` (lg). Hover darkens to Deep Teal (`#008378`).
- **Motivational:** Warm Amber (`#f59e0b`) background, white text. Used only for submit / complete actions. Hover reduces opacity to 90%. Its presence must be earned by reaching a gate threshold.
- **Secondary:** White background, `1px #bcc9c6` border, `#171d1c` text. Hover background shifts to `#f0f5f2`.
- **Ghost:** Transparent background, Focused Teal text. Hover background `#f0f5f2`. Used for tertiary actions and cancel paths.
- **Focus:** `2px outline-offset-2 #0d9488` on all variants — visible, branded, WCAG AA compliant.
- **Disabled:** 50% opacity, `cursor-not-allowed`.

### Reflection Gate / Progress Stepper
The signature component. A horizontal step indicator showing reflection progress before AI unlocks.

- Completed steps: Teal fill
- Current step: Teal border ring with white fill (or Amber ring if the step is the final gate step)
- Future steps: `#dee4e1` (surface-container-highest)
- Gate fully completed: The AI unlock button transitions from disabled gray to Motivational Amber

### The Sandbox (Student Input)
- **Surface:** Level 1 — pure white (`#ffffff`), `1px #bcc9c6` border, `1rem` radius
- **Typography:** Body Large at 1.6 line-height — spacious, unhurried
- **Focus ring:** `box-shadow: 0 4px 20px rgba(13,148,136,0.12)` + `border-color: #0d9488`
- **Resize:** Vertical auto-expand as the student types
- **Label:** Small "Your Response" label in Label style above the field

### AI Content Block ("The Guide")
- **Surface:** AI Tint (`#f0f5f2`) background, `1px dashed #bcc9c6` border, `1rem` radius
- **Label:** "AI" chip in the top-right corner, Label style, teal text on pale teal background
- Visual separation from the Sandbox communicates: this came from somewhere else

### Cards / Containers
- **Corner:** `0.75rem` radius (md) for assignment cards; `1rem` radius (lg) for workspace containers
- **Background:** Level 1 (white) with `1px #bcc9c6` border
- **Shadow:** None at rest. Level 2 glow on hover.
- **Internal Padding:** `24px` gutter — the 8px unit system, 3 units.

### Navigation (Sidebar)
- **Width:** 260px fixed
- **Background:** `#f0f5f2` (surface-container-low) — one step above page background
- **Active item:** Teal text + `#eaefed` background pill
- **Inactive item:** `#3d4947` text, transparent background
- **Hover:** `#eaefed` background
- **Typography:** Body weight 500 for nav labels; Label caps for section headers

### Chips / Tags
- Pill shape (`9999px` radius) — the only component where full rounding is appropriate
- Status chips: teal/amber/gray background with matching on-color text
- Filter chips: outlined at rest, filled on selection

### Inputs / Text Fields
- **Style:** White background, `1px #bcc9c6` border, `0.5rem` radius
- **Focus:** `border-color: #0d9488` + teal glow shadow
- **Error:** `border-color: #ba1a1a`, error message in `#ba1a1a` below the field
- **Disabled:** `#eaefed` background, `#6d7a77` text

## 6. Do's and Don'ts

### Do:
- **Do** use Focused Teal (`#0d9488`) only for actions, focus states, progress, and AI presence — its rarity is the signal.
- **Do** use Warm Amber (`#f59e0b`) only for the motivational submit action and earned completion milestones.
- **Do** maintain 1.6 line-height on all body and input text — never compress reading or writing surfaces.
- **Do** differentiate the Student Sandbox (white, solid border) from the AI Guide (teal tint, dashed border) — these two surfaces must always be visually distinct.
- **Do** keep the surface stack flat by default — add the teal glow shadow only on focused or hovered interactive elements.
- **Do** use Lexend for all headings, labels, and status text; Plus Jakarta Sans for all body copy and student input.
- **Do** cap reading-heavy prose at 65–75ch line length.

### Don't:
- **Don't** use gradient text, `background-clip: text`, or decorative gradients anywhere. This is an AI cliché that directly undermines Workbench's message.
- **Don't** use glassmorphism — frosted cards, backdrop-filter blurs — as a default or decorative treatment.
- **Don't** use `border-left` greater than 1px as a colored accent stripe on cards, list items, or callouts.
- **Don't** add shadows to surfaces at rest. Shadows signal interactivity; placing them on static elements creates false affordances.
- **Don't** use amber for navigation, informational labels, icons, or any non-reward purpose. One amber element per screen, maximum.
- **Don't** use flat gray palettes, pure `#000`/`#fff`, or zero-personality neutral surfaces — the warm teal tint in the background is intentional and must be preserved.
- **Don't** design screens that feel like Canvas, Blackboard, or Google Classroom — no institutional blue, no dense table-first layouts, no bureaucratic structure.
- **Don't** add streaks, XP counters, achievement badges, or animated mascots. The reflection gate progress stepper is the only "game" mechanic this product uses.
- **Don't** pepper the UI with chatbot bubble aesthetics. AI output lives in The Guide container — not in speech bubbles.
