# Notes App — Design System

## Palette

| Token        | Hex       | Usage                              |
|--------------|-----------|------------------------------------|
| background   | `#f5f5f5` | Page background                    |
| surface      | `#ffffff` | Cards, inputs, top bars            |
| border       | `#e0e0e0` | Borders, dividers, skeleton        |
| placeholder  | `#9e9e9e` | Placeholder text, secondary labels |
| body         | `#424242` | Primary body text                  |
| heading      | `#333333` | Headings, accent buttons           |
| accent       | `#333333` | CTA / primary button bg            |
| accent-text  | `#ffffff` | Text on accent buttons             |
| danger       | `#c62828` | Destructive actions                |
| danger-soft  | `#ffebee` | Danger hover background            |

## Typography

Font: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

| Scale | Size  | Weight | Usage                         |
|-------|-------|--------|-------------------------------|
| xl    | 28px  | 600    | Note editor title             |
| lg    | 22px  | 600    | Mobile editor title           |
| md    | 17px  | 600    | Screen titles, note headings  |
| base  | 15px  | 400    | Body text, inputs             |
| sm    | 13px  | 400/500| Labels, button text, captions |
| xs    | 11px  | 400    | Dates, meta info              |

Line heights: headings 1.2 · body 1.7 · ui elements 1.4

## Spacing

`4 · 8 · 16 · 24 · 40 · 64 px` (xs · sm · md · lg · xl · 2xl)

## Shape & Shadow

Border radii: `4px (sm) · 8px (md) · 12px (lg) · 999px (pill)`

Shadows:
- **card** — `0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)`
- **modal** — `0 4px 16px rgba(0,0,0,.12)`

## Breakpoints

- Mobile: `< 640px`
- Tablet: `640px – 1024px`
- Desktop: `> 1024px`

---

## Component Specs

### Buttons

| Variant   | Background | Border           | Text     | Hover bg  |
|-----------|------------|------------------|----------|-----------|
| primary   | `#333333`  | none             | `#fff`   | `#424242` |
| secondary | `#ffffff`  | 1px `#e0e0e0`   | `#424242`| `#f5f5f5` |
| ghost     | transparent| none             | `#424242`| `#f5f5f5` |
| danger    | `#c62828`  | none             | `#fff`   | `#b71c1c` |

All buttons: `height 44px` (compact: `36px`), `border-radius 4px`, `font-size 15px/13px`, `font-weight 500`

States: hover, active (scale .99), loading (spinner), disabled (opacity .5)

### Text Inputs

Height: `44px` · Padding: `0 16px` · Background: `#f5f5f5` · Border: `1px solid #e0e0e0` · Radius: `4px`

States:
- **focus** — border `#333333`
- **error** — border `#c62828`
- **filled** — background `#ffffff`

### Cards

Background `#ffffff` · Radius `8px` · Shadow `card` · Padding `16px`
Hover state: shadow `0 4px 12px rgba(0,0,0,.10)`

### Toast

Background `#333333` · Color `#ffffff` · Radius `999px` · Shadow `modal`
Position: fixed bottom `24px` centered · Auto-dismiss after `2s`

### Modal

Overlay: `rgba(0,0,0,.30)` · Panel: white, radius `12px`, shadow `modal`, padding `24px`

---

## Screens Overview

| Screen       | File section               | Key interactions                        |
|--------------|----------------------------|-----------------------------------------|
| Login        | `SCREEN 1` in notes-app.pen| Username + password → "Войти"           |
| Notes List   | `SCREEN 2` in notes-app.pen| List, new, edit, delete with confirm    |
| Note Editor  | `SCREEN 3` in notes-app.pen| Title + content, save toast, back guard |

Full specs in `/design/notes-app.pen`.
