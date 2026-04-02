# Notes App — Design System

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#ffffff` | Page background |
| `--color-surface` | `#f8f8f8` | Card/input backgrounds |
| `--color-border` | `#e0e0e0` | Borders, dividers |
| `--color-border-focus` | `#a0a0a0` | Focused input borders |
| `--color-text-primary` | `#1a1a1a` | Headings, body text |
| `--color-text-secondary` | `#6b6b6b` | Subtitles, labels, timestamps |
| `--color-text-placeholder` | `#b0b0b0` | Input placeholders |
| `--color-accent` | `#3d3d3d` | Primary buttons, active states |
| `--color-accent-hover` | `#2a2a2a` | Button hover state |
| `--color-danger` | `#cc3333` | Delete button, error states |
| `--color-danger-hover` | `#aa2222` | Delete button hover |

## Typography

- **Font family:** `Inter, system-ui, -apple-system, sans-serif`
- **Base size:** `16px`
- **Line height:** `1.5`

| Scale | Size | Weight | Usage |
|---|---|---|---|
| `--text-xl` | `28px` | `700` | App title (login) |
| `--text-lg` | `22px` | `600` | Page headings |
| `--text-md` | `16px` | `400` | Body, note content |
| `--text-sm` | `14px` | `400` | Labels, timestamps, previews |
| `--text-xs` | `12px` | `400` | Helper text, metadata |

## Spacing

| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-12` | `48px` |

## Borders & Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Buttons |
| `--radius-md` | `8px` | Cards, inputs |
| `--radius-lg` | `12px` | Modal containers |
| `--border-width` | `1px` | All borders |

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | Cards at rest |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.10)` | Cards on hover |
| `--shadow-input` | `0 0 0 2px rgba(61,61,61,0.12)` | Focused inputs |

## Components

### Button — Primary

- Background: `--color-accent`
- Text: `#ffffff`, `--text-sm`, weight `600`
- Padding: `--space-3` × `--space-6`
- Border radius: `--radius-sm`
- Hover: background `--color-accent-hover`, no transition delay
- Disabled: opacity `0.45`, cursor `not-allowed`

### Button — Danger

- Same dimensions as Primary
- Background: `--color-danger`
- Hover: `--color-danger-hover`

### Button — Ghost

- Background: transparent
- Border: `1px solid --color-border`
- Text: `--color-text-secondary`
- Hover: background `--color-surface`, border `--color-border-focus`

### Input / Textarea

- Background: `--color-bg`
- Border: `1px solid --color-border`
- Border radius: `--radius-md`
- Padding: `--space-3` × `--space-4`
- Font: `--text-md`, `--color-text-primary`
- Placeholder: `--color-text-placeholder`
- Focus: border `--color-border-focus`, box-shadow `--shadow-input`, outline none

### Card (Note)

- Background: `--color-bg`
- Border: `1px solid --color-border`
- Border radius: `--radius-md`
- Padding: `--space-4`
- Shadow: `--shadow-sm`
- Hover: shadow `--shadow-md`, border `--color-border-focus`
- Cursor: pointer

### Header Bar

- Background: `--color-bg`
- Border-bottom: `1px solid --color-border`
- Height: `56px`
- Padding: `0 --space-6`
- Display: flex, align-items center, justify-content space-between

## Responsive Breakpoints

| Name | Min-width | Max content width |
|---|---|---|
| Mobile | `0px` | `100%` (full bleed with `--space-4` padding) |
| Tablet | `640px` | `600px` centered |
| Desktop | `1024px` | `720px` centered |

## Interactive States

- **Hover:** cursor pointer, subtle border/shadow lift — no color fills on text
- **Focus:** keyboard-visible ring via box-shadow `--shadow-input`, no browser outline
- **Active (press):** `transform: scale(0.98)` on buttons
- **Loading:** spinner replaces button label, button disabled
- **Error:** red helper text below input, border `--color-danger`
