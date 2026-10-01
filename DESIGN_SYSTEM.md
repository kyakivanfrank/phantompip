# Phantompip Design System

**Version 3.0 · "Obsidian Glass"**

The single source of truth for how Phantompip looks, feels and behaves. If a screen or PR disagrees with this file, one of them is wrong.

**The vision:** a private trading terminal carved from black glass. Deep, quiet surfaces. Light that comes from *inside* the glass (hairline highlights, soft inner glows, a cyan pulse on the things that matter). Numbers that feel engraved. Motion that is calm, precise and expensive. Think institutional trust with a modern, almost cinematic finish.

---

## 1. Principles

1. **Quiet luxury.** Restraint is the premium signal. One glow, one accent, one focal point per view.
2. **Depth through light, not borders.** Surfaces are separated by top-edge highlights, soft shadows and blur, not heavy outlines.
3. **Data is the hero.** Numbers get the highest contrast, mono type, tabular alignment and the most space.
4. **Alive, not busy.** Subtle spotlight, shimmer and tick feedback respond to the user. Nothing loops without a reason.
5. **Dark-first, always.** Zinc/black base; cyan is the brand, purple is atmosphere only.
6. **Accessible by default.** WCAG AA contrast, visible focus, reduced motion, never color-only meaning.

---

## 2. Tokens

Define once in `globals.css`; components reference tokens, never raw hex.

### 2.1 Color

**Surfaces**
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#09090B` | App background (zinc-950) |
| `--surface-1` | `#0F0F12` | Sidebar, page sections |
| `--surface-2` | `#18181B` | Solid panels, dropdowns, tables (zinc-900) |
| `--surface-3` | `#27272A` | Inputs, hovered rows, elevated chips (zinc-800) |

**Brand & atmosphere**
| Token | Hex | Use |
|---|---|---|
| `--brand-400` | `#22D3EE` | Hover, highlight text, glows |
| `--brand-500` | `#06B6D4` | Primary actions, active states, focus |
| `--brand-600` | `#0891B2` | Pressed state |
| `--blue-600` | `#2563EB` | Gradient end-stop only |
| `--violet-500` | `#8B5CF6` | Atmosphere/secondary chart series. Never for actions |

**Semantic** (fill `-500`, text on dark `-400`)
| Meaning | Fill | Text | Glow |
|---|---|---|---|
| Profit | `#22C55E` | `#4ADE80` | `rgba(34,197,94,.25)` |
| Loss | `#EF4444` | `#F87171` | `rgba(239,68,68,.25)` |
| Warning | `#F59E0B` | `#FBBF24` | `rgba(245,158,11,.25)` |

**Text**
| Token | Hex | Contrast | Use |
|---|---|---|---|
| `--text-1` | `#FAFAFA` | ~19:1 | Headings, key values |
| `--text-2` | `#A1A1AA` | ~7.7:1 | Body, labels |
| `--text-3` | `#71717A` | ~4.1:1 | Large/non-essential hints only; never small body text |

**Lines & light**
| Token | Value | Use |
|---|---|---|
| `--line-1` | `rgba(255,255,255,.06)` | Dividers, table rows |
| `--line-2` | `rgba(255,255,255,.10)` | Glass edges, inputs |
| `--line-3` | `rgba(255,255,255,.16)` | Hover edges |
| `--highlight` | `rgba(255,255,255,.07)` | Inset top-edge light on glass |
| `--glass-fill` | `linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.02))` | Glass fill |

### 2.2 Typography

- **DM Sans**: UI, headings, body (`font-sans`)
- **Space Mono**: numbers, tickers, labels (`font-mono`, `font-display`)

Load weights 400/500/700 (DM Sans) and 400/700 (Space Mono), `display: swap`, with system fallbacks.

| Role | Classes |
|---|---|
| Hero | `text-5xl md:text-6xl font-bold tracking-[-0.03em] leading-[1.05]` + gradient text (below) |
| H1 | `text-3xl md:text-4xl font-bold tracking-tight` |
| H2 | `text-xl md:text-2xl font-semibold tracking-tight` |
| H3 | `text-base font-semibold` |
| Body | `text-sm md:text-base text-[--text-2] leading-relaxed` |
| Caption | `text-xs text-[--text-2]` |
| Micro-label | `font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]` |
| Metric XL | `font-mono text-3xl md:text-4xl font-bold tabular-nums tracking-tight` |
| Metric inline | `font-mono text-sm tabular-nums` |

**Signature text treatments**
```css
.text-gradient   { background: linear-gradient(180deg,#fff 20%,#A1A1AA 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
.text-brand-glow { background: linear-gradient(90deg,#67E8F9,#22D3EE 40%,#3B82F6); -webkit-background-clip:text; background-clip:text; color:transparent; }
```
Use gradient text on **one** hero phrase per page, never in body copy.

Numbers: always `tabular-nums`, right-aligned in tables; decimals muted (`text-[--text-2]`) so the whole-number part reads first, e.g. `64,218<span class="text-[--text-2]">.42</span>`.

### 2.3 Radius, spacing, motion

| Radius | Use |
|---|---|
| `rounded-md` 6px | Inputs, buttons, chips |
| `rounded-lg` 8px | Dropdowns, tooltips |
| `rounded-xl` 12px | Inner tiles, code blocks |
| `rounded-2xl` 16px | Glass cards, modals |
| `rounded-3xl` 24px | Hero panels |
| `rounded-full` | Pills, badges, avatars |

Spacing: Tailwind 4px scale. Card padding `p-5 md:p-6`, card gap `gap-4 md:gap-6`, section gap `space-y-10 md:space-y-14`.

| Motion token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` |
| Fast | 150ms (hover, color) |
| Base | 220ms (menus, tabs) |
| Enter | 400ms (page, modal) |

### 2.4 Elevation & z-index

| Level | Recipe | Use |
|---|---|---|
| 0 | none | Page |
| 1 | Glass card (§4.2) | Widgets |
| 2 | `--surface-2` + `--line-2` + `shadow-[0_16px_40px_-12px_rgba(0,0,0,.7)]` | Dropdowns, popovers |
| 3 | Glass card + `shadow-[0_32px_80px_-16px_rgba(0,0,0,.8)]` over scrim | Modals |

z-index: background 0 · content 10 · sticky nav 30 · dropdown 40 · modal 50 · toast 60.

---

## 3. Atmosphere (page background)

Four layers, bottom to top. Put once in the root layout. All decorative, `aria-hidden`, `pointer-events-none`.

```tsx
<div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
  {/* 1. Aurora */}
  <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-violet-600/[0.12] blur-[100px] md:h-[820px] md:w-[820px] md:blur-[130px]" />
  <div className="absolute -bottom-40 left-[-10%] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.11] blur-[100px] md:h-[820px] md:w-[820px] md:blur-[130px]" />
  {/* 2. Fine grid, fading out from the top */}
  <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_30%,transparent_100%)]" />
  {/* 3. Vignette */}
  <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(9,9,11,.85)_100%)]" />
  {/* 4. Film grain (adds richness, kills banding) */}
  <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
</div>
```
Content wrappers are `relative z-10`. Blobs are smaller on mobile for scroll performance.

---

## 4. Surfaces

### 4.1 Reusable classes (add to `globals.css`)

```css
@layer components {
  /* GLASS: the signature surface */
  .glass {
    position: relative;
    border-radius: 1rem;
    background: var(--glass-fill);
    box-shadow:
      inset 0 1px 0 0 var(--highlight),          /* top-edge light */
      0 0 0 1px rgba(255,255,255,.07),           /* hairline edge */
      0 24px 48px -16px rgba(0,0,0,.65);         /* depth */
    -webkit-backdrop-filter: blur(20px) saturate(140%);
            backdrop-filter: blur(20px) saturate(140%);
  }
  @supports not (backdrop-filter: blur(1px)) { .glass { background: rgb(24 24 27 / .92); } }

  /* GRADIENT BORDER: for hero / selected / premium cards */
  .glass-edge::before {
    content: ""; position: absolute; inset: 0; padding: 1px; border-radius: inherit; pointer-events: none;
    background: linear-gradient(160deg, rgba(34,211,238,.55), rgba(255,255,255,.08) 35%, rgba(139,92,246,.35));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }

  /* SPOTLIGHT: soft light follows the cursor (set --mx/--my with the hook in §4.3) */
  .spotlight::after {
    content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
    background: radial-gradient(360px circle at var(--mx,50%) var(--my,0%), rgba(34,211,238,.10), transparent 60%);
    transition: opacity .3s var(--ease-out);
  }
  .spotlight:hover::after { opacity: 1; }

  /* SOLID PANEL: dense data, dropdowns, tooltips */
  .panel { background: var(--surface-2); border-radius: .75rem; box-shadow: 0 0 0 1px var(--line-2), 0 16px 40px -12px rgba(0,0,0,.7); }

  /* SHIMMER: skeleton loading */
  .shimmer { background: linear-gradient(100deg, rgba(255,255,255,.04) 30%, rgba(255,255,255,.10) 50%, rgba(255,255,255,.04) 70%); background-size: 200% 100%; animation: shimmer 1.6s linear infinite; }
  @keyframes shimmer { to { background-position: -200% 0; } }
}
```

### 4.2 Glass card

```tsx
<section className="glass spotlight p-5 md:p-6">…</section>          {/* standard */}
<section className="glass glass-edge spotlight p-6 md:p-8">…</section> {/* featured / selected */}
```

**Rules**
- **No glass inside glass.** Inner tiles: `rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]`, no blur.
- **Blur budget:** ≤ 4 blurred surfaces on screen. Long lists, tables, tooltips and menus use `.panel`.
- Text on glass: only `--text-1`, `--text-2` and `-400` semantic shades.

### 4.3 Spotlight hook

```tsx
export function useSpotlight<T extends HTMLElement>() {
  return {
    onMouseMove: (e: React.MouseEvent<T>) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
  };
}
// <section className="glass spotlight" {...useSpotlight()}>
```
Skipped automatically on touch (no hover). Effect is purely decorative.

---

## 5. Components

Every interactive component defines **rest, hover, focus-visible, active, disabled**, plus **loading/error** where relevant.

**Global focus ring**
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]
```

### 5.1 Buttons

**Primary: lit-from-within cyan.** Dark text for contrast (white on cyan-500 is only ~2.4:1).
```tsx
className="relative inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-zinc-950
  bg-gradient-to-b from-cyan-300 to-cyan-500
  shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_0_0_1px_rgba(34,211,238,.5),0_10px_30px_-8px_rgba(6,182,212,.6)]
  transition-all duration-150 hover:from-cyan-200 hover:to-cyan-400 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_0_0_1px_rgba(103,232,249,.7),0_14px_40px_-8px_rgba(6,182,212,.75)]
  active:translate-y-px active:from-cyan-400 active:to-cyan-600
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]
  disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
```

**Secondary: glass pill**
```tsx
className="group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-[--text-2]
  bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_0_0_1px_rgba(255,255,255,.10)]
  transition-all duration-150 hover:text-white hover:bg-cyan-500/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(34,211,238,.35),0_0_24px_-6px_rgba(34,211,238,.35)]
  active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
/* arrow icon: transition-transform group-hover:translate-x-1 */
```

**Ghost (toolbar / icon):** `h-9 rounded-md px-3 text-[--text-2] hover:bg-white/[0.06] hover:text-white`
**Destructive:** `bg-red-500/10 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/20 hover:text-red-300`
**Buy / Sell (trading):** Buy `bg-green-500 text-zinc-950 hover:bg-green-400`; Sell `bg-red-500 text-white hover:bg-red-400`. Both get the same lit shadow recipe in their own color.

Rules: one primary per section · 44px touch height · icon-only needs `aria-label` · loading = spinner replaces label, width locked, `aria-busy`.

### 5.2 Inputs

```tsx
className="h-11 w-full rounded-md bg-white/[0.04] px-3 text-sm text-[--text-1] placeholder:text-[--text-3]
  shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.10)]  /* recessed, like cut into glass */
  outline-none transition-all duration-150
  hover:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.18)]
  focus:bg-white/[0.06] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(34,211,238,.9),0_0_0_4px_rgba(34,211,238,.15)]
  aria-[invalid=true]:shadow-[0_0_0_1px_rgba(239,68,68,.9),0_0_0_4px_rgba(239,68,68,.15)]
  disabled:cursor-not-allowed disabled:opacity-50"
```
- Always a visible label (micro-label style). Error: `text-xs text-red-400` + icon, tied by `aria-describedby`.
- **Amount inputs:** `font-mono tabular-nums text-right`, with a trailing unit chip (e.g. `USD`) and `MAX` ghost button.
- **Search / command:** leading icon, trailing `<kbd>⌘K</kbd>`.

**Kbd:** `rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-[--text-2] ring-1 ring-white/10`

### 5.3 Select, tabs, segmented control, switch

- **Select / dropdown menu:** `.panel` with `p-1`; items `rounded-md px-2.5 py-2 text-sm`, hover `bg-white/[0.06]`, selected shows cyan check + `text-white`. Open with scale-from-95% + fade (150ms).
- **Tabs (underline):** inactive `text-[--text-2]`, active `text-white` with a 2px `cyan-400` indicator that **slides** between tabs (`framer-motion layoutId`) plus a soft glow `shadow-[0_0_12px_rgba(34,211,238,.6)]`.
- **Segmented control (Buy/Sell, 1D/1W/1M):** container `rounded-full bg-white/[0.04] p-1 ring-1 ring-white/10`; active thumb `rounded-full bg-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,.1)]` sliding with `layoutId`.
- **Switch:** track `h-6 w-11 rounded-full bg-white/10`; on = `bg-cyan-500` with glow; thumb white, 200ms spring.
- **Checkbox / radio:** 18px, `rounded` / `rounded-full`, checked fill `cyan-500` with dark check mark.

### 5.4 Stat tile (the hero component)

```tsx
<div className="glass spotlight p-5">
  <div className="flex items-center justify-between">
    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Portfolio value</span>
    <Badge tone="success">▲ 2.41%</Badge>
  </div>
  <div className="mt-3 font-mono text-3xl font-bold tabular-nums tracking-tight md:text-4xl">
    $64,218<span className="text-[--text-2]">.42</span>
  </div>
  <Sparkline className="mt-4 h-10 w-full" />   {/* 1.5px cyan line + gradient fill fading to 0 */}
</div>
```
- Delta always shows sign **and** arrow.
- On live update, the value row flashes `bg-green-500/10` or `bg-red-500/10` for 400ms and fades; the number never moves position.

### 5.5 Tables & lists

- Wrapper `.panel overflow-x-auto`. Sticky header with `backdrop-blur` micro-label cells.
- Rows 48px, `border-b border-[--line-1]`, hover `bg-white/[0.035]` with a 2px cyan left indicator fading in.
- Numeric columns right-aligned, mono, tabular. P&L cells: color **+** sign/arrow.
- Selected row: `bg-cyan-500/[0.07]` + cyan left bar.
- Empty state: centered 40px glass icon tile, one-line message, one ghost pill action.

### 5.6 Badges & chips

```
base:    inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ring-1
success: bg-green-500/10 text-green-400 ring-green-500/25
error:   bg-red-500/10   text-red-400   ring-red-500/25
warning: bg-amber-500/10 text-amber-400 ring-amber-500/25
info:    bg-cyan-500/10  text-cyan-400  ring-cyan-500/25
neutral: bg-white/[0.05] text-[--text-2] ring-white/10
```
Leading dot (`h-1.5 w-1.5 rounded-full`) or icon. A **live** dot gets `animate-pulse` (the only permitted looping animation) and is disabled under reduced motion.

### 5.7 Navigation

- **Sidebar:** `--surface-1` with a right hairline `--line-1`, or glass with edge. Item rest `text-[--text-2]`, hover `bg-white/[0.05] text-white`, **active** `bg-cyan-500/10 text-cyan-300` + 2px cyan left bar with glow + `aria-current="page"`.
- **Top bar:** glass, `sticky top-0`, bottom hairline that brightens on scroll.
- **Command palette (⌘K):** centered `.panel` modal, input on top, grouped results, `kbd` hints, arrow-key navigation.

### 5.8 Modals, drawers, toasts, tooltips

- **Modal:** glass + edge card over `bg-black/60 backdrop-blur-sm` scrim. Enter: fade + scale 0.96→1 + y 8→0 (Enter token). Trap focus, `Esc` closes, restore focus, lock scroll.
- **Drawer (mobile sheets):** slides from bottom, `rounded-t-3xl`, drag handle.
- **Toast:** `.panel`, 3px semantic left accent, icon, title + one line; success auto-dismisses at 5s, errors persist. `role="status"` / `role="alert"`.
- **Tooltip:** `.panel`, `text-xs`, 150ms delay, mono for values.

### 5.9 Progress, loaders, skeletons

- **Progress bar:** 6px `rounded-full bg-white/[0.06]`; fill `bg-gradient-to-r from-cyan-500 to-blue-600` with `shadow-[0_0_12px_rgba(34,211,238,.5)]`.
- **Skeletons:** `.shimmer rounded-md`, matching final layout. No spinners for page content.
- **Spinner:** 16-20px, 2px cyan arc, only inside buttons/short actions.

### 5.10 Charts

- Line: 1.5-2px `cyan-400`, area gradient `rgba(34,211,238,.25) → 0`. Secondary series violet-400, then zinc-400. Green/red reserved for P&L.
- Gridlines `rgba(255,255,255,.05)` dashed; axes mono 11px `--text-2`.
- Crosshair: 1px `white/20` dashed + a dot with cyan glow ring.
- Tooltip: `.panel`, mono values, semantic colored delta.
- Provide a table or text summary for screen readers.

### 5.11 Avatars, icons, dividers

- Icons: Lucide, 1.5px stroke, 16/20px; color inherits (`--text-2` → white on hover).
- Avatar: `rounded-full ring-1 ring-white/15`; fallback initials in mono on `bg-gradient-to-br from-cyan-500/30 to-violet-500/30`.
- Divider: `1px --line-1`; section divider may use `bg-gradient-to-r from-transparent via-white/10 to-transparent`.

---

## 6. Motion

- **Mount:** `initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, ease: [.22,1,.36,1] }}`. Stagger lists 40-60ms per item (cap total ~400ms), once only.
- **Hover:** `transition-all duration-150`; things brighten (text → white/cyan, edges → cyan glow). Arrows `group-hover:translate-x-1`.
- **Press:** `active:scale-[0.98]` or `translate-y-px`.
- **Numbers:** tick flash (§5.4); optional count-up on first load (≤ 800ms).
- Animate only `opacity` and `transform`; never animate blur or layout on large surfaces.
- **Reduced motion is required:**
  ```tsx
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
  ```
  ```css
  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after { animation-duration:.01ms !important; transition-duration:.01ms !important; }
    .spotlight::after { display:none; }
  }
  ```

---

## 7. Accessibility

- Contrast: body ≥ 4.5:1, large text/UI edges ≥ 3:1. `--text-3` only for large or non-essential text.
- Visible focus on everything (global ring). Never `outline-none` without a replacement.
- Color is never the only signal: P&L, status and errors carry sign, icon or text.
- Native elements first (`button`, `a`, `label`, `table`); one H1 per page; modals trap focus.
- Touch targets ≥ 40px (44px on mobile).
- Decorative layers (aurora, grid, grain, spotlight) are `aria-hidden`. Live price ticks aren't announced individually.

---

## 8. Responsive

- Mobile first: `sm 640 · md 768 · lg 1024 · xl 1280`. Content `max-w-7xl px-4 sm:px-6 lg:px-8`.
- Dashboards: 1 col → 2 (`md`) → 3-4 (`lg`).
- Tables scroll inside their container with a sticky first column.
- On mobile: smaller blobs, grain and spotlight off, bottom sheets instead of centered modals.

---

## 9. Voice & Content

Precise, calm, confident. No hype or exclamation marks near money. Sentence-case copy (uppercase via CSS only). Numbers: separators, fixed decimals per instrument, explicit `+/−` on deltas, currency on every amount. Errors say what happened and what to do next.

---

## 10. Do / Don't

| Do | Don't |
|---|---|
| Separate surfaces with light + shadow | Stack heavy borders |
| One glow, one focal point per view | Glow everything |
| Glass for floating containers | Glass for tables, menus, tooltips |
| Mono `tabular-nums` for all figures | Proportional digits that jitter |
| Pair green/red with sign or arrow | Color alone |
| Dark text on cyan fills | White text on cyan-500 |
| `-400` text shades on dark | `-600` text on dark |
| Respect reduced motion | Looping decorative animation |

---

## 11. Review Checklist

- [ ] Tokens only (no stray hex or `gray-*`)
- [ ] Glass vs `.panel` used correctly; blur budget respected
- [ ] All states present: rest, hover, focus-visible, active, disabled, loading, error
- [ ] Figures are mono, tabular, right-aligned; decimals muted
- [ ] P&L has sign/arrow
- [ ] Primary buttons dark-on-cyan; one per section
- [ ] No text under 11px; `--text-3` used only where allowed
- [ ] Keyboard pass OK; modals trap/restore focus
- [ ] Reduced-motion OK; only opacity/transform animated
- [ ] Verified at 360 / 768 / 1280px
- [ ] Loading, empty and error states designed

---

## 12. Changelog

**v3.0 "Obsidian Glass"**
- New visual language: inner top-edge highlights, hairline ring edges, layered shadows, gradient borders, cursor spotlight.
- Four-layer atmosphere: aurora, fading grid, vignette, film grain.
- Lit-from-within primary button, recessed inputs with soft focus halos, glass pills.
- New components: segmented control, sliding tabs, switch, command palette, tooltips, progress, sparkline stat tiles, avatars, kbd.
- Reusable CSS classes (`.glass`, `.glass-edge`, `.spotlight`, `.panel`, `.shimmer`) so the look is applied the same everywhere.
- Signature number treatment (muted decimals, tick flash) and gradient headline text.

**v2.0**
- Unified brand on cyan; zinc-based text tokens; AA fixes (button text, muted text, 11px floor); focus rings; token scales; accessibility, responsive and checklist sections.

**v1.0**
- Initial dark glass system.