# Migration Checklist: Tailwind v3 to v4

Step-by-step checklist for migrating existing Tailwind v3 projects to v4.

## Pre-Migration Assessment

- [ ] Audit current `tailwind.config.js` for all customizations
- [ ] Document all custom theme values (colors, fonts, spacing, etc.)
- [ ] List all custom plugins or extensions
- [ ] Check for deprecated utilities in v4
- [ ] Review component library for breaking changes
- [ ] Backup current project (git commit)

## Phase 1: Preparation

- [ ] Create new branch: `git checkout -b tailwind-v4-migration`
- [ ] Update `package.json` dependencies:
  ```bash
  npm install -D tailwindcss@latest
  ```
- [ ] Verify installation: `npm list tailwindcss`
- [ ] Read v4 breaking changes: https://tailwindcss.com/docs/upgrade-guide

## Phase 2: Configuration Migration

### Step 1: Create globals.css with @theme

- [ ] Create or update `src/app/globals.css`
- [ ] Add `@import "tailwindcss"` at top
- [ ] Create `@theme { }` block
- [ ] Migrate all theme values from `tailwind.config.js`:

**Colors**:
```javascript
// v3: tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6'
    }
  }
}
```

```css
/* v4: globals.css */
@theme {
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
}
```

- [ ] Migrate fonts:
```javascript
// v3
fontFamily: {
  heading: 'Inter',
  body: 'Inter'
}
```

```css
/* v4 */
@theme {
  --font-family-heading: 'Inter', sans-serif;
  --font-family-body: 'Inter', sans-serif;
}
```

- [ ] Migrate spacing, shadows, border radius, etc.
- [ ] Migrate breakpoints (if custom)
- [ ] Migrate animations (if custom)

### Step 2: Handle Dark Mode

- [ ] Verify dark mode strategy (class-based vs media query)
- [ ] Update `@theme` with dark mode colors:
```css
@theme {
  --color-bg: #FFFFFF;
  --color-dark-bg: #0F0F0F;
}
```

- [ ] Add dark mode CSS:
```css
body {
  background-color: var(--color-bg);
}

html.dark body {
  background-color: var(--color-dark-bg);
}
```

### Step 3: Remove Old Config

- [ ] Delete `tailwind.config.js`
- [ ] Delete `tailwind.config.ts` (if exists)
- [ ] Remove `postcss.config.js` (if only for Tailwind)
- [ ] Verify no references in `package.json` scripts

## Phase 3: Component Updates

### Step 1: Audit Component Classes

- [ ] Search for hardcoded color values in components
- [ ] Replace with theme-based utilities:

```tsx
// Before
<button className="bg-blue-500">Button</button>

// After
<button className="bg-primary">Button</button>
```

### Step 2: Update Deprecated Utilities

Common v3 → v4 changes:

| v3 | v4 | Notes |
|----|----|----|
| `ring-offset-white` | `ring-offset-bg` | Use theme variable |
| `from-blue-500` | `from-primary` | Gradient colors use theme |
| `via-blue-500` | `via-primary` | Gradient colors use theme |
| `to-blue-500` | `to-primary` | Gradient colors use theme |

- [ ] Search and replace deprecated utilities
- [ ] Test all components in browser

### Step 3: Dark Mode in Components

- [ ] Add `dark:` variants to all color utilities:

```tsx
// Before (v3)
<div className="bg-white text-black">Content</div>

// After (v4)
<div className="bg-bg dark:bg-dark-bg text-text dark:text-dark-text">
  Content
</div>
```

- [ ] Test dark mode toggle
- [ ] Verify all components have dark mode variants

## Phase 4: Testing

### Build Testing

- [ ] Run build: `npm run build`
- [ ] Check for errors or warnings
- [ ] Verify CSS file size (should be similar or smaller)
- [ ] Clear build cache if needed: `rm -rf .next`

### Visual Testing

- [ ] Test all pages in light mode
- [ ] Test all pages in dark mode
- [ ] Test responsive breakpoints (sm, md, lg, xl, 2xl)
- [ ] Test interactive states (hover, focus, active)
- [ ] Test animations and transitions

### Component Testing

- [ ] Test all custom components
- [ ] Test form inputs and validation states
- [ ] Test buttons and CTAs
- [ ] Test cards and containers
- [ ] Test modals and overlays
- [ ] Test navigation and menus

### Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Phase 5: Cleanup

- [ ] Remove any v3-specific workarounds
- [ ] Remove unused CSS utilities
- [ ] Optimize `@theme` block (remove unused variables)
- [ ] Update documentation with v4 patterns
- [ ] Update team guidelines for v4

## Phase 6: Deployment

- [ ] Create pull request with migration changes
- [ ] Request code review
- [ ] Address review feedback
- [ ] Merge to main branch
- [ ] Deploy to staging environment
- [ ] Final QA testing
- [ ] Deploy to production

## Rollback Plan

If issues arise:

1. Revert commit: `git revert <commit-hash>`
2. Restore `tailwind.config.js` from backup
3. Reinstall v3: `npm install -D tailwindcss@3`
4. Clear cache: `rm -rf .next node_modules/.cache`
5. Rebuild: `npm run build`

## Common Migration Issues

### Issue: Build fails with "Unknown at rule @theme"

**Cause**: PostCSS not configured for Tailwind v4

**Solution**:
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Issue: Utilities not generating from @theme

**Cause**: Missing `@import "tailwindcss"` or incorrect variable naming

**Solution**:
```css
@import "tailwindcss";

@theme {
  --color-primary: #3B82F6;  /* Generates bg-primary, text-primary, etc. */
}
```

### Issue: Dark mode not working

**Cause**: Incorrect CSS selector or missing dark mode CSS

**Solution**:
```css
/* Correct */
html.dark body {
  background-color: var(--color-dark-bg);
}

/* Wrong */
.dark body {
  background-color: var(--color-dark-bg);
}
```

### Issue: CSS variables not available in custom CSS

**Cause**: Variables defined outside `@theme` block

**Solution**:
```css
@theme {
  --color-primary: #3B82F6;
}

/* Now available */
.custom {
  color: var(--color-primary);
}
```

## Verification Checklist

After migration, verify:

- [ ] All pages render correctly
- [ ] All colors match design system
- [ ] Dark mode works on all pages
- [ ] Responsive design works on all breakpoints
- [ ] All interactive states work (hover, focus, active)
- [ ] All animations and transitions work
- [ ] No console errors or warnings
- [ ] Build completes without errors
- [ ] CSS file size is reasonable
- [ ] Performance metrics are maintained or improved
