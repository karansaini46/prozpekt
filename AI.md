# AI Usage & Collaboration Log

This document summarizes how AI was utilized as a pair-programming partner during the development of the Morrow Café campaign page, along with human review and architectural decisions.

---

## 1. Tools Used
- **Antigravity AI Agent** (Pair programmer powered by Gemini 3.8 Flash)
- **Node.js & Astro CLI**
- **Headless Chrome (via Chrome DevTools Protocol & CLI)** for viewport, performance, and accessibility validation
- **Google Lighthouse CLI (v13.5.0)** for mobile performance and Core Web Vitals benchmarking

> *TODO: Verify and customize the tool list above to reflect your personal workflow and setup.*

---

## 2. What I Used AI For
- **Boilerplate Scaffolding**: Initializing a clean Astro 5 project configured with the `@astrojs/vercel` serverless adapter.
- **Token Design System**: Calculating WCAG AA contrast ratios (e.g. terracotta `#9E430B` on white/cream) and establishing a mathematical 4px/8px spacing grid.
- **Image Conversion**: Generating WebP assets with progressive JPEG fallbacks from user reference photos using `ffmpeg`.
- **E2E Automation Scripting**: Writing lightweight zero-dependency Node.js test scripts using the Chrome DevTools Protocol (CDP) to programmatically test viewports, input errors, double-submit guards, and clipboard events.
- **Live Interview Prep**: Formulating the data-flow summary and technical quiz questions based directly on the written code.

> *TODO: Review these bullets and adjust to highlight the specific parts you prompted or guided.*

---

## 3. One Useful Thing AI Helped With
- **Metric-Matched Font Fallback Setup**:
  To eliminate Cumulative Layout Shift (CLS) when self-hosted `Plus Jakarta Sans` swaps in on mobile devices, the AI calculated metric overrides (`ascent-override: 104%`, `descent-override: 28%`, `size-adjust: 102%`) on a local `Arial` fallback `@font-face`.
  This achieved a strict **CLS score of 0.000** in Lighthouse audits, ensuring zero visual jumping when scanning QR codes on mobile connections.

> *TODO: Verify this explanation and rewrite it in your own voice for your interview presentation.*

---

## 4. One Thing AI Got Wrong (Or That I Changed)
- **The `<picture>` Inline Sizing Gotcha**:
  When first implementing the mobile hero image, the AI wrapped the `<img>` inside a `<picture>` element with `object-fit: cover` and `object-position: center 90%` to focus on the latte art. However, because `<picture>` defaults to `display: inline` in standard CSS, the child `<img>` did not resolve `height: 100%` against the parent container. This resulted in the image overflowing its wrapper and showing the top leafy plants rather than the coffee cup.
- **CSS Specificity Overriding the HTML `hidden` Attribute**:
  The error banner (`<div id="form-error-banner" class="form-error-banner" hidden>`) was unexpectedly visible on initial page load before any interaction occurred. The browser's default user-agent stylesheet specifies `[hidden] { display: none; }`, but the component class rule `.form-error-banner { display: flex; }` has higher specificity than an attribute selector. Consequently, `display: flex` overrode `hidden`.
  **The Fix**: I added `[hidden] { display: none !important; }` to the CSS reset in `global.css` and explicitly declared `.form-error-banner[hidden] { display: none !important; }` in `ClaimForm.astro`.

> *TODO: Confirm these real technical fixes and ensure you can explain the `<picture>` display property and `[hidden]` CSS specificity behaviors live.*

---

## 5. What I Personally Reviewed
- **HTML Semantics & Heading Hierarchy**: Verified that only one `<h1>` exists, followed logically by `<h2>` landmarks, semantic `<header>`, `<main>`, and `<footer>`, and a functional skip-link.
- **Accessibility & Contrast**: Manually checked that all text combinations exceed the 4.5:1 WCAG AA threshold (with body copy achieving 15.8:1 AAA).
- **Bundle Size & Dependencies**: Ensured no external npm UI framework, Tailwind, or animation library was introduced into `package.json`. Shipped a single vanilla client script of only **1.75 KB (gzipped)**.
- **API Edge Cases & Safety**: Confirmed that phone numbers are sanitized server-side, unambiguous codes (`MORROW-XXXX` without lookalike characters) are generated, and deterministic test triggers (`"error test"`) allow live testing of 500 banners.

> *TODO: Read through this list, check the corresponding lines in the codebase, and verify that you can explain each during your interview.*
