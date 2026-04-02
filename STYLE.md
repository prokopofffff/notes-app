# Notes App — Design System & UI Specifications

## Design Principles

- **Minimalist & clean** — no decorative elements, focus on content
- **Gray-white palette** — white backgrounds, gray borders and text, subtle shadows
- **System font stack** — native feel on all platforms
- **Centered layout** — max-width 720px container, responsive down to mobile

---

## Tokens

### Colors

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#ffffff` | Page background |
| `--color-surface` | `#ffffff` | Card / panel background |
| `--color-border` | `#e2e2e2` | Input borders, card borders, dividers |
| `--color-border-focus` | `#9ca3af` | Focused input border |
| `--color-text-primary` | `#111827` | Headings, body copy |
| `--color-text-secondary` | `#6b7280` | Timestamps, meta, placeholder |
| `--color-text-disabled` | `#9ca3af` | Disabled state text |
| `--color-btn-primary-bg` | `#111827` | Primary button background |
| `--color-btn-primary-text` | `#ffffff` | Primary button text |
| `--color-btn-primary-hover` | `#374151` | Primary button hover |
| `--color-btn-ghost-text` | `#6b7280` | Ghost/text button text |
| `--color-btn-ghost-hover-bg` | `#f3f4f6` | Ghost button hover background |
| `--color-danger` | `#dc2626` | Error messages, destructive actions |
| `--color-danger-bg` | `#fef2f2` | Error banner background |
| `--color-shadow` | `rgba(0,0,0,0.06)` | Card shadow |

### Typography

```
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             Helvetica, Arial, sans-serif, "Apple Color Emoji";
```

| Role | Size | Weight | Line-height | Color |
|---|---|---|---|---|
| App title | 18px | 600 | 1.2 | `--color-text-primary` |
| Screen heading | 24px | 600 | 1.3 | `--color-text-primary` |
| Note title | 15px | 600 | 1.4 | `--color-text-primary` |
| Body / label | 14px | 400 | 1.5 | `--color-text-primary` |
| Meta / timestamp | 12px | 400 | 1.4 | `--color-text-secondary` |
| Button | 14px | 500 | 1 | — |
| Error text | 13px | 400 | 1.5 | `--color-danger` |
| Input placeholder | 14px | 400 | — | `--color-text-secondary` |

### Spacing Scale

| Name | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Inputs, small buttons |
| `--radius-md` | 8px | Cards, modals |
| `--radius-full` | 9999px | Pill badges |

### Shadows

```
--shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
--shadow-modal: 0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
```

---

## Components

### Input Field

```
height: 40px
padding: 0 12px
border: 1px solid var(--color-border)
border-radius: var(--radius-sm)
background: #ffffff
font-size: 14px
color: var(--color-text-primary)
width: 100%
box-sizing: border-box
transition: border-color 150ms ease

:focus
  border-color: var(--color-border-focus)
  outline: 2px solid rgba(156,163,175,0.25)
  outline-offset: 0

:disabled
  background: #f9fafb
  color: var(--color-text-disabled)
  cursor: not-allowed

::placeholder
  color: var(--color-text-secondary)
```

**Label** sits above the input, 12px gap between label and input.
Label: 14px / 500 weight / `--color-text-primary`.

### Textarea

Same as Input Field but:
```
min-height: 200px
padding: 12px
resize: vertical
```

### Primary Button

```
height: 40px
padding: 0 20px
border: none
border-radius: var(--radius-sm)
background: var(--color-btn-primary-bg)
color: var(--color-btn-primary-text)
font-size: 14px / weight 500
cursor: pointer
transition: background 150ms ease

:hover  → background: var(--color-btn-primary-hover)
:active → opacity: 0.9
:disabled → background: #d1d5db; cursor: not-allowed
```

### Ghost Button

```
height: 36px
padding: 0 12px
border: none
border-radius: var(--radius-sm)
background: transparent
color: var(--color-btn-ghost-text)
font-size: 14px / weight 400
cursor: pointer

:hover → background: var(--color-btn-ghost-hover-bg)
```

### Danger Ghost Button

Same as Ghost Button but color: `--color-danger`.

### Error Banner

```
padding: 10px 12px
border-radius: var(--radius-sm)
background: var(--color-danger-bg)
border: 1px solid #fecaca
color: var(--color-danger)
font-size: 13px
width: 100%
```

---

## Screen 1 — Login

### Layout

```
Full viewport height
display: flex
align-items: center
justify-content: center
background: var(--color-bg)
padding: 16px
```

### Login Card

```
width: 100%
max-width: 360px
background: var(--color-surface)
border: 1px solid var(--color-border)
border-radius: var(--radius-md)
box-shadow: var(--shadow-card)
padding: 32px
```

### Card Anatomy (top → bottom)

```
[App title]               18px / 600 / centered / margin-bottom: 24px
[Screen heading]          "Sign in to your account"
                          24px / 600 / centered / margin-bottom: 24px
[Error banner]            hidden by default; visible on auth failure
                          margin-bottom: 16px
[Label "Username"]
[Username input]          margin-bottom: 16px
[Label "Password"]
[Password input]          type="password" / margin-bottom: 24px
[Sign In button]          width: 100%; primary style
```

### States

| State | Description |
|---|---|
| Default | Empty form, no error banner |
| Typing | Input has focus ring |
| Loading | Button shows "Signing in…" text; button disabled; inputs disabled |
| Error | Error banner appears: "Invalid username or password." Form re-enabled |

### Responsive

- Card is already narrow (360px max). On screens < 360px: remove card border + shadow, padding reduces to 24px.

---

## Screen 2 — Notes List

### Page Layout

```
background: var(--color-bg)
min-height: 100vh
```

**Outer wrapper:**
```
max-width: 720px
margin: 0 auto
padding: 0 16px
```

### Header

```
height: 56px
display: flex
align-items: center
justify-content: space-between
border-bottom: 1px solid var(--color-border)
```

Left side:
- App title — 18px / 600 / `--color-text-primary`

Right side (flex row, gap: 12px, align: center):
- User display name — 14px / 400 / `--color-text-secondary`
- "Log out" ghost button

### Toolbar

```
padding: 20px 0 16px
display: flex
justify-content: flex-end
```

- "New Note" primary button

### Notes List

```
display: flex
flex-direction: column
gap: 1px                ← creates hairline divider between cards using gap + background on wrapper
```

**Note Card:**

```
background: var(--color-surface)
border: 1px solid var(--color-border)
border-radius: var(--radius-md)
padding: 16px
display: flex
flex-direction: column
gap: 6px
cursor: pointer
transition: box-shadow 120ms ease

:hover → box-shadow: var(--shadow-card)
```

Card anatomy (top → bottom):

```
[Row: Note title (flex-1)  |  Date (right-aligned, 12px / secondary)]
[Body preview]              14px / 400 / secondary / 2-line clamp
[Row: spacer | Edit button | Delete button]   (margin-top: 8px)
```

- Note title: 15px / 600 / primary, single-line overflow: ellipsis
- Body preview: 14px / 400 / `--color-text-secondary`, `-webkit-line-clamp: 2`
- Date: `MMM D, YYYY` format, 12px / secondary
- Edit: ghost button with pencil icon (or text "Edit")
- Delete: danger ghost button with trash icon (or text "Delete")

### Empty State

Shown when user has no notes.

```
padding: 64px 16px
text-align: center
color: var(--color-text-secondary)
```

```
[Icon placeholder]       Optional: simple document outline SVG, 48×48, stroke #d1d5db
[Heading]                "No notes yet"  — 16px / 600 / primary / margin-top: 16px
[Subtext]                "Create your first note to get started."
                          14px / 400 / secondary / margin-top: 6px
[New Note button]        primary / margin-top: 20px
```

### Loading State

Show 3 skeleton note cards:
```
background: #f3f4f6
border-radius: var(--radius-md)
height: 88px
animation: shimmer 1.4s ease infinite
```

### Responsive

- Single column at all widths (already column layout)
- On mobile (< 480px): card padding reduces to 12px; action buttons become icon-only

---

## Screen 3 — Note Editor (Modal)

The editor appears as a centered modal overlay over the Notes List screen.

### Overlay

```
position: fixed
inset: 0
background: rgba(0,0,0,0.30)
display: flex
align-items: center
justify-content: center
padding: 16px
z-index: 100
```

### Modal Panel

```
background: var(--color-surface)
border-radius: var(--radius-md)
box-shadow: var(--shadow-modal)
width: 100%
max-width: 560px
padding: 24px
display: flex
flex-direction: column
gap: 16px
```

### Modal Anatomy (top → bottom)

```
[Modal header row]
  ├─ Heading text (flex-1)  "New Note" / "Edit Note"  — 18px / 600 / primary
  └─ Close (×) ghost button  — 20px × 20px hit target min 36px

[Label "Title"]
[Title input]               single line

[Label "Body"]
[Body textarea]             min-height: 200px; resize: vertical

[Footer row]                justify-content: flex-end; gap: 8px; margin-top: 8px
  ├─ Cancel  ghost button
  └─ Save    primary button
```

### States

| State | Description |
|---|---|
| New note | Heading: "New Note"; fields empty |
| Edit note | Heading: "Edit Note"; fields pre-filled |
| Saving | Save button: "Saving…" + disabled; Cancel disabled |
| Error | Error banner appears above footer: "Failed to save. Please try again." |
| Validation | If title is empty and Save clicked: title input shows red border + inline message "Title is required" (13px / danger) |

### Keyboard & Accessibility

- Focus trap inside modal when open
- Escape key closes modal (triggers Cancel)
- First focusable element (Title input) receives focus on open
- Overlay click closes modal

### Responsive

- On mobile (< 480px): modal fills full screen height, border-radius only on top corners (8px 8px 0 0), anchored to bottom (align-items: flex-end on overlay)

---

## Interaction Summary

| Action | Trigger | Result |
|---|---|---|
| Sign in | Click "Sign In" | Loading state → success → redirect to Notes List |
| Sign in fail | Bad credentials | Error banner on login card |
| Log out | Click "Log out" | Redirect to Login screen |
| New note | Click "New Note" | Note Editor modal opens (new mode) |
| Edit note | Click "Edit" on a card | Note Editor modal opens (edit mode, pre-filled) |
| Delete note | Click "Delete" on a card | Immediate deletion; list refreshes |
| Save note | Click "Save" in modal | Saving state → close modal → list refreshes |
| Cancel | Click "Cancel" or Escape | Modal closes, no change |

---

## Accessibility Notes

- All interactive elements have minimum 36px touch target height
- Color contrast: `#111827` on `#ffffff` = 16.75:1 (AAA); `#6b7280` on `#ffffff` = 4.63:1 (AA)
- All inputs have associated `<label>` elements
- Buttons have descriptive text or `aria-label`
- Error states announced via `aria-live="polite"` region
