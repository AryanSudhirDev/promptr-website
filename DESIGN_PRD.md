# Promptr Landing Page Design PRD
## Product Requirements Document for Landing Page Redesign

**Version:** 2.0  
**Last Updated:** January 2026  
**Inspired by:** attio.com  
**Status:** Ready for Development

---

## 1. Executive Summary

This PRD outlines a comprehensive redesign of the Promptr landing page, transforming it into a sophisticated, dark-themed, spacious design inspired by attio.com. The redesign emphasizes generous spacing, subtle purple textures, bento grid layouts, Lottie animations, and thoughtful micro-interactions that convey professionalism and trust. The dark theme creates an immersive, modern aesthetic perfect for developer tools, with vibrant purple accents that align with Promptr's brand identity.

Promptr is an AI-powered VS Code extension that transforms vague feature requests into clear, AI-ready prompts tailored to your tech stack. It helps developers get better code from Cursor, Windsurf, and other AI assistants—with fewer rewrites and less debugging.

---

## 2. Design Philosophy & Principles

### 2.1 Core Design Tenets

1. **Breathable Dark Space**: Every element should have room to breathe. Generous padding and margins create visual hierarchy without clutter. Minimum section padding of 120px vertically, 80px horizontally on desktop. Dark backgrounds provide depth and focus.

2. **Typographic Precision**: Inter font family throughout, leveraging its excellent legibility and modern character. Font weights should be predominantly light (300) to regular (400), with semibold (600) reserved for CTAs and key headlines. Light text on dark backgrounds ensures excellent readability.

3. **Subtle Sophistication**: Replace heavy gradients with delicate textures—dot grids, subtle noise overlays, and soft linear gradients that add depth without overwhelming. Purple glows and ambient lighting create an immersive, premium feel.

4. **Motion with Purpose**: Every animation serves a function. Lottie animations illustrate concepts, scroll-triggered fades create narrative flow, and hover states provide responsive feedback.

5. **Trust Through Design**: Dark backgrounds, clean lines, purple accents, and professional imagery convey reliability and sophistication expected of developer tools. The dark theme reduces eye strain and creates a focused, modern aesthetic.

---

## 3. Color System

### 3.1 Primary Palette (Dark Mode)

```css
:root {
  /* Background Colors - Dark Theme */
  --bg-primary: #0A0A0F;              /* Deep purple-black base */
  --bg-secondary: #12121A;            /* Slightly lighter for sections */
  --bg-tertiary: #1A1A25;             /* Card backgrounds */
  --bg-card: #16161F;                  /* Individual card background */
  --bg-card-hover: #1E1E2A;            /* Card hover state */
  --bg-overlay: rgba(10, 10, 15, 0.95); /* Modal/overlay backgrounds */
  
  /* Text Colors - Light on Dark */
  --text-primary: #F5F5F7;            /* Primary text - almost white */
  --text-secondary: #A1A1A6;          /* Secondary text - light gray */
  --text-tertiary: #86868B;           /* Tertiary text - medium gray */
  --text-muted: #6E6E73;              /* Muted text - darker gray */
  
  /* Accent Colors - Purple Primary (Promptr Brand) */
  --accent-primary: #8B5CF6;          /* Violet-500 - brighter for dark bg */
  --accent-primary-hover: #A78BFA;    /* Violet-400 - lighter hover */
  --accent-primary-light: #A855F7;    /* Purple-500 */
  --accent-secondary: #C084FC;       /* Purple-400 - vibrant */
  --accent-tertiary: #EC4899;         /* Pink-500 for highlights */
  --accent-gradient-start: #7C3AED;   /* Purple */
  --accent-gradient-mid: #8B5CF6;     /* Lighter purple */
  --accent-gradient-end: #A855F7;     /* Magenta-purple */
  
  /* Border Colors */
  --border-light: rgba(255, 255, 255, 0.06);
  --border-medium: rgba(255, 255, 255, 0.10);
  --border-dark: rgba(255, 255, 255, 0.15);
  --border-accent: rgba(139, 92, 246, 0.3);  /* Purple tinted border */
  
  /* Texture Colors */
  --grid-line: rgba(255, 255, 255, 0.03);
  --dot-color: rgba(139, 92, 246, 0.12);     /* Purple dots - more visible */
  --noise-opacity: 0.03;
  
  /* Glow Effects - Enhanced for dark mode */
  --glow-purple: rgba(124, 58, 237, 0.25);
  --glow-purple-strong: rgba(124, 58, 237, 0.4);
  --glow-purple-intense: rgba(139, 92, 246, 0.5);
}
```

### 3.2 Semantic Colors

Semantic colors are adjusted for visibility on dark backgrounds:

```css
:root {
  --success: #30D158;        /* Brighter green for dark bg */
  --warning: #FF9F0A;        /* Vibrant orange */
  --error: #FF453A;          /* Bright red */
  --info: #64D2FF;           /* Light blue */
  
  /* Semantic backgrounds (for badges/alerts) */
  --success-bg: rgba(48, 209, 88, 0.15);
  --warning-bg: rgba(255, 159, 10, 0.15);
  --error-bg: rgba(255, 69, 58, 0.15);
  --info-bg: rgba(100, 210, 255, 0.15);
}
```

### 3.3 Color Contrast & Accessibility

The dark theme is designed with accessibility in mind. All text meets WCAG AA contrast requirements:

- **Primary text** (#F5F5F7 on #0A0A0F): 15.8:1 contrast ratio ✅
- **Secondary text** (#A1A1A6 on #0A0A0F): 8.2:1 contrast ratio ✅
- **Purple accents** (#8B5CF6 on #0A0A0F): 6.1:1 contrast ratio ✅

Purple glows and accents are intentionally vibrant against dark backgrounds to create visual interest while maintaining readability.

---

## 4. Typography System

### 4.1 Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 4.2 Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Hero H1 | 72px / 4.5rem | 500 | 1.05 | -0.03em |
| Section H2 | 48px / 3rem | 500 | 1.15 | -0.02em |
| Card H3 | 24px / 1.5rem | 500 | 1.3 | -0.01em |
| Body Large | 20px / 1.25rem | 400 | 1.6 | 0 |
| Body Regular | 16px / 1rem | 400 | 1.6 | 0 |
| Body Small | 14px / 0.875rem | 400 | 1.5 | 0 |
| Caption | 12px / 0.75rem | 500 | 1.4 | 0.02em |
| Button | 15px / 0.9375rem | 500 | 1 | 0 |

### 4.3 Typography Guidelines

- **Headlines**: Use Inter Medium (500) for all headlines. Tight letter-spacing creates a premium feel.
- **Body Text**: Inter Regular (400) for all body copy. Comfortable line-height (1.6) ensures readability.
- **Emphasis**: Use Inter Semibold (600) sparingly for CTAs and key metrics only.
- **Numbers**: Use tabular figures for data displays and pricing.

---

## 5. Layout & Grid System

### 5.1 Container Widths

```css
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1440px; }
```

### 5.2 Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
```

### 5.3 Section Spacing

- **Hero Section**: 160px top padding, 120px bottom padding
- **Feature Sections**: 120px vertical padding
- **Testimonials**: 100px vertical padding
- **Pricing**: 120px vertical padding
- **Footer**: 80px top padding, 40px bottom padding

### 5.4 Bento Grid System

The bento grid uses CSS Grid with the following specifications:

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Card sizes */
.bento-card-sm { grid-column: span 4; }
.bento-card-md { grid-column: span 6; }
.bento-card-lg { grid-column: span 8; }
.bento-card-full { grid-column: span 12; }

/* Responsive */
@media (max-width: 1024px) {
  .bento-card-sm { grid-column: span 6; }
  .bento-card-lg { grid-column: span 12; }
}

@media (max-width: 640px) {
  .bento-card-sm,
  .bento-card-md { grid-column: span 12; }
}
```

---

## 6. Background Textures & Effects

### 6.1 Primary Dot Grid Pattern

```css
.texture-dot-grid {
  background-image: radial-gradient(
    circle at 1px 1px,
    var(--dot-color) 1px,
    transparent 0
  );
  background-size: 24px 24px;
  opacity: 0.6; /* More visible on dark backgrounds */
}
```

### 6.2 Subtle Line Grid

```css
.texture-line-grid {
  background-image: 
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 64px 64px;
  opacity: 0.4; /* Subtle but visible on dark */
}
```

### 6.3 Noise Texture Overlay

```css
.texture-noise {
  position: relative;
}

.texture-noise::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textures/noise.png');
  opacity: var(--noise-opacity);
  pointer-events: none;
}
```

### 6.4 Gradient Orbs (Ambient Light)

Dark mode allows for more dramatic ambient lighting effects. Purple orbs create depth and visual interest:

```css
.ambient-orb {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

.ambient-orb-purple {
  background: var(--accent-primary);  /* #8B5CF6 */
  top: -200px;
  right: -100px;
  opacity: 0.25; /* More visible on dark */
}

.ambient-orb-violet {
  background: var(--accent-primary-light);  /* #A855F7 */
  bottom: -200px;
  left: -100px;
  opacity: 0.2;
}

.ambient-orb-pink {
  background: var(--accent-tertiary);  /* #EC4899 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.15;
  width: 400px;
  height: 400px;
}
```

---

## 7. Component Specifications

### 7.1 Navigation Bar

**Desktop Navigation:**
- Height: 64px
- Background: rgba(10, 10, 15, 0.8) with backdrop-blur(20px)
- Border-bottom: 1px solid var(--border-light)
- Sticky position with smooth hide/show on scroll
- Logo: 32px height, positioned left
- Nav links: Center-aligned, 14px Inter Medium, 32px gap, color: var(--text-primary)
- CTA button: Right-aligned, filled purple style

**Mobile Navigation:**
- Hamburger menu icon (24px)
- Full-screen overlay with slide-in animation
- Links stacked vertically, 48px touch targets

**Animation:**
```css
.nav-link {
  position: relative;
  transition: color 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-primary);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}
```

### 7.2 Hero Section

**Layout Structure:**
- Full viewport height minus navigation (calc(100vh - 64px))
- Center-aligned content with max-width: 900px
- Announcement banner at top (optional, with purple accent)
- Dark background with purple ambient lighting

**Content Hierarchy:**
1. **Eyebrow Text**: "AI-Powered Prompt Refinement" - 12px uppercase, letter-spacing 0.1em, color: var(--accent-primary)
2. **Main Headline**: "Turn vague ideas into precise, AI-ready prompts" - 72px, color: var(--text-primary), with subtle purple glow on hover
3. **Subheadline**: "Promptr transforms your feature requests into clear instructions tailored to your tech stack. Get better code from Cursor, Windsurf, and other AI assistants." - 20px, color: var(--text-secondary), max-width: 600px
4. **CTA Group**: Primary purple gradient button + Secondary link with purple accent
5. **Social Proof**: Logo strip of VS Code, Cursor, Windsurf logos (grayscale with purple tint on hover)

**Hero Demo Area:**
- Embedded GIF/video showing the product in action
- Rounded corners (16px), subtle purple glow shadow
- Floating above dark gradient backdrop with purple ambient lighting
- Border: 1px solid var(--border-accent)

**Background Treatment:**
- Dark gradient from deep black to slightly lighter purple-black
- Purple dot grid texture overlay (more visible)
- Dramatic purple/violet/pink ambient orbs positioned at corners
- Subtle noise texture for depth

**Entrance Animations:**
```javascript
// Staggered fade-in sequence
const heroAnimations = {
  eyebrow: { delay: 0, duration: 0.6 },
  headline: { delay: 0.1, duration: 0.8 },
  subheadline: { delay: 0.2, duration: 0.6 },
  cta: { delay: 0.3, duration: 0.5 },
  demo: { delay: 0.4, duration: 0.8 },
  logos: { delay: 0.5, duration: 0.6 }
};
```

### 7.3 Logo Strip (Social Proof)

**Specifications:**
- Height: 80px section
- Background: transparent or very subtle bg-secondary
- Label: "Works seamlessly with" - 12px, text-tertiary, center-aligned
- Logos: Grayscale by default, full color on hover
- Logo height: 24-32px (normalized)
- Gap between logos: 48px
- Infinite scroll animation (optional)

**Included Logos:**
- VS Code
- Cursor
- Windsurf
- GitHub Copilot
- Any other relevant integrations

### 7.4 Bento Feature Grid

**Grid Layout:**
```
┌─────────────────┬─────────┐
│                 │         │
│   Large Card    │   SM    │
│   (8 cols)      │ (4 col) │
│                 │         │
├────────┬────────┼─────────┤
│        │        │         │
│  MD    │   MD   │   SM    │
│(4 col) │ (4 col)│ (4 col) │
│        │        │         │
├────────┴────────┴─────────┤
│                           │
│     Full Width Card       │
│        (12 cols)          │
│                           │
└───────────────────────────┘
```

**Card Specifications:**

**Standard Bento Card:**
```css
.bento-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 24px;
  padding: 32px;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.bento-card:hover {
  border-color: var(--border-accent);
  box-shadow: 0 8px 32px var(--glow-purple);
  transform: translateY(-2px);
  background: var(--bg-card-hover);
}
```

**Card Content Structure:**
1. **Icon/Lottie Container**: 48px × 48px, top-left
2. **Title**: H3, 24px, Inter Medium
3. **Description**: Body Regular, text-secondary, max 2 lines
4. **Visual Element**: Illustration, Lottie animation, or product screenshot

**Featured Cards (Large):**
- Include embedded Lottie animation or product screenshot
- More detailed description (3-4 lines)
- Optional mini-demo or interactive element

### 7.5 Feature Cards Content

**Card 1: Smart Prompt Refinement (Large)**
- Title: "Transform vague requests into precise prompts"
- Description: "Simply describe what you want to build. Promptr analyzes your intent and generates clear, detailed prompts that AI assistants understand perfectly."
- Visual: Lottie animation showing text transformation
- Size: 8 columns

**Card 2: Context Awareness (Medium)**
- Title: "Understands your codebase"
- Description: "Automatically considers your tech stack, coding patterns, and project context."
- Visual: Lottie animation of code analysis
- Size: 4 columns

**Card 3: Multi-Editor Support (Medium)**
- Title: "One tool, every editor"
- Description: "Seamlessly integrates with VS Code, Cursor, Windsurf, and more."
- Visual: Editor logos grid
- Size: 4 columns

**Card 4: Creativity Control (Small)**
- Title: "Tune the AI"
- Description: "Adjust creativity levels from precise to exploratory."
- Visual: Slider visualization
- Size: 4 columns

**Card 5: Instant Results (Small)**
- Title: "Real-time streaming"
- Description: "Watch your prompts refine in real-time."
- Visual: Streaming text animation
- Size: 4 columns

**Card 6: Custom Context (Full Width)**
- Title: "Add your own context for perfect results"
- Description: "Include project documentation, style guides, or specific requirements. Promptr incorporates everything to generate prompts that perfectly match your needs."
- Visual: Full-width product screenshot or Lottie
- Size: 12 columns

### 7.6 Testimonials Carousel

**Layout:**
- Full-width section with bg-secondary background (dark)
- Horizontal carousel with peek (show partial next/prev cards)
- Center-aligned active testimonial
- Dot indicators below (purple accent for active dot)

**Testimonial Card:**
```css
.testimonial-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 24px;
  padding: 40px;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.testimonial-card:hover {
  border-color: var(--border-accent);
  box-shadow: 0 8px 40px var(--glow-purple);
}
```

**Card Content:**
1. **Star Rating**: 5 stars, 20px, yellow (#FFB800) with subtle glow
2. **Quote**: 20px, text-primary, font-style: normal (not italic)
3. **Avatar**: 56px circular, border: 2px solid var(--border-accent), subtle purple glow
4. **Name**: 16px, Inter Medium, text-primary
5. **Title/Company**: 14px, text-tertiary

**Carousel Behavior:**
- Auto-rotate every 5 seconds
- Pause on hover
- Swipe gestures on mobile
- Smooth CSS transitions (0.5s ease)
- Keyboard navigation (left/right arrows)

**Animation:**
```css
.testimonial-enter {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.testimonial-active {
  opacity: 1;
  transform: translateX(0) scale(1);
  transition: all 0.5s ease;
}

.testimonial-exit {
  opacity: 0;
  transform: translateX(-40px) scale(0.95);
}
```

### 7.7 Pricing Section

**Layout:**
- Center-aligned section
- Section title + subtitle (with purple accent)
- Two-column pricing cards (Free / Pro) on dark background
- Trust indicators below with purple accents

**Pricing Card Specifications:**

```css
.pricing-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 24px;
  padding: 40px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.pricing-card:hover {
  border-color: var(--border-accent);
  box-shadow: 0 8px 40px var(--glow-purple);
}

.pricing-card-featured {
  border: 2px solid var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2), 0 8px 40px var(--glow-purple-strong);
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%);
  position: relative;
}

.pricing-card-featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 24px 24px 0 0;
}
```

**Card Content Structure:**
1. **Plan Name Badge**: Pill-shaped, bg-secondary
2. **Price**: 48px, Inter Medium + "/month" in text-tertiary
3. **Description**: 16px, text-secondary
4. **Divider**: 1px solid var(--border-light)
5. **Feature List**: Checkmark icons, 16px each
6. **CTA Button**: Full-width, bottom of card
7. **Trial Badge** (Pro): "14-day free trial" chip

**Feature List Item:**
```jsx
<li className="flex items-center gap-3 py-2">
  <CheckIcon className="w-5 h-5 text-accent-primary flex-shrink-0" />
  <span className="text-text-primary">Feature description</span>
</li>
```

### 7.8 FAQ Section

**Layout:**
- Accordion style with single-open behavior
- Max-width: 768px, center-aligned
- Section title above

**Accordion Item:**
```css
.faq-item {
  border-bottom: 1px solid var(--border-light);
  padding: 24px 0;
  transition: border-color 0.2s ease;
}

.faq-item:hover {
  border-color: var(--border-accent);
}

.faq-question {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: color 0.2s ease;
}

.faq-question:hover {
  color: var(--accent-primary);
}

.faq-answer {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.7;
  padding-top: 16px;
  overflow: hidden;
}
```

**Animation:**
```css
.faq-answer {
  max-height: 0;
  opacity: 0;
  transition: max-height 0.3s ease, opacity 0.2s ease;
}

.faq-item.open .faq-answer {
  max-height: 500px;
  opacity: 1;
}

.faq-chevron {
  transition: transform 0.3s ease;
}

.faq-item.open .faq-chevron {
  transform: rotate(180deg);
}
```

### 7.9 Footer

**Layout:**
- Background: bg-primary (deepest dark)
- Four-column grid: Logo/tagline, Product links, Resources, Legal
- Social icons row with purple hover states
- Copyright bar at bottom with subtle purple accent

**Specifications:**
```css
.footer {
  background: var(--bg-primary);
  padding: 80px 0 40px;
  border-top: 1px solid var(--border-light);
  position: relative;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
}

.footer-link {
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--accent-primary);
}

.footer-social-icon {
  color: var(--text-tertiary);
  transition: all 0.2s ease;
}

.footer-social-icon:hover {
  color: var(--accent-primary);
  transform: translateY(-2px);
}
```

---

## 8. Animation & Interaction Specifications

### 8.1 Scroll-Triggered Animations

Using Intersection Observer for performance:

```javascript
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### 8.2 Lottie Animation Specifications

**Required Lottie Animations:**

1. **Hero Animation**: Prompt transformation visualization
   - Duration: 3-4 seconds, loop
   - Trigger: On page load
   - Size: 400×300px

2. **Code Analysis**: Scanning/analyzing effect
   - Duration: 2 seconds, loop
   - Trigger: When in viewport
   - Size: 200×200px

3. **Streaming Text**: Typing/generation effect
   - Duration: 2 seconds, loop
   - Trigger: When in viewport
   - Size: 150×100px

4. **Success Checkmark**: Completion indicator
   - Duration: 1 second, play once
   - Trigger: On specific interaction
   - Size: 64×64px

**Lottie Implementation:**
```jsx
import Lottie from 'lottie-react';
import promptAnimation from './animations/prompt-transform.json';

<Lottie
  animationData={promptAnimation}
  loop={true}
  autoplay={true}
  style={{ width: 400, height: 300 }}
  onComplete={() => console.log('Animation complete')}
/>
```

### 8.3 Hover States

**Button Hover:**
```css
.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--text-primary);
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px var(--glow-purple);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--glow-purple-strong);
  background: linear-gradient(135deg, var(--accent-primary-hover), var(--accent-secondary));
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px var(--glow-purple);
}
```

**Card Hover:**
```css
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--glow-purple);
  border-color: var(--border-accent);
  background: var(--bg-card-hover);
}
```

### 8.4 Page Transitions

Using CSS transitions for route changes:

```css
.page-enter {
  opacity: 0;
}

.page-enter-active {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 0.3s ease;
}
```

---

## 9. Responsive Design Breakpoints

```css
/* Mobile First Approach */
/* Base: 0-639px (Mobile) */

/* Small tablets */
@media (min-width: 640px) { /* sm */ }

/* Tablets */
@media (min-width: 768px) { /* md */ }

/* Small laptops */
@media (min-width: 1024px) { /* lg */ }

/* Desktops */
@media (min-width: 1280px) { /* xl */ }

/* Large desktops */
@media (min-width: 1536px) { /* 2xl */ }
```

### 9.1 Mobile Adaptations

- Hero headline: 40px (down from 72px)
- Section padding: 64px (down from 120px)
- Bento cards: Single column stack
- Navigation: Hamburger menu
- Testimonials: Single card view with dots
- Pricing cards: Stacked vertically

---

## 10. Accessibility Requirements

### 10.1 WCAG 2.1 AA Compliance

- Color contrast ratio: Minimum 4.5:1 for text
- Focus indicators: Visible outline on all interactive elements
- Keyboard navigation: Full site navigable via keyboard
- Screen reader support: Proper ARIA labels and semantic HTML
- Motion: Respect prefers-reduced-motion

### 10.2 Focus States

```css
*:focus-visible {
  outline: 2px solid var(--accent-primary);  /* Purple focus ring */
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}

/* Purple link styling */
a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--accent-primary-hover);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Performance Requirements

### 11.1 Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 11.2 Asset Optimization

- Images: WebP format with fallbacks, lazy loading
- Lottie: Load animations only when in viewport
- Fonts: Font-display: swap, preload critical weights
- CSS: Critical CSS inlined, rest deferred
- JavaScript: Code splitting, tree shaking

---

## 12. Technical Implementation Notes

### 12.1 Required Dependencies

See `package.json` for complete dependency list. Key additions:
- `lottie-react` for animations
- `framer-motion` for scroll animations
- `embla-carousel-react` for testimonials
- `@radix-ui` components for accessibility

### 12.2 File Structure

```
src/
├── components/
│   ├── ui/                  # Base UI components
│   ├── sections/            # Page sections
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   └── FAQ.tsx
│   └── layout/
│       ├── Navigation.tsx
│       └── Footer.tsx
├── animations/              # Lottie JSON files
├── styles/
│   ├── globals.css
│   └── variables.css
└── lib/
    └── utils.ts
```

---

## 13. Deliverables Checklist

- [ ] Updated color system implementation
- [ ] Inter font integration
- [ ] Background textures (dot grid, noise)
- [ ] Navigation component with scroll behavior
- [ ] Hero section with animations
- [ ] Logo strip component
- [ ] Bento grid feature section
- [ ] Individual feature cards with Lottie
- [ ] Testimonials carousel
- [ ] Pricing table redesign
- [ ] FAQ accordion
- [ ] Footer redesign
- [ ] Mobile responsive adaptations
- [ ] Accessibility audit pass
- [ ] Performance optimization

---

## 14. Success Metrics

Post-launch, measure:
- Conversion rate (visitor → signup)
- Time on page
- Scroll depth
- CTA click-through rate
- Core Web Vitals scores
- Accessibility audit score

---

*This PRD serves as the definitive guide for the Promptr landing page redesign. All design decisions should reference this document. Questions or proposed changes should be documented and approved before implementation.*

