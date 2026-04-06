# Tailwind CSS v4 API Reference

Complete reference for Tailwind v4 CSS-first configuration and utilities.

## Theme Namespace Reference

### Color Variables

```css
@theme {
  /* Semantic colors */
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #0EA5E9;

  /* Neutral palette */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* Background & text */
  --color-bg: #FFFFFF;
  --color-text: #1A1A1A;
  --color-dark-bg: #0F0F0F;
  --color-dark-text: #FAFAFA;
}
```

**Generated utilities**:
- `bg-primary`, `bg-secondary`, `bg-success`, etc.
- `text-primary`, `text-secondary`, `text-success`, etc.
- `border-primary`, `border-secondary`, etc.
- `ring-primary`, `ring-secondary`, etc.

### Font Variables

```css
@theme {
  --font-family-heading: 'Inter', sans-serif;
  --font-family-body: 'Inter', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

**Generated utilities**:
- `font-heading`, `font-body`, `font-mono`
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`
- `font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`

### Spacing Variables

```css
@theme {
  --spacing-0: 0;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  --spacing-24: 6rem;
  --spacing-32: 8rem;
}
```

**Generated utilities**:
- `p-1`, `p-2`, `p-4`, `p-6`, `p-8` (padding)
- `m-1`, `m-2`, `m-4`, `m-6`, `m-8` (margin)
- `gap-1`, `gap-2`, `gap-4`, `gap-6`, `gap-8` (gap)
- `w-1`, `w-2`, `w-4`, `w-6`, `w-8` (width)
- `h-1`, `h-2`, `h-4`, `h-6`, `h-8` (height)

### Border Radius Variables

```css
@theme {
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;
}
```

**Generated utilities**:
- `rounded-none`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`

### Shadow Variables

```css
@theme {
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

**Generated utilities**:
- `shadow-none`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`

### Duration Variables

```css
@theme {
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}
```

**Generated utilities**:
- `duration-75`, `duration-100`, `duration-150`, `duration-200`, `duration-300`, `duration-500`, `duration-700`, `duration-1000`

### Z-Index Variables

```css
@theme {
  --z-index-auto: auto;
  --z-index-0: 0;
  --z-index-10: 10;
  --z-index-20: 20;
  --z-index-30: 30;
  --z-index-40: 40;
  --z-index-50: 50;
  --z-index-modal: 1000;
  --z-index-dropdown: 1100;
  --z-index-tooltip: 1200;
}
```

**Generated utilities**:
- `z-auto`, `z-0`, `z-10`, `z-20`, `z-30`, `z-40`, `z-50`, `z-modal`, `z-dropdown`, `z-tooltip`

### Breakpoint Variables

```css
@theme {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

**Usage in utilities**:
- `sm:text-lg` (applies at 640px and above)
- `md:grid-cols-2` (applies at 768px and above)
- `lg:flex` (applies at 1024px and above)

---

## Common Utility Classes

### Display & Layout

```
flex, inline-flex, block, inline-block, grid, inline-grid, hidden
flex-row, flex-col, flex-wrap, flex-nowrap
justify-start, justify-center, justify-end, justify-between, justify-around
items-start, items-center, items-end, items-stretch
gap-1, gap-2, gap-4, gap-6, gap-8
```

### Sizing

```
w-full, w-screen, w-auto, w-1/2, w-1/3, w-1/4
h-full, h-screen, h-auto
min-w-0, max-w-full, min-h-0, max-h-full
```

### Spacing

```
p-4, px-4, py-4, pt-4, pr-4, pb-4, pl-4
m-4, mx-4, my-4, mt-4, mr-4, mb-4, ml-4
space-x-4, space-y-4
```

### Typography

```
text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl
font-light, font-normal, font-medium, font-semibold, font-bold
leading-tight, leading-normal, leading-relaxed, leading-loose
tracking-tight, tracking-normal, tracking-wide
text-left, text-center, text-right, text-justify
uppercase, lowercase, capitalize, normal-case
```

### Colors

```
text-primary, text-secondary, text-success, text-error
bg-primary, bg-secondary, bg-success, bg-error
border-primary, border-secondary, border-success, border-error
```

### Borders

```
border, border-0, border-2, border-4, border-8
border-solid, border-dashed, border-dotted, border-double
rounded-none, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-full
```

### Shadows

```
shadow-none, shadow-sm, shadow-md, shadow-lg, shadow-xl
```

### Transitions & Animations

```
transition, transition-none, transition-all
duration-75, duration-100, duration-150, duration-200, duration-300, duration-500
ease-linear, ease-in, ease-out, ease-in-out
```

### Opacity

```
opacity-0, opacity-25, opacity-50, opacity-75, opacity-100
```

### Transforms

```
scale-50, scale-75, scale-100, scale-125, scale-150
rotate-0, rotate-45, rotate-90, rotate-180
translate-x-1, translate-y-1, translate-x-full, translate-y-full
skew-x-1, skew-y-1
```

### Positioning

```
static, fixed, absolute, relative, sticky
top-0, right-0, bottom-0, left-0, inset-0
z-0, z-10, z-20, z-30, z-40, z-50
```

### Overflow

```
overflow-auto, overflow-hidden, overflow-visible, overflow-scroll
overflow-x-auto, overflow-y-auto
```

### Cursor

```
cursor-auto, cursor-default, cursor-pointer, cursor-wait, cursor-text, cursor-move
```

---

## Dark Mode Utilities

Apply different styles in dark mode using `dark:` prefix:

```tsx
<div className="bg-white dark:bg-dark-bg text-black dark:text-white">
  Content
</div>
```

All utilities support dark mode:
- `dark:bg-primary`
- `dark:text-white`
- `dark:border-gray-700`
- `dark:shadow-lg`

---

## Responsive Utilities

Apply utilities at specific breakpoints:

```tsx
<div className="
  grid
  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
  gap-4 md:gap-6 lg:gap-8
  p-4 md:p-6 lg:p-8
">
  Content
</div>
```

Breakpoints:
- `sm:` (640px)
- `md:` (768px)
- `lg:` (1024px)
- `xl:` (1280px)
- `2xl:` (1536px)

---

## State Variants

Apply utilities on interaction states:

```tsx
<button className="
  bg-primary
  hover:bg-primary-dark
  focus:ring-2 focus:ring-primary
  active:scale-95
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Click me
</button>
```

Available states:
- `hover:` — Mouse over
- `focus:` — Keyboard focus
- `focus-visible:` — Visible focus (keyboard)
- `active:` — Pressed/clicked
- `disabled:` — Disabled state
- `group-hover:` — Parent hover
- `group-focus:` — Parent focus
- `first:` — First child
- `last:` — Last child
- `odd:` — Odd child
- `even:` — Even child
