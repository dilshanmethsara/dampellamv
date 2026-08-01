# Plan: Convert Uploaded School Website Image to React

## Context
The user uploaded a mockup of a school website for "MR/ Dampella M.V — Excellence in Education" (a Government School in Southern Province, Sri Lanka). The task is to recreate the design pixel-for-pixel in React + Tailwind CSS, matching every section, spacing, typography, shadows, gradients, buttons, and cards. The uploaded school photo must be embedded using `<ImageWithFallback>` with an ES module import.

## What to Build

### Sections (desktop + responsive mobile)

1. **Top Bar** — Dark navy strip: "Government School • Southern Province • Sri Lanka" left; email + phone icons right
2. **Navigation** — White bg: shield crest + "MR/ Dampella M.V / EXCELLENCE IN EDUCATION" logo; nav links (Home, About Us, Academics, Students, News & Events, Contact); "Student Portal" pill button (dark navy)
3. **Hero** — Light blue-gray bg; left text column (eyebrow, h1 with purple "Futures.", description, two CTA buttons, stats row); right side school photo
4. **About Section** — Dark navy bg; left clock-tower illustration (inline SVG); right: label + h2 + description; four white feature cards below (Quality Education, Character Building, Co-Curricular, Community)

### Colors
- Navy dark: `#1B2A6B` (top bar, nav button, about section bg)
- Purple accent: `#5B35D5` ("Futures." text)
- Hero bg: `#EEF2FF`
- Card border: `#E5E7EB`
- Text primary: `#111827`
- Text muted: `#6B7280`

### Typography
- Display / headings: Georgia or serif fallback for "Inspiring Minds." heading
- Nav + labels: system-ui sans-serif
- Google Fonts: **Playfair Display** (display heading), **Inter** (body/nav)

### Key Files to Modify
- `src/App.tsx` — replace existing dot-grid demo with the full school website component
- `src/index.css` — add Google Fonts import for Playfair Display + Inter before `@import 'tailwindcss'`

### Asset
- Image: `src/imports/ChatGPT_Image_Aug_1__2026__11_22_39_AM-1.png` — import as ES module, render via `<ImageWithFallback>` in hero right column

### ImageWithFallback path
- `@/app/components/figma/ImageWithFallback.tsx` (per skill docs)

## Implementation Notes
- Use Tailwind utility classes exclusively; no inline style overrides unless Tailwind can't express it
- Nav `Home` gets an underline active state
- Stats row uses flex with gap, icon + number bold + label muted
- Hero left column uses `flex flex-col gap-6`, hero section is a relative grid (2-col on desktop, stacked on mobile)
- About section cards are a 4-col grid (2-col on tablet, 1-col on mobile)
- CTA buttons: pill shape (`rounded-full`), navy filled + white outlined variants

## Verification
- Open preview in browser and visually compare against the reference image
- Check mobile breakpoint (below 768px): nav collapses, hero stacks, cards wrap
