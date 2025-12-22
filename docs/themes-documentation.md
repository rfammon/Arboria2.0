# Theme System Documentation

## Overview
The Arboria application uses a flexible theme system based on CSS variables and Tailwind CSS. Themes are implemented using CSS classes applied to the root element, allowing for dynamic switching between different color schemes.

## Current Themes

### Built-in Themes
1. **Light** - Standard light theme
2. **Dark** - Standard dark theme
3. **Forest** - Green-themed variant
4. **Neon Dark** - Dark theme with purple/violet neon accents
5. **Gruvbox Soft Dark** - Warm, earthy dark theme based on the popular Gruvbox color scheme

## New Theme Details

### Neon Dark Theme
- **Color Palette**: Deep purple-tinged background with bright neon purple accents
- **Primary Color**: Vibrant neon purple with high saturation
- **Text Color**: Nearly white (95% lightness) for maximum readability
- **Style**: Modern, high-contrast, with glowing accent effects
- **Best For**: Users who prefer vibrant, futuristic UI aesthetics with excellent readability

### Gruvbox Soft Dark Theme
- **Color Palette**: Based on the popular Gruvbox color scheme with softer contrasts
- **Primary Color**: Gruvbox blue with optimized saturation for contrast
- **Text Color**: Light cream color (90% lightness) for enhanced readability
- **Style**: Warm, earthy tones with cozy, soft appearance
- **Best For**: Users who prefer warm, non-fatiguing dark themes with excellent accessibility

## Implementation Details

### CSS Variables Structure
Themes are implemented using HSL color values for better flexibility:
- `--background`: Main background color
- `--foreground`: Main text color
- `--primary` / `--primary-foreground`: Primary action colors
- `--secondary` / `--secondary-foreground`: Secondary UI elements
- `--muted` / `--muted-foreground`: Less prominent elements
- `--accent` / `--accent-foreground`: Accent elements
- `--destructive` / `--destructive-foreground`: Error/danger states
- `--border`, `--input`, `--ring`: UI element borders and inputs
- `--radius`: Border radius value

### Theme Switching
The theme switching mechanism:
1. Updates CSS classes on the root element
2. Persists the selected theme to localStorage
3. Integrates with system preference detection
4. Supports all Tailwind components through CSS variable inheritance

## Adding New Themes

To add a new theme:

1. Define CSS variables in `src/index.css` using the `:root.className` pattern
2. Add the theme name to the `Theme` type in `src/components/theme-provider.tsx`
3. Add the theme to the class removal list in the useEffect
4. Add the theme option to the mode toggle component
5. Update this documentation

## Usage

Themes can be switched programmatically using the `useTheme` hook:

```tsx
import { useTheme } from '@/components/theme-provider';

function Component() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('neon-dark')}>
      Apply Neon Dark Theme
    </button>
  );
}
```

## Design Considerations

### Color Accessibility
All themes follow WCAG accessibility guidelines for color contrast, ensuring text remains readable across all themes.

### Consistency
Themes maintain consistent spacing, typography, and component behavior while changing only color values.

### Performance
CSS variables allow for efficient theme switching without additional network requests or style recalculation overhead.