# UI/UX Phase 1 Implementation Specification

## Overview
This document specifies the technical implementation details for Phase 1 of the Arboria v3 UI/UX improvements.
**Focus:** Typography, Interactions, and Glassmorphism.

## 1. Adaptive Typography System
We will extend the existing `data-density` tokens to include semantic typography scales. This ensures headings and body text automatically adjust size between "Field" (Touch/Mobile) and "Office" (Desktop) modes.

### A. Update Density Tokens in `src/index.css`

Add the following variables to the existing `:root[data-density='...']` blocks.

```css
/* Update existing :root[data-density='field'] block */
:root[data-density='field'] {
  /* ... existing tokens ... */
  
  /* New Typography Tokens - Large/Touchable */
  --text-h1: 32px;
  --text-h2: 28px;
  --text-h3: 24px;
  --text-h4: 20px;
  --text-body: 18px;
  --text-caption: 14px;
  
  /* Interaction Scale */
  --scale-hover: 1.02;
  --scale-active: 0.98;
}

/* Update existing :root[data-density='office'] block */
:root[data-density='office'] {
  /* ... existing tokens ... */
  
  /* New Typography Tokens - Compact/Information Dense */
  --text-h1: 24px;
  --text-h2: 20px;
  --text-h3: 18px;
  --text-h4: 16px;
  --text-body: 14px;
  --text-caption: 12px;
  
  /* Interaction Scale - Subtler on desktop */
  --scale-hover: 1.01;
  --scale-active: 0.99;
}
```

### B. Implement Typography Layer in `src/index.css`

Add this inside `@layer base`:

```css
@layer base {
  /* ... existing ... */

  h1 {
    font-size: var(--text-h1);
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.2;
    @apply scroll-m-20;
  }

  h2 {
    font-size: var(--text-h2);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.3;
    @apply scroll-m-20;
  }

  h3 {
    font-size: var(--text-h3);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.4;
    @apply scroll-m-20;
  }

  h4 {
    font-size: var(--text-h4);
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.5;
    @apply scroll-m-20;
  }

  body, p {
    font-size: var(--text-body);
    line-height: 1.6;
  }

  small, .text-caption {
    font-size: var(--text-caption);
    line-height: 1.4;
  }
}
```

## 2. Standardized Interaction & Focus

Implement a consistent focus ring and interactive states for cards/buttons.

### Add to `@layer utilities` in `src/index.css`

```css
@layer utilities {
  /* Standard Focus Ring */
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-shadow duration-200;
  }

  /* Interactive Card / Element */
  /* Uses density-aware scale variables defined above */
  .interactive-hover {
    @apply cursor-pointer transition-all duration-300 ease-out;
  }
  
  .interactive-hover:hover {
    transform: scale(var(--scale-hover));
    @apply shadow-lg ring-1 ring-primary/20;
  }

  .interactive-hover:active {
    transform: scale(var(--scale-active));
    @apply shadow-sm opacity-90;
  }
}
```

## 3. Glassmorphism System

Define distinct levels of glass effects using Tailwind's opacity modifiers to ensure theme compatibility (works with all 7 themes).

### Add to `@layer utilities` in `src/index.css`

```css
@layer utilities {
  /* Level 1: Subtle (overlays, toasts) */
  .glass-subtle {
    @apply backdrop-blur-sm bg-background/40 border border-foreground/5 shadow-sm;
  }

  /* Level 2: Default (cards, sidebars) */
  .glass-default {
    @apply backdrop-blur-md bg-background/70 border border-foreground/10 shadow-md;
  }

  /* Level 3: Heavy (modals, emphasis) */
  .glass-heavy {
    @apply backdrop-blur-xl bg-background/90 border border-foreground/15 shadow-xl;
  }
  
  /* Gradient Glass (Optional Polish) */
  .glass-gradient {
    background: linear-gradient(
      135deg, 
      hsl(var(--background) / 0.7) 0%, 
      hsl(var(--background) / 0.4) 100%
    );
    @apply backdrop-blur-md border border-white/20;
  }
}
```

## 4. Implementation Checklist

1.  [ ] Copy density token updates to `:root[data-density='field']` and `:root[data-density='office']` in `src/index.css`.
2.  [ ] Add typography rules to `@layer base`.
3.  [ ] Add `.focus-ring`, `.interactive-hover`, and glass classes to `@layer utilities` (or components layer if preferred).
4.  [ ] Verify `tailwind.config.js` does not conflict (current config is standard).
5.  [ ] Test with `npm run dev` toggling between themes (e.g., `dark`, `forest`) to ensure `bg-background/xx` resolves correctly.

### Optional: Tailwind Config Integration

To use these sizes as utilities (e.g., `text-h1`) alongside the base styles, you can update `tailwind.config.js`:

```javascript
// apps/arboria-v3/tailwind.config.js
extend: {
  fontSize: {
    h1: ['var(--text-h1)', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
    h2: ['var(--text-h2)', { lineHeight: '1.3', letterSpacing: '-0.025em', fontWeight: '600' }],
    h3: ['var(--text-h3)', { lineHeight: '1.4', letterSpacing: '-0.025em', fontWeight: '600' }],
    h4: ['var(--text-h4)', { lineHeight: '1.5', letterSpacing: '-0.025em', fontWeight: '500' }],
    body: ['var(--text-body)', { lineHeight: '1.6' }],
    caption: ['var(--text-caption)', { lineHeight: '1.4' }],
  }
}
```
