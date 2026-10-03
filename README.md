# Morrow Café — Campaign Landing Page & Claim Flow

A mobile-first campaign landing page and voucher claim flow for **Morrow Café**, Sector 104, Noida. Built for visitors arriving via a physical QR code scan at the counter or table with zero prior context.

Built with **Astro 5**, **TypeScript**, and **Vanilla CSS** (zero client UI frameworks).

---

## Quick Links
- **Live Demo**: [Run locally](#how-to-run-locally)
- **Tech Stack**: Astro 5, TypeScript, Vanilla CSS, `@astrojs/vercel`
- **Lighthouse**: Performance 99 | Accessibility 100 | Best Practices 100 | SEO 100
- **Client JS**: 1.75 KB gzipped (0 ms Total Blocking Time)

---

## What I Built

A focused, single-purpose landing page that answers five questions above the fold on mobile without scrolling:
1. **What is this?** Morrow Café, Sector 104, Noida (Artisanal roastery & neighborhood bakes).
2. **What do I get?** ₹150 OFF your next visit.
3. **Why claim it?** Single-origin brews, slow-ferment sourdough, cozy space.
4. **What do I do?** Enter Name + Phone and tap *"Claim ₹150 OFF"*.
5. **What happens after I submit?** An instant counter ticket appears in-place with a one-tap copy button to show the barista.

Below the fold, the page keeps it minimal: how redemption works in 3 steps, ambiance overview with lazy-loaded photography, terms & conditions, and café location/hours.

---

## Tech Stack & Why Astro

- **Astro 5 (Hybrid Mode)**: Static prerendering for the landing page (`/index.astro`) and serverless execution for the API (`/api/claim.ts`).
- **Why Astro**: Marketing and lead-generation pages should not pay a 100 KB React/framework tax. Astro delivers pure static HTML to the edge CDN while letting us drop in a tiny, focused client script for the form.
- **Vanilla TypeScript & Plain CSS**: No Tailwind, no React, no animation libraries. The entire client-side bundle is **1.75 KB gzipped**, yielding an instant First Input Delay and zero layout shift.

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
# or specify port:
npx astro dev --port 3000 --host

# 3. Production build
npm run build

# 4. Preview production build locally
python3 -m http.server 3000 --directory .vercel/output/static
```

---

## Key Technical Decisions

### 1. Why Mock the API (`POST /api/claim`)
- Built as an Astro serverless endpoint (`export const prerender = false`).
- Simulates realistic 600–900ms network latency to test loading states and prevent double-clicks.
- Normalizes Indian mobile numbers (strips `+91`, `0`, spaces, dashes) and validates against `/^[6-9]\d{9}$/`.
- Generates codes like `MORROW-7F2K` using an unambiguous 32-character alphabet (`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`), explicitly omitting lookalike glyphs (`0`, `O`, `1`, `I`) to prevent transcription errors at a dimly lit café counter.
- **Deterministic test triggers**:
  - Name `"error test"` or containing `"500"` forces a 500 server error to test retry UX.
  - Name `"bad request"` forces a 400 error.

### 2. Phone Validation
- Evaluates on `blur` for immediate inline feedback and on `submit`.
- Uses plain-language copy (*"Enter a 10-digit Indian mobile number"*).
- When invalid, automatically shifts focus to the first offending input with `aria-invalid="true"`.
- Error messages are announced politely to screen readers via `aria-live="polite"`.

### 3. The One Animation & Why
- Exactly **one** thoughtful transition: when the voucher is generated, the form swaps in-place with the perforated ticket card using a 300ms CSS `opacity` + `translateY` transition.
- **Why**: Keeps the visitor in their mental model without page reloads or layout jump.
- All motion is strictly wrapped in `@media (prefers-reduced-motion: no-preference)`. If reduced motion is requested, it snaps immediately.

---

## Performance & Lighthouse Results

Audited using Lighthouse CLI on mobile throttling against the production build:

| Metric | Score / Value | Target | Notes |
| :--- | :--- | :--- | :--- |
| **Performance** | **99 / 100** | > 90 | Hero WebP preloaded with `fetchpriority="high"` |
| **Accessibility** | **100 / 100** | 100 | Semantic HTML, real `<label>`s, 4.5:1+ contrast |
| **Best Practices** | **100 / 100** | 100 | Modern security headers, HTTPS-ready |
| **SEO** | **100 / 100** | 100 | OpenGraph, Twitter cards, meta descriptions, robots.txt |
| **LCP** | **2.0 s** | < 2.5 s | Preloaded hero image, zero render-blocking JS |
| **CLS** | **0.000** | < 0.1 | Explicit image dimensions + font override metrics |
| **TBT** | **0 ms** | < 200 ms | Vanilla JS runs off main thread |

### Performance Observations (Found / Fixed / Left Alone)
- **Found**: Google Fonts caused a brief layout shift (CLS = 0.04) when swapping in.
- **Fixed**: Self-hosted `Plus Jakarta Sans` WOFF2 (weights 500 and 700 only) and created a metric-matched `@font-face` Arial fallback (`size-adjust: 102%`, `ascent-override: 104%`). CLS dropped to **0.000**.
- **Left Alone**: Kept a 42 KB WebP hero image rather than an ultra-compressed grainy thumbnail to preserve the artisanal café aesthetic.

---

## Product Thinking

### Decision 1: Above the Fold (Mobile)
A customer standing at a physical counter has zero patience. If they must scroll past decorative coffee photos to find the form, conversion drops. By budgeting every vertical pixel (capping the hero image aspect ratio to 2:1 and hiding redundant subheadings on small mobile screens), the café identity, offer, why-claim copy, Name + Phone inputs, and the primary CTA all fit above the 740px fold on small mobile viewports (e.g. 360×740 Android and 390×844 iPhone).

### Decision 2: Production Edge Cases

1. **Duplicate Claims**:
   - Store normalized `E.164` phone numbers with a unique constraint in PostgreSQL.
   - If a customer submits an already-registered number, **do not show a red error**. Return their existing active voucher code (*"Welcome back! Here is your active code: MORROW-XXXX"*). This prevents counter embarrassment if they accidentally refreshed their browser.

2. **Rate Limiting**:
   - Add an edge sliding-window limiter (Upstash Redis or Vercel KV) allowing a maximum of **5 requests per 10 minutes per IP** to prevent bot abuse.
   - Limit redemptions to 1 claim per phone number every 30 days.

3. **API Failures & Offline Recovery**:
   - If `/api/claim` returns an error, the client preserves the user's typed name and phone and renders an inline "Retry" button so they don't have to re-type.
   - In production, if the database is unreachable, fall back to generating an HMAC-signed offline token (`MORROW-SIGNATURE`) that cashiers can verify on their POS even during an outage.

---

## QA & Test Coverage

Tested across viewports (360×740, 390×844, 768×1024, 1024×768, 1440×900) via automated Chrome DevTools Protocol scripts:

- **Empty submit**: Inline error rendered, focus shifted to Name field.
- **Bad phone (`12345`)**: Inline error rendered, focus shifted to Phone field.
- **Forced 500 error**: Name `"error test"` triggers simulated server error; banner displayed with typed inputs preserved; clicking "Retry" after fixing recovers cleanly.
- **Double-click guard**: Rapid multi-clicks on submit button send exactly 1 request; button displays loading spinner with `aria-busy="true"`.
- **Copy button**: Copies code to clipboard, changes label to "Copied", announces via `aria-live`, and includes a fallback `textarea` mechanism for unsupported environments.
- **Keyboard navigation**: Skip link works on first Tab, tab order flows naturally, focus rings visible with 2px offset.
- **Reduced motion**: When `prefers-reduced-motion: reduce` is enabled, all CSS transitions snap immediately (0ms).

---

## What I Cut for Time

1. **SMS OTP Verification**: Integrating Twilio/Fast2SMS would exceed the 3–4 hour project budget.
2. **Cashier POS Interface**: Kept focus strictly on the customer-facing QR landing page.
3. **Dark Mode**: Focused on establishing a warm, tactile café aesthetic matching the physical space.

---

## What I'd Improve in Production

1. **WhatsApp / SMS Delivery**: Automatically send the claim code via WhatsApp Business API so customers don't lose it after closing Safari/Chrome.
2. **Apple Wallet / Google Pay**: Add an *"Add to Apple Wallet"* pass button on the ticket for lock-screen reminders near Sector 104.
3. **Analytics**: Privacy-friendly telemetry (Plausible) tracking QR scan → form focus → code copy conversion funnel.
