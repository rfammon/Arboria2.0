# UI/UX Phase 2 Specification: Surface & EmptyState

This document outlines the technical specification for the Phase 2 UI/UX components: `<Surface />` and `<EmptyState />`. These components are designed to unify the application's visual language, specifically targeting glassmorphism implementation and consistent empty state feedback.

## 1. Surface Component

The `Surface` component acts as the fundamental building block for layout containers, cards, and panels. It abstracts away the complexity of glassmorphism classes, borders, and interaction states into a single, cohesive API.

### Interface

```typescript
import { HTMLAttributes, ElementType } from "react";

export type SurfaceVariant =
  | "card"          // Default opaque card (bg-card)
  | "glass-subtle"  // Low opacity/blur (toasts, overlays)
  | "glass-default" // Medium opacity/blur (standard cards)
  | "glass-heavy"   // High opacity/blur (modals, emphasis)
  | "flat";         // No background, just layout/border if needed

export type SurfaceElevation = "none" | "sm" | "md" | "lg";

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  /**
   * The visual style of the surface.
   * @default "card"
   */
  variant?: SurfaceVariant;

  /**
   * Shadow depth of the surface.
   * @default "sm"
   */
  elevation?: SurfaceElevation;

  /**
   * Whether the surface reacts to hover/active states.
   * Applies the `.interactive-hover` utility class.
   * @default false
   */
  interactive?: boolean;

  /**
   * Polymorphic prop to render as a specific HTML element.
   * @default "div"
   */
  as?: ElementType;
}
```

### Implementation Details

The component should use the `cn` utility to merge classes.

- **Base Classes:** `rounded-lg border transition-all`
- **Variant Mapping:**
  - `card`: `bg-card text-card-foreground`
  - `glass-subtle`: `glass-subtle` (defined in `index.css`)
  - `glass-default`: `glass-default` (defined in `index.css`)
  - `glass-heavy`: `glass-heavy` (defined in `index.css`)
  - `flat`: `bg-transparent border-none shadow-none`
- **Elevation Mapping:**
  - `none`: `shadow-none`
  - `sm`: `shadow-sm`
  - `md`: `shadow-md`
  - `lg`: `shadow-lg`
- **Interactive:**
  - If `true`, append `interactive-hover`.

### Usage Examples

```tsx
// Standard Card
<Surface>
  <p>Basic content</p>
</Surface>

// Glass Panel
<Surface variant="glass-default" elevation="md">
  <h2>Glass Content</h2>
</Surface>

// Interactive Article
<Surface 
  as="article" 
  interactive 
  onClick={() => console.log('clicked')}
>
  <h3>Clickable Item</h3>
</Surface>
```

---

## 2. EmptyState Component

The `EmptyState` component provides a consistent feedback pattern when a list or resource is empty. It centers content and aligns typography with the design system.

### Interface

```typescript
import { ReactNode, ElementType } from "react";
import { LucideIcon } from "lucide-react"; // Or relevant icon type

export interface EmptyStateProps {
  /**
   * The icon to display at the top.
   */
  icon: LucideIcon | ElementType;

  /**
   * Primary heading text.
   */
  title: string;

  /**
   * Secondary description text.
   */
  description: string;

  /**
   * Optional action button or link.
   */
  action?: ReactNode;

  /**
   * Custom class name for the container.
   */
  className?: string;
}
```

### Implementation Details

- **Container:** Flex column, centered items, text center. Recommended padding: `py-12 px-4`.
- **Icon:**
  - Wrapper: `bg-muted/20 p-4 rounded-full mb-4 ring-1 ring-border` (optional decoration).
  - Size: `h-10 w-10 text-muted-foreground` (adjust based on design preference, typically 40px-48px).
- **Typography:**
  - Title: `h3` (or `text-lg font-semibold`), `mb-2`.
  - Description: `text-muted-foreground max-w-sm mx-auto text-sm`.
- **Action:**
  - Rendered conditionally in a `div` with `mt-6`.

### Usage Examples

```tsx
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Basic
<EmptyState
  icon={ClipboardList}
  title="No tasks found"
  description="You haven't created any tasks yet. Start by adding a new one."
/>

// With Action
<EmptyState
  icon={ClipboardList}
  title="No projects"
  description="Get started by creating your first project."
  action={
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Create Project
    </Button>
  }
/>
```

## Next Steps for Implementation

1.  Create `apps/arboria-v3/src/components/ui/surface.tsx`.
2.  Create `apps/arboria-v3/src/components/ui/empty-state.tsx`.
3.  Export components via `apps/arboria-v3/src/components/ui/index.ts` (if exists) or barrel file.
