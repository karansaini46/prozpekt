# AI Decision & Interaction Log

This log tracks key architectural decisions, trade-offs, and user corrections throughout the project.

---

### Entry 001 - Project Scaffolding & Adapter Choice
- **Decision**: Selected Astro 5 minimal template with `@astrojs/vercel` serverless adapter.
- **Rationale**: Vercel's adapter supports Astro's prerender model with zero boilerplate. The landing page (`index.astro`) can remain completely static/prerendered for instant CDN delivery, while `/api/claim` runs as an isolated serverless API route (`export const prerender = false`). Cloudflare was considered, but Vercel requires zero edge-runtime shims or node-compatibility flags for standard JSON request parsing.

### Entry 002 - Font Strategy & CLS Elimination
- **Decision**: Self-hosted `Plus Jakarta Sans` (weights 500 and 700 only) as WOFF2 in `public/fonts/`, paired with a metric-matched fallback (`size-adjust`, `ascent-override`, `descent-override`).
- **Rationale**: Self-hosting avoids third-party Google Fonts connection latency and layout pop-in. Using only two weights (500 for legible body text, 700 for headlines & CTA) keeps the total font payload under 40KB. Metric-matched fallbacks ensure zero Cumulative Layout Shift (CLS) when fonts swap.

### Entry 003 - Design Tokens & WCAG AA Contrast
- **Decision**: Built a warm artisanal café design system using deep espresso charcoal (`#1F1916`), oat milk cream (`#FAF7F2`), and terracotta amber (`#9E430B`).
- **Rationale**: Escapes generic AI purple/blue gradients while providing authentic tactile warmth for Morrow Café (Sector 104, Noida). The accent color `#9E430B` achieves 6.56:1 contrast against white and 5.8:1 against cream, comfortably exceeding WCAG AA (4.5:1) standards for both normal and large text.

### Entry 004 - Mobile Above-the-Fold Geometry & Aspect Ratio
- **Decision**: Sized mobile hero imagery with a 2:1 aspect ratio (`max-height: 140px`) and `object-position: center 90%` inside a `<picture>` wrapper with `display: block; width: 100%; height: 100%`.
- **Rationale**: Ensures the artisanal heart latte art is perfectly framed while guaranteeing that the brand, location, headline, why-claim copy, and the primary "Claim ₹150 OFF" CTA remain 100% above the fold across all target viewports (from 360x740 up to 390x844).

### Entry 005 - Media Optimization & CLS Prevention
- **Decision**: Converted user reference images into WebP with progressive JPEG fallbacks (`hero-coffee.webp` at 42KB, `cafe-interior.webp` at 101KB). Applied `fetchpriority="high"` and `<link rel="preload">` solely to the above-the-fold hero image, and `loading="lazy"` with `decoding="async"` to the interior image below the fold.
- **Rationale**: Adheres to Core Web Vitals best practices for Largest Contentful Paint (LCP) while setting explicit width/height dimensions (480x716 and 1024x702) to prevent any layout shifts.

### Entry 006 - Semantic Landmarks & Form Slot Isolation
- **Decision**: Structured the landing page with semantic landmarks (`<header>`, `<main>`, `<footer>`), an accessible skip-link (`#claim-section`), and isolated the claim form into a clearly delimited slot (`slot="claim-form"`).
- **Rationale**: Keeps the page completely accessible, establishes clean component boundaries (`Header.astro`, `Hero.astro`, `HowItWorks.astro`, `Ambiance.astro`, `Terms.astro`, `Footer.astro`), and adheres to the strict requirement of zero client-side JavaScript for this phase.

### Entry 007 - Serverless API Contract & Unambiguous Code Alphabet
- **Decision**: Implemented `POST /api/claim` (`prerender = false`) with strict Indian mobile sanitization (`^[6-9]\d{9}$`), 2-60 char name bounds, a 600-900ms simulated processing delay, and voucher codes drawn from a 32-character alphabet excluding confusing glyphs (`0`, `O`, `1`, `I`).
- **Rationale**: Physical counter redemptions at coffee shops are error-prone under dim lighting; eliminating lookalike characters prevents customer friction. A deterministic trigger (`name: "error test"` or `"500"`) enables verifiable testing of 500 error banners.

### Entry 008 - Accessible Zero-Dependency Form with Progressive Enhancement
- **Decision**: Created `ClaimForm.astro` using standard vanilla TypeScript with zero external libraries. Configured `action="/api/claim"` and `method="POST"`, while client JS intercepts submission for real-time validation on blur, polite `aria-live` error announcements, auto-focusing the first invalid field, and in-place clipboard copy.
- **Rationale**: Minimizes code complexity and runtime overhead. If JS fails or is disabled, the form remains standard HTML with native constraints; with JS, it delivers instant client-side feedback, non-shifting loading animations (`aria-busy`), and error recovery with preserved input.

### Entry 009 - Client-Side Bundle Budget
- **Decision**: Packaged the entire client script within `<script>` in `ClaimForm.astro`.
- **Rationale**: Measured bundle size at 1.75 KB gzipped (1.46 KB Brotli), well under the 2 KB budget, achieving optimal FID/INP performance with zero third-party script latency.

### Entry 010 - In-Place Ticket Voucher & Focus Management
- **Decision**: Replaced the active form in-place inside `.claim-card` with an artisanal perforated ticket card featuring "₹150 OFF claimed", large letter-spaced monospace code (`MORROW-XXXX`), a dynamic 30-day expiry line, and a "Copy code" button. After transition, focus is automatically moved to `<h2 id="success-heading" tabindex="-1">`.
- **Rationale**: Preserves exact container bounds to prevent vertical layout jumping. Moving programmatic focus to the success heading ensures screen readers immediately announce the completed claim without disorienting the visitor.

### Entry 011 - Single-Interaction Pure CSS Animation
- **Decision**: Implemented exactly one entrance animation (`ticketSlideIn`: 300ms, transform & opacity only) and a tactile `:active` scale response (`transform: scale(0.98)` on buttons), strictly isolated inside `@media (prefers-reduced-motion: no-preference)`.
- **Rationale**: Respects accessibility motion preferences while keeping runtime GPU composite costs minimal without any third-party animation libraries.

### Entry 012 - Production Lighthouse & Performance Audit Results
- **Decision**: Added `<link rel="canonical">` and `robots.txt`, and audited the production build.
- **Result**:
  - Performance: **99**
  - Accessibility: **100**
  - Best Practices: **100**
  - SEO: **100**
  - Core Web Vitals: LCP = 2.0s, CLS = 0, TBT = 0ms.

### Entry 013 - Bug Fix: CSS Specificity Overriding HTML `hidden` Attribute
- **Correction**: The user identified that the error banner (`⚠️ Could not generate voucher...`) was visibly displaying on initial load without any user action.
- **Root Cause**: The HTML attribute `<div id="form-error-banner" hidden>` relies on the browser's user-agent rule `[hidden] { display: none; }`. However, the component class `.form-error-banner { display: flex; }` has higher CSS specificity (class selector vs attribute selector), causing `display: flex` to override `hidden`.
- **Fix**: Added `[hidden] { display: none !important; }` to `global.css` reset and explicitly declared `.form-error-banner[hidden] { display: none !important; }` in `ClaimForm.astro`.
