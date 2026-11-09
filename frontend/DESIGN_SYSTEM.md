# FitNova design system

One source of truth: `src/styles/index.css` (CSS variables) and `tailwind.config.js` (same values for Tailwind classes). Change a value in both and every page follows.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#090D16` | page background |
| `--bg-2` | `#0B111A` | inputs, wells |
| `--surface` | `#0D141C` | cards, panels, modals |
| `--surface-2` | `#121B26` | hover / raised |
| `--line` / `--line-strong` | `#162230` / `#1E2D42` | chrome dividers / card + input borders |
| `--green` (+ `-light`, `-dark`, `-ink`) | `#2BAF34` | brand, primary actions |
| radii | 12px controls, 16px cards | |

## Rules for new pages
- Render inside the `.app-main` frame (MainLayout does this). **Do not** add page-level padding, max-width or background.
- Header: `.page-header` > `.page-title` + `.page-subtitle` (or `PageHeader` from `components/ui.jsx`).
- Cards: `.card`; buttons: `.btn-primary` / `.btn-ghost`; fields: `.input` + `.label`.
- Logo: `<BrandMark />`. Colours: use tokens / Tailwind theme names, not raw hex.
- The CSS-family pages (`dash-`, `photo-`, `prog-`, `bs-`, `goal-`, `cal-`) get header/card/button styling from the shared "page chrome" section of `index.css`.
