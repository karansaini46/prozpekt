# Morrow Café - Hiring Assignment Context & Brief

## Role & Engineering Philosophy
Founding Frontend Engineer hiring assignment.
Code must remain simple, readable, and minimal so every line can be explained live during technical interviews. Polish and focus beat bloated scope.

## Project Brief
A mobile-first campaign landing page for a fictional artisanal café, **"Morrow Café"**, Sector 104, Noida.
- **Offer**: "Get ₹150 OFF your next visit"
- **Primary CTA**: "Claim ₹150 OFF"
- **Visitor Context**: Arrives via a physical QR code scan with zero initial context.
- **Core Goal**: Within seconds, the page must intuitively answer:
  1. What is this? (Artisanal café in Sector 104, Noida)
  2. What do I get? (₹150 instant discount on the next visit)
  3. Why claim it? (Specialty roasts, handcrafted bakes, inviting ambiance)
  4. What do I do? (Enter Name + Phone and tap Claim)
  5. What happens after I submit? (Instant unique claim code with copy button to show at the counter)

## Hard Requirements
1. **Form**: Name + Phone ONLY (strictly no unnecessary fields).
2. **API Endpoint**: `POST /api/claim`
   - Request: `{ name: string, phone: string }`
   - Success response (200): `{ success: true, claimCode: "MORROW-XXXX", message: string }`
   - Error response (400/500): `{ success: false, message: string }`
3. **Success State**:
   - Displays generated claim code
   - Helper text: "Show this code when you visit Morrow Café"
   - Copy button with interactive feedback
4. **Responsiveness**: Mobile-first, tablet, and desktop (desktop is an intentional multi-column layout, not a stretched mobile container).
5. **Animation**: Thoughtful micro-interactions respecting `@media (prefers-reduced-motion: reduce)`.
6. **Performance**: Minimal client-side JS, optimized & lazy-loaded imagery, zero layout shift (CLS), preloaded self-hosted fonts with metric-matched fallbacks.
7. **Accessibility (a11y)**: Semantic HTML, real `<label>` elements, high-contrast visible focus rings, WCAG AA compliance (4.5:1+ text contrast), `aria-live` announcements for validation and submission states.
8. **Scope Guard**: Time budget 3-4 hours. No external UI frameworks, no Tailwind, no bloated animation libraries.

## Tech Stack & Directory Structure
- **Framework**: Astro (TypeScript, standard HTML/CSS/JS).
- **Server Adapter**: `@astrojs/vercel` (serverless execution for `/api/claim`, static prerendering for `/`).
- **Directories**:
  - `src/pages/` - Pages and API routes (`index.astro`, `api/claim.ts`)
  - `src/components/` - Focused Astro components
  - `src/styles/` - Design tokens and global styles (`global.css`)
  - `src/lib/` - Shared utilities and validation logic
  - `public/images/` - Optimized static visual assets
  - `public/fonts/` - Self-hosted font files

## Dev Server Commands
- Dev server: `astro dev --background`
- Manage background server: `astro dev stop`, `astro dev status`, `astro dev logs`
