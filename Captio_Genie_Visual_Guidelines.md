# Captio Genie — Visual Guidelines
**Chrome Extension Popup UI · v1.0**

---

## Overview

Captio Genie is a Chrome extension that scrapes leads and search results from Google Maps. The popup UI should feel like a professional, minimal data tool — clean, focused, no clutter. The visual language is monochrome with careful use of weight and opacity, not color, to create hierarchy.

---

## Brand Assets

All assets live in the `icons/` folder:

| File | Use |
|------|-----|
| `icons/icon-16.svg` | Browser toolbar icon |
| `icons/icon-32.svg` | Windows taskbar |
| `icons/icon-48.svg` | Extensions management page |
| `icons/icon-128.svg` | Chrome Web Store listing |
| `icons/wordmark.svg` | Popup header logo |

Manifest icon paths:
```json
"icons": {
  "16":  "icons/icon-16.svg",
  "32":  "icons/icon-32.svg",
  "48":  "icons/icon-48.svg",
  "128": "icons/icon-128.svg"
}
```

---

## Typography

**Font:** Plus Jakarta Sans (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

| Role | Weight | Size | Letter-spacing |
|------|--------|------|----------------|
| App title | 800 | 16px | -0.02em |
| Section label | 700 | 10px | 0.15em + uppercase |
| Body / data | 400 | 13px | 0 |
| Secondary / meta | 500 | 11px | 0.04em |
| Tagline | 500 | 10px | 0.12em + uppercase |

---

## Color Palette

```css
:root {
  --ink:    #1A1A1A;   /* Primary text, icons, borders */
  --ink-2:  #3A3A3A;   /* Secondary text */
  --mid:    #888888;   /* Tertiary text, placeholders, labels */
  --rule:   #E0E0E0;   /* Dividers, borders */
  --paper:  #F7F6F4;   /* Page / popup background */
  --white:  #FFFFFF;   /* Card backgrounds */
  --danger: #CC3333;   /* Error states only */
  --ok:     #2A9D6A;   /* Success / active states only */
}
```

**Rule:** No gradients. No drop shadows heavier than `0 1px 4px rgba(0,0,0,.08)`. Color (danger/ok) is used only for status — never decoration.

---

## Spacing & Layout

The popup should be **380px wide** and between **480–560px tall** (fixed height, no scroll on main view; use internal scroll for result lists).

```css
/* Base unit: 4px */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
```

Use **16px horizontal padding** for the popup shell. Section gaps: **24px**.

---

## Border Radius

```css
--radius-sm:  6px;   /* Inputs, small chips */
--radius-md:  10px;  /* Buttons, cards */
--radius-lg:  14px;  /* Popup shell, modals */
```

---

## Components

### Header
- Height: 52px
- Left: `icons/wordmark.svg` (use as `<img>` or inline SVG), height 36px
- Right: settings icon (outline, 18px)
- Bottom border: `1px solid var(--rule)`
- Background: `var(--white)`

### Buttons

**Primary (action):**
```css
background: var(--ink);
color: var(--white);
font: 600 13px 'Plus Jakarta Sans';
padding: 10px 20px;
border-radius: var(--radius-md);
border: none;
letter-spacing: .02em;
```
Hover: `background: #3A3A3A`
Active: `background: #000`

**Secondary:**
```css
background: transparent;
color: var(--ink);
border: 1.5px solid var(--rule);
/* same padding/radius as primary */
```
Hover: `border-color: var(--ink-2)`

**Destructive:** same as secondary but `color: var(--danger); border-color: var(--danger)` on hover.

### Inputs
```css
background: var(--paper);
border: 1.5px solid var(--rule);
border-radius: var(--radius-sm);
padding: 8px 12px;
font: 400 13px 'Plus Jakarta Sans';
color: var(--ink);
outline: none;
```
Focus: `border-color: var(--ink)`

### Status / Badge chips
```css
display: inline-flex;
align-items: center;
gap: 5px;
padding: 3px 8px;
border-radius: 99px;
font: 600 10px 'Plus Jakarta Sans';
letter-spacing: .08em;
text-transform: uppercase;
```
- Idle: `background: #F0F0F0; color: var(--mid)`
- Running: `background: #EBEBEB; color: var(--ink)` + animated dot
- Done: `background: #E6F4EE; color: var(--ok)`
- Error: `background: #FDECEA; color: var(--danger)`

### Result list rows
```css
padding: 10px 16px;
border-bottom: 1px solid var(--rule);
font: 400 13px 'Plus Jakarta Sans';
color: var(--ink);
```
- Primary line: `font-weight: 600`
- Secondary line (address, phone): `font: 400 11px; color: var(--mid); margin-top: 2px`
- Hover: `background: var(--paper)`

### Section labels
```css
font: 700 10px 'Plus Jakarta Sans';
letter-spacing: .15em;
text-transform: uppercase;
color: var(--mid);
padding-bottom: 10px;
border-bottom: 1px solid var(--rule);
margin-bottom: 14px;
```

---

## Motion

Keep it subtle:
- Button hover/active: `transition: background 120ms ease`
- Row hover: `transition: background 80ms ease`
- Status dot pulse: `animation: pulse 1.4s ease-in-out infinite` (opacity 1 → 0.3 → 1)
- Avoid transform-based transitions in the popup — Chrome extension popups can stutter

---

## Do's & Don'ts

| ✅ Do | ❌ Don't |
|-------|----------|
| Use weight + opacity for hierarchy | Use color for decoration |
| Use `var(--paper)` for alternating rows | Add drop shadows to cards |
| Keep section labels ALL CAPS, spaced | Use Inter, Roboto, or system fonts |
| Use `1px solid var(--rule)` for dividers | Add gradient backgrounds |
| Use inline SVG for the wordmark in header | Use rounded-corner left-border accent containers |
| Use monospace for raw data (phone, URL) | Use emoji |

---

## Example Popup Shell Structure

```html
<div class="popup">               <!-- 380×520px, border-radius: 14px, overflow: hidden -->
  <header class="popup-header">   <!-- 52px, white bg, wordmark left, settings right -->
  </header>
  <div class="popup-body">        <!-- padding: 16px, background: var(--paper) -->
    <div class="section-label">Results</div>
    <div class="result-list">     <!-- internal scroll, max-height: ~360px -->
      <!-- rows -->
    </div>
  </div>
  <footer class="popup-footer">   <!-- 52px, white bg, border-top: rule, action buttons -->
  </footer>
</div>
```

---

*Generated from Captio Genie Brand Assets · April 2026*
