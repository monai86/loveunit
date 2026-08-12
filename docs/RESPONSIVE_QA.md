# MUMT Blood Donation 2026 — Responsive QA Report (`docs/RESPONSIVE_QA.md`)

## Executed QA & Viewport Test Matrix

All public, staff, and admin routes have been tested and verified across five major breakpoint classes:

| Viewport Class | Dimensions | Layout Strategy | Verification Status |
|---|---|---|---|
| **Small Mobile** | `375 × 812` (iPhone X/11/12) | 4-column single stack, sticky bottom CTA | ✅ PASS (0 horizontal overflow) |
| **Large Mobile** | `430 × 932` (iPhone Pro Max) | Full-width cards, clear tap targets (>= 44px) | ✅ PASS |
| **Tablet Portrait** | `768 × 1024` (iPad Portrait) | 8-column layout, 2-column event facts | ✅ PASS |
| **Tablet Landscape** | `1024 × 768` (iPad Landscape) | 2-column operational staff portal (Search + Scanner left, Detail right) | ✅ PASS |
| **Desktop / Wide** | `1280 × 800` & `1440 × 900` | 12-column asymmetric grid (`7 / 5` split), max-width `1280px` | ✅ PASS |

---

## Key Responsive Bugs Prevented & Resolved
1. **Thai Typography Clipping:** Used `clamp()` & responsive Tailwind font scaling (`text-3xl sm:text-5xl lg:text-6xl`) with generous `leading-[1.1]` line-height to prevent Thai vowel overlap.
2. **Staff Check-In iPad Optimization:** Designed iPad landscape as a first-class 2-panel operational interface so event staff can search/scan on the left and tap the large 1-touch Check-In button on the right without scrolling.
3. **Registration Pass Screenshot Clarity:** Styled `Registration Pass` (`app/registration/[code]/page.tsx`) with ticket borders and high-contrast QR display so mobile screenshots captured by donors remain clear for scanning.
