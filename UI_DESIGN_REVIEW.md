# UI Design Review — Promptr Website

This document summarizes the UI/UX analysis of the Promptr marketing site (React + Vite + Tailwind), per the design review plan. It covers page structure, visual system, CTA flows, responsiveness/accessibility, and prioritized recommendations.

---

## 1. Page structure and component responsibilities

### Entry and routing

- **Entry:** [src/main.tsx](src/main.tsx) mounts the app with `ClerkProvider` and loads [src/index.css](src/index.css) (Tailwind only; no custom design tokens).
- **Routing:** Handled in [src/App.tsx](src/App.tsx) via `window.location.pathname` (no React Router). Paths and owners:

| Path | Component(s) | Responsibility |
|------|--------------|----------------|
| `/` | Background layers, Navigation, Hero, Features, Testimonials, Pricing, FAQ, Footer, NotificationSystem | Marketing landing + global notifications |
| `/sign-in` | AuthPage (sign-in), NotificationSystem | Clerk sign-in |
| `/sign-up` | AuthPage (sign-up), NotificationSystem | Clerk sign-up |
| `/checkout` | CheckoutRedirect, NotificationSystem | Create Stripe session and redirect to Stripe |
| `/account` | AccountDashboard, NotificationSystem | Token, subscription, usage (RequireAuth inside dashboard) |
| `/cancelled` | Inline JSX in App.tsx, NotificationSystem | Checkout-cancelled message + “Return to Home” |

### Home page section order and IDs

1. **Navigation** ([src/components/Navigation.tsx](src/components/Navigation.tsx)) — Fixed; nav items: Features, Testimonials, Pricing, FAQ; auth: Sign in or Dashboard + user menu (delete account, sign out).
2. **Hero** ([src/components/Hero.tsx](src/components/Hero.tsx)) — Two-column: headline + subtext + “Install Extension” (external) + “Get Started” (scroll to `#pricing`); right: demo GIF.
3. **Features** — Wrapper `<div id="features">` in App; [Features.tsx](src/components/Features.tsx) renders section heading + 6 feature cards in a grid.
4. **Testimonials** — Wrapper `<div id="testimonials">`; [Testimonials.tsx](src/components/Testimonials.tsx): carousel (auto + prev/next + dots).
5. **Pricing** — Wrapper `<div id="pricing">`; [Pricing.tsx](src/components/Pricing.tsx): Free and Pro cards (subscription state, checkout, free-plan signup).
6. **FAQ** — Wrapper `<div id="faq">`; [FAQ.tsx](src/components/FAQ.tsx): accordion (Radix) over static FAQ data.
7. **Footer** ([src/components/Footer.tsx](src/components/Footer.tsx)) — Copyright, GitHub/Twitter/Mail links.

### Supporting components

- **AuthWrapper** ([src/components/AuthWrapper.tsx](src/components/AuthWrapper.tsx)): AuthPage (Clerk SignIn/SignUp + wrapper layout), RequireAuth (loading + redirect to sign-in).
- **CheckoutRedirect** ([src/components/CheckoutRedirect.tsx](src/components/CheckoutRedirect.tsx)): Calls create-checkout-session, redirects to Stripe or shows error.
- **AccountDashboard** ([src/components/AccountDashboard.tsx](src/components/AccountDashboard.tsx)): Token display/copy, subscription status, usage, manage/cancel subscription.
- **NotificationSystem** ([src/components/NotificationSystem.tsx](src/components/NotificationSystem.tsx)): Global toast-style notifications (success/error/warning/info).

### UI primitives

- [src/components/ui/](src/components/ui/): `button`, `card`, `badge`, `accordion`, `dialog`, `dropdown-menu`. Built with Radix where applicable; Button/Card use CVA/cn; no shared theme variables in Tailwind (theme.extend only has accordion keyframes).

---

## 2. Visual system and CTA styles

### Backgrounds

- **Home:** Five fixed full-bleed layers in App.tsx: base gradient (slate-900 → purple-900 → slate-900), then blue/purple/pink overlays, two radial blurs, then a 64×64 grid. All content sits in a `relative z-10` wrapper.
- **Auth (AuthWrapper):** `min-h-screen` with gray-900/purple-900 gradient and radial ellipses; inline `backgroundColor: '#0B0B0E'`.
- **Cancelled:** `bg-black`, card `bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl`.
- **Pricing section:** Local `absolute` gradient and blur orbs; **Features:** no extra background beyond App; **Testimonials/FAQ:** section-level gradients/blur (e.g. gray-900/80, gray-800/80).

### Typography

- **Headlines:** Mix of `text-3xl`–`text-6xl`, `font-bold`, white with gradient spans (`from-blue-400 via-purple-400 to-pink-400`). Section titles use similar gradient text (Features, Testimonials, Pricing, FAQ).
- **Body:** `text-gray-300` / `text-gray-400`, `font-light` in places; sizes `text-sm`–`text-xl` by context.
- No shared type scale or CSS variables; sizes are ad hoc per component.

### Spacing and layout

- **Containers:** `max-w-7xl` (Hero/Nav), `max-w-6xl` (Features, Pricing), `max-w-4xl` (Testimonials, FAQ), `max-w-5xl` (Footer). Horizontal padding `px-4` with occasional `lg:px-8 xl:px-16`.
- **Section vertical:** `py-16`–`py-32` (e.g. Hero `py-32`, FAQ `py-32`, Pricing `py-32`, Testimonials `py-20`, Features `pb-20`). No single rhythm constant.

### Cards and surfaces

- **Feature cards:** `from-{color}-900/30 to-{color}-900/30`, `backdrop-blur-xl`, `border border-{color}-500/20`, `rounded-2xl`, hover border brightening.
- **Pricing cards:** Free: gray gradients, `rounded-3xl`, `min-h-[480px]`. Pro: blue/purple/pink gradient, same min-height. Both use shadcn Card (CardHeader, CardContent, CardFooter) with heavy className overrides.
- **FAQ accordion items:** `from-gray-900/80 to-gray-800/80`, `border-gray-700/50`, `rounded-3xl`; open/hover `border-blue-500/30`.
- **Testimonial block:** Single card `from-gray-900/80 to-gray-800/80`, `rounded-2xl`.

### CTA and button styles

- **Primary (gradient):** `bg-gradient-to-r from-blue-600 to-purple-600` (or hover `from-blue-500 to-purple-500`), white text, `rounded-2xl`, `shadow-lg shadow-blue-500/25`. Used: Hero “Install Extension”, Pricing “Start 14 Day Free Trial” / “Manage Subscription”, cancelled “Return to Home”.
- **Secondary (outline):** `border border-gray-600`, `bg-gray-800/50`, `hover:border-purple-500/50`, `rounded-2xl`. Used: Hero “Get Started”.
- **Navigation:** Text links with underline animation (`group-hover:w-full`); Sign in and Dashboard are button/link; user avatar uses purple gradient icon button.
- **Inconsistencies:** Many CTAs are raw `<a>` or `<button>` with long Tailwind strings; some use `<Button>` with overrides. Button primitive uses `ring-offset-background`, `focus-visible:ring-2` and semantic variants (default, destructive, outline, etc.) that don’t match the marketing palette (no `primary`/`secondary` tied to blue/purple). Card uses `bg-card`, `text-card-foreground` — these rely on CSS variables that are not defined in tailwind.config or index.css, so they fall back to browser defaults and can look off in the dark theme.

### Consistency issues

- **Hero headline:** “Supercharge” in code vs “Supercharge” in copy (consistent). Subtext “Transform vague ideas…” is repeated in Features (e.g. “Prompt Refinement”).
- **Border radius:** Mix of `rounded-2xl` and `rounded-3xl` for cards/panels without a clear rule.
- **Trust row (Pricing):** “14-day free trial”, “Cancel anytime”, “No setup fees” — present and aligned with Pro copy.
- **Delete-account modal (Navigation):** Uses Dialog + red emphasis; consistent with destructive action.
- **Bug:** Navigation Sign-in link uses `ml-30`; Tailwind has no `ml-30` (valid scale ends at 28, then 32). Likely intended `ml-8` or similar.

---

## 3. Primary CTA and auth flows

### CTA paths

1. **Install Extension (primary):** Hero “Install Extension” → external link to open-vsx (aryansudhir/promptr). Clear and above the fold.
2. **Get Started:** Hero “Get Started” → smooth scroll to `#pricing`. Clear secondary path to pricing.
3. **Pricing → Free:** “Start Free Plan” → if signed out, `/sign-up`; if signed in, POST get-user-token (plan: free) → redirect `/account`. Free plan copy: “50 prompt refinements/month”.
4. **Pricing → Pro:** “Start 14 Day Free Trial” (or “Renew” when inactive) → if signed out, `/sign-up`; if signed in, POST create-checkout-session → redirect to Stripe. If already active/trialing, shows “Manage Subscription” → `/account`.
5. **Nav Sign in:** `/sign-in` (Clerk). Sign up is reached from Pricing or direct `/sign-up`.
6. **Post sign-up:** SignUp `redirectUrl="/account"`; SignIn `redirectUrl="/"`. Checkout redirect `/checkout` creates session and sends user to Stripe.

### Messaging hierarchy

- **Hero:** One primary headline (gradient “Supercharge” + “your coding workflow”), one supporting line, two CTAs (Install Extension primary, Get Started secondary). Hierarchy is clear.
- **Features:** One section title, then grid of six features; no single “next step” CTA in section (relies on nav and scroll).
- **Testimonials:** Social proof only; no CTA in block.
- **Pricing:** “Choose your perfect plan” with Free vs Pro; trust line below. State-dependent buttons (loading, already subscribed) are clear.
- **FAQ:** Answers common questions; no CTAs inside.

**Gaps:** No sticky or repeat “Install Extension” CTA below the fold. Users who land on Pricing or FAQ may not see the extension link without scrolling up or using nav (nav has no “Install” link).

---

## 4. Responsiveness and accessibility

### Responsiveness

- **Navigation:** `hidden md:block` for desktop links; `md:hidden` for mobile menu (hamburger). Mobile menu is a vertical list with section links + auth. Logo and auth section stack correctly.
- **Hero:** `grid lg:grid-cols-[45%_55%]`; below lg, single column. CTAs `flex-col sm:flex-row`. Demo image full width on small screens.
- **Features:** `grid md:grid-cols-2 lg:grid-cols-3`; cards stack on small screens.
- **Pricing:** `grid md:grid-cols-2` with `max-w-sm mx-auto` per card; centered on small screens.
- **Testimonials:** Single card; padding `p-8 md:p-12`; dots and arrows scale.
- **FAQ:** Single column; accordion full width within `max-w-4xl`.
- **Footer:** `flex-col md:flex-row` for copyright and links.

### Accessibility

- **Focus:** Button component has `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. Custom buttons (e.g. Hero “Get Started”, Pricing card buttons) don’t consistently add focus rings; many rely on Tailwind only. `--ring` not set in theme, so focus ring color is default.
- **Navigation:** Section links are `<button>` with `onClick` (scroll). No `aria-current` for section. Mobile menu open/close has no `aria-expanded` / `aria-controls` on the hamburger. Logo is `<button>` (appropriate for in-page navigation).
- **Testimonials:** Prev/next and dots are `<button>`; carousel has no `aria-label` or `role="region"` / “Testimonials”. No `aria-live` for the changing quote (auto-rotate can surprise screen readers).
- **FAQ:** Accordion uses Radix; triggers are keyboard-accessible. No explicit `aria-label` on the section.
- **Images:** Hero demo GIF has descriptive `alt`. Favicon/demo asset usage is reasonable.
- **Color contrast:** White and gray-300 on dark gradients generally pass; gradient text (blue/purple/pink) on dark may be close on some contrasts — worth checking with a contrast checker.
- **Semantics:** Main content is not wrapped in `<main>`; only one `<nav>`. Section headings use `<h1>` (Hero only) and `<h2>` (sections). Cancelled page uses a single `<h1>`.

### Issues to fix

- **Nav:** Add `aria-expanded` and `aria-controls` to mobile menu button; consider `aria-current="page"` or similar for in-page section (or keep as-is if design is “single page” with no URL hash updates).
- **Testimonials:** Add `aria-label` to carousel controls and region; consider `aria-live="polite"` for the quote if keeping auto-rotate.
- **Focus:** Define `--ring` (and optional `--ring-offset`) in CSS or Tailwind theme and ensure all interactive elements (including custom CTAs) have a visible focus state.
- **Main landmark:** Wrap primary content (e.g. Hero through Footer) in `<main>` for screen readers and skip links.

---

## 5. Prioritized design refinements

### Quick wins

1. **Fix `ml-30` in Navigation** ([src/components/Navigation.tsx](src/components/Navigation.tsx) ~line 203): Replace with a valid utility (e.g. `ml-8`) so the Sign in link spacing is correct.
2. **Define focus ring in theme:** In [tailwind.config.js](tailwind.config.js) (theme.extend) or [src/index.css](src/index.css), set `--ring` and optionally `--ring-offset` to match the dark UI (e.g. purple or blue) so Button and other focusable elements have a consistent, visible focus state.
3. **Add `<main>`:** In [src/App.tsx](src/App.tsx), wrap the home content (Navigation through Footer) in `<main>` and keep Nav outside, or wrap only the scrollable content below Nav in `<main>`.
4. **Mobile menu accessibility:** In Navigation, add `aria-expanded={isMobileMenuOpen}`, `aria-controls="mobile-nav"`, and `id="mobile-nav"` on the mobile menu container.

### Medium effort

5. **CTA visibility below fold:** Add a secondary “Install Extension” or “Get started” in the Features section (e.g. one line + button below the grid) or a slim sticky bar on scroll so the primary CTA is reachable without scrolling up.
6. **Unify CTA components:** Introduce a small set of marketing button components (e.g. `PrimaryCTA`, `SecondaryCTA`) that use the gradient and outline styles and accept `href` or `onClick`, and use them in Hero, Pricing, and cancelled page so focus and semantics are consistent.
7. **Card/theme variables:** Either define `--card`, `--card-foreground`, `--background`, etc. in `:root` in index.css to match the dark gradients, or stop using `bg-card` / `text-card-foreground` in Card and use explicit Tailwind classes in Pricing so the dark theme looks intentional everywhere.

### Larger refactors

8. **Design tokens:** Add a small set of CSS variables or Tailwind theme entries for: primary gradient (blue–purple), surface (gray-900/80 style), border (gray-700/50), radius (2xl vs 3xl rule), and optionally type scale. Use these in components to reduce duplication and keep sections consistent.
9. **Section rhythm:** Standardize section padding (e.g. one `section-py` value) and max-widths (e.g. `content-max` 7xl for hero/nav, 6xl for features/pricing, 4xl for testimonials/faq) so future sections stay aligned.

---

## Summary

- **Structure:** Single-page marketing layout with path-based routing for auth, checkout, account, and cancelled; section IDs support in-page navigation; NotificationSystem and AuthWrapper are used consistently.
- **Visual system:** Dark theme with blue/purple/pink gradients and backdrop blur is consistent in spirit; typography, spacing, and radius are ad hoc; Button/Card semantics don’t fully match the marketing palette; one Nav typo (`ml-30`) and missing theme variables for focus and card.
- **CTAs:** Install Extension and Get Started are clear; pricing flows and auth redirects are correct; below-the-fold and nav exposure for the main CTA could be improved.
- **A11y/Responsive:** Layout is responsive; main gaps are focus ring visibility, `<main>`, mobile menu ARIA, and testimonial carousel semantics/live region.

Applying the quick wins first will fix the visible bug and improve accessibility and consistency with minimal risk; then CTA visibility and shared button components; finally tokens and section rhythm for long-term maintainability.
