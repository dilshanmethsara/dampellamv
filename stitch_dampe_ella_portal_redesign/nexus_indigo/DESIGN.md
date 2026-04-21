# Design System Specification: The Academic Atelier

## 1. Overview & Creative North Star: "The Digital Curator"
This design system moves away from the sterile, "grid-locked" feel of traditional Learning Management Systems. Our Creative North Star is **The Digital Curator**. We treat every course, lesson, and metric as a piece of high-end editorial content. 

The system breaks the "template" look by using **intentional asymmetry** and **tonal depth**. Instead of boxing users into rigid containers, we use generous whitespace and a sophisticated "layer-on-layer" approach. The result is a learning environment that feels less like a database and more like a bespoke digital gallery—designed to reduce cognitive load and inspire intellectual curiosity.

---

## 2. Colors & Surface Architecture
We utilize a palette of deep Indigos and soft lavenders to create a "Vibrant Professionalism."

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define boundaries through **background color shifts** alone. A `surface-container-low` module sitting on a `surface` background provides all the definition a modern learner needs without the visual noise of lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, premium materials.
- **Base Layer:** `surface` (#faf4ff) for the main application background.
- **Secondary Tier:** `surface-container-low` (#f5eeff) for sidebar navigation or inactive content regions.
- **Focus Tier:** `surface-container-lowest` (#ffffff) for the primary content card or active lesson view.
- **Nesting Logic:** To highlight a sub-module (like a quiz widget inside a lesson), use a higher tier like `surface-container-high` (#e8deff) to create a "sunken" or "raised" effect relative to its parent.

### The "Glass & Gradient" Rule
To inject "soul" into the LMS:
- **Hero States:** Use a subtle linear gradient from `primary` (#4a3fe2) to `primary-container` (#9795ff) at a 135-degree angle.
- **Glassmorphism:** Floating action panels or navigation overlays should use `surface-container-lowest` at 80% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) with **Inter** (Body/Labels) to create a high-contrast, editorial hierarchy.

*   **The Display Scale (Manrope):** Use `display-lg` (3.5rem) and `display-md` (2.75rem) for "Welcome" states and course titles. This creates an authoritative, premium feel.
*   **The Narrative Scale (Inter):** `body-lg` (1rem) is the standard for lesson content. We prioritize line height (1.6) to ensure maximum readability for long-form learning.
*   **The Functional Scale (Inter):** `label-md` and `label-sm` are strictly for metadata (time to complete, category tags).

---

## 4. Elevation & Depth
Hierarchy is conveyed through **Tonal Layering** rather than structural scaffolding.

*   **The Layering Principle:** Avoid shadows for static elements. A `surface-container-lowest` card placed on a `surface-container-low` background creates a soft, natural lift.
*   **Ambient Shadows:** For "floating" elements (Modals, Hovered Cards), use an extra-diffused shadow: `0px 20px 40px rgba(50, 41, 79, 0.06)`. The tint is derived from `on-surface` (#32294f), never pure black.
*   **The "Ghost Border":** If accessibility requires a stroke (e.g., in high-contrast needs), use `outline-variant` (#b2a6d5) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons: The Tactile Interaction
*   **Primary:** A gradient fill (`primary` to `primary-dim`) with `md` (0.75rem) rounding. Use a soft `primary-container` glow on hover.
*   **Secondary:** `surface-container-highest` background with `primary` text. No border.
*   **Tertiary:** Ghost style; `on-surface` text that shifts to `secondary-container` background on hover.

### Cards & Progress Modules
*   **The "No-Divider" Rule:** Forbid the use of divider lines within cards. Use **Vertical Spacing** (24px or 32px) to separate the header from the body.
*   **Visual Soul:** Use `tertiary` (#983772) for progress bars and "achievement" chips to provide a vibrant counter-point to the dominant Blue/Indigo.

### Input Fields
*   **Structure:** Minimalist. Use `surface-container-high` as the field background.
*   **States:** On focus, the field background shifts to `surface-container-lowest` with a 2px `primary` bottom-bar—mimicking a premium notebook.

### Specialized LMS Components
*   **The "Learning Path" Stepper:** Use `secondary-fixed` (#d8caff) for completed steps and a pulsing `primary` ring for the active step. Connect them with a thick 4px `surface-variant` track.
*   **Course Discovery Chips:** Rounded `full` (9999px). Use `secondary-container` with `on-secondary-container` text for a soft, legible tag.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align course titles to the left but allow metadata or progress rings to float in the upper right "negative space" of a card.
*   **Use Tonal Shifts:** Distinguish the "Instructor" area from the "Student" area by shifting the background from `surface` to `surface-container-low`.
*   **Prioritize Breathing Room:** If a layout feels "busy," increase the padding from 24px to 48px before removing content.

### Don't:
*   **Don't use pure black text:** Always use `on-surface` (#32294f) to maintain the sophisticated, deep-indigo tonal profile.
*   **Don't box in content:** Avoid 1px solid borders around images or video players; use the `md` (0.75rem) corner radius to let the shape define the edge.
*   **Don't use standard "Alert Red":** Use our `error` (#b41340) which is a "Raspberry" tone—it conveys urgency without inducing anxiety in the learner.