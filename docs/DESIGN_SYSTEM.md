# MUMT Blood Donation 2026 — Design System (`docs/DESIGN_SYSTEM.md`)

## 1. Design Philosophy: Warm Editorial Blood Drive
The design system balances four distinct visual identities:
> University campaign poster × editorial publication × civic event × practical digital service

### 5 Core Attributes:
1. **HUMAN:** Welcoming, warm, tailored for Mahidol University students, staff, and donors.
2. **BOLD:** Confident typography and scale over decoration.
3. **EDITORIAL:** Asymmetry, strong typographic scale, whitespace, structured grids, and section numbering.
4. **FUNCTIONAL:** Obvious, fast, accessible forms and operational tools.
5. **LOCAL:** Grounded in Mahidol University's identity and event context.

---

## 2. Color System & Tokens

| Token Name | Hex Code | Role / Usage |
|---|---|---|
| `Blood Burgundy` | `#7A1020` | Primary Brand Identity, Display Headlines, Primary CTAs |
| `Warm Red` | `#B42336` | Accent Highlights, Time Slot Availability, Active Badges |
| `Soft Rose` | `#FCE8EC` | Background Tinting, Secondary Buttons, Subtle Dividers |
| `Rose Border` | `#F0C4CC` | Structured Container & Card Borders |
| `Warm White` | `#FFF9F9` | Primary Page Background |
| `Near White` | `#FFFCFC` | Card & Paper Surfaces |
| `Charcoal Ink` | `#29272A` | Primary Body & Display Text (High Contrast >= 14:1) |
| `Muted Ink` | `#6B6366` | Secondary Captions, Timestamps, Labels |

---

## 3. Typography & Type Scale

### Fonts:
- **Display & Headings:** Condensed Editorial Sans (`Prompt` / `Kanit` Bold)
- **Body & Controls:** High-legibility Thai Sans (`Prompt` / System Sans)

### Responsive Type Scale:
```text
Display XL (Hero Campaign Headline)
  Desktop: 64px - 80px (clamp)
  Tablet: 48px - 60px
  Mobile: 36px - 44px

Display L (Section Title & Oversized Facts)
  Desktop: 40px - 48px
  Tablet: 32px - 40px
  Mobile: 28px - 32px

Heading (Card Title / Sub-header)
  20px - 24px

Body Large
  17px - 18px

Body Regular
  14px - 16px (line-height: 1.6)

Label / Caption
  11px - 13px (font-weight: 700)
```

---

## 4. "UNIT" Brand Motif System
`UNIT` is used as a structural section marker across public pages:

- `UNIT 01` — Campaign Hero & Event Metadata
- `UNIT 02` — Donor Journey (Register → Prepare → Arrive → Donate → Rest)
- `UNIT 03` — Preparation Guide
- `UNIT 04` — Venue & Transportation Map
- `UNIT 05` — Event Contact & Organizers

---

## 5. Layout & Responsive Grids

- **Max Content Width:** `1280px` (Reading prose max-width: `720px`)
- **Desktop (>= 1024px):** 12-column grid, asymmetric column splits (`7 / 5` or `8 / 4`).
- **Tablet / iPad (768px - 1023px):** 8-column grid with custom landscape & portrait rules.
- **Mobile (< 768px):** 4-column grid, full-width single column stack.

---

## 6. Border Radius & Shadows

- **Inputs & Controls:** `8px - 12px`
- **Cards & Event Containers:** `12px - 16px` (Strictly avoid `rounded-3xl` everywhere)
- **Poster & Infographic Artwork:** `4px - 8px`
- **Shadows:** Minimal, subtle float shadows (`0 8px 24px -4px rgba(122,16,32,0.06)`).

---

## 7. Negative Design Constraints (Banned Patterns)

❌ No glassmorphism or blurred backdrop-filter cards
❌ No purple/blue glowing gradient blobs or floating particle effects
❌ No gradient text (`background-clip: text`)
❌ No wall-of-cards (wrapping every paragraph inside identical rounded boxes)
❌ No generic Lucide icons placed next to every single heading
❌ No centered SaaS hero section layouts
❌ No hospital-sterile blue-white colors
