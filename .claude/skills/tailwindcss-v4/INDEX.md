# Tailwind CSS v4 Skill — Complete Reference

**Skill Location**: `F:\techai\.claude\skills\tailwindcss-v4\`

**Status**: ✅ Production-Ready

**Total Content**: 3,519 lines across 7 files

---

## Skill Overview

The `tailwindcss-v4` skill is a comprehensive Guide-type skill for mastering Tailwind CSS v4 with CSS-first configuration, dark mode implementation, and component patterns.

### When to Use This Skill

Invoke this skill when you need to:
- Implement Tailwind v4 in new projects
- Migrate existing projects from Tailwind v3 to v4
- Build reusable components with Tailwind v4 patterns
- Troubleshoot v4-specific issues
- Optimize performance in Tailwind v4 projects
- Implement dark mode with best practices

### Key Features

✅ **CSS-First Configuration** — No JavaScript config files needed
✅ **Dark Mode Patterns** — Complete ThemeProvider implementation
✅ **Component Library** — 10 production-ready component patterns
✅ **Migration Guide** — Step-by-step v3 to v4 migration
✅ **Troubleshooting** — Common issues and solutions
✅ **Performance Tips** — Build and runtime optimization
✅ **API Reference** — Complete theme namespace documentation

---

## File Structure

```
tailwindcss-v4/
├── SKILL.md                          (640 lines)
│   ├── Quick Start
│   ├── Core Concepts
│   ├── Setup Workflows (3 workflows)
│   ├── Component Building Patterns
│   ├── Best Practices
│   ├── Common Issues & Solutions
│   └── References Index
│
└── references/
    ├── v4-api-reference.md           (369 lines)
    │   ├── Theme Namespace Reference
    │   ├── Common Utility Classes
    │   ├── Dark Mode Utilities
    │   ├── Responsive Utilities
    │   └── State Variants
    │
    ├── migration-checklist.md        (287 lines)
    │   ├── Pre-Migration Assessment
    │   ├── 6 Migration Phases
    │   ├── Component Updates
    │   ├── Testing Procedures
    │   ├── Rollback Plan
    │   └── Verification Checklist
    │
    ├── component-patterns.md         (498 lines)
    │   ├── 10 Production Components
    │   ├── Button, Card, Input
    │   ├── Badge, Grid, Modal
    │   ├── Navbar, Form, Alert
    │   └── Skeleton Loader
    │
    ├── dark-mode-guide.md            (624 lines)
    │   ├── Dark Mode Fundamentals
    │   ├── ThemeProvider Implementation
    │   ├── Color Palette Strategy
    │   ├── Component Dark Mode Patterns
    │   ├── Advanced Techniques
    │   ├── Testing Dark Mode
    │   └── Common Issues
    │
    ├── troubleshooting.md            (480 lines)
    │   ├── Build & Configuration Issues
    │   ├── Dark Mode Issues
    │   ├── Component & Styling Issues
    │   ├── Performance Issues
    │   ├── Migration Issues
    │   ├── Debugging Techniques
    │   └── Getting Help
    │
    └── performance-tips.md           (621 lines)
        ├── Build Performance
        ├── Runtime Performance
        ├── CSS File Size Optimization
        ├── Component Performance
        ├── Animation Performance
        ├── Dark Mode Performance
        ├── Monitoring & Profiling
        ├── Deployment Optimization
        └── Performance Checklist
```

---

## Content Summary

### SKILL.md (Main Guide)

**Quick Start** (3 sections)
- New project setup with Tailwind v4
- Dark mode implementation
- Verification steps

**Core Concepts** (5 sections)
- CSS-first configuration philosophy
- Theme namespaces and naming conventions
- Override vs extend patterns
- CSS custom properties at runtime

**Setup Workflows** (3 complete workflows)
1. New Project Setup — 5-step process
2. Dark Mode Setup — ThemeProvider + CSS
3. Migration from v3 to v4 — 5-step conversion

**Component Building Patterns** (4 patterns)
- Reusable components with theme variables
- Dark mode components
- Responsive layouts
- Custom CSS with theme variables

**Best Practices** (6 practices)
- Organize theme variables
- Use semantic color names
- Maintain light/dark consistency
- Avoid hardcoded colors
- Use utilities over custom CSS
- Keep custom CSS minimal

**Common Issues & Solutions** (4 issues)
- Theme variables not generating
- Dark mode not toggling
- Build fails after migration
- CSS variables not available

---

### v4-api-reference.md

**Complete API Documentation**
- All theme namespaces with examples
- Color, font, spacing, radius, shadow variables
- Duration and z-index variables
- Breakpoint reference
- 50+ common utility classes
- Dark mode utilities
- Responsive utilities
- State variants (hover, focus, active, etc.)

---

### migration-checklist.md

**6-Phase Migration Process**
1. Pre-Migration Assessment
2. Configuration Migration
3. Component Updates
4. Testing (build, visual, component, browser)
5. Cleanup
6. Deployment

**Includes**
- Step-by-step checklist (40+ items)
- Code examples for each phase
- Common migration issues
- Rollback plan
- Verification checklist

---

### component-patterns.md

**10 Production-Ready Components**
1. Button — Multiple variants and sizes
2. Card — Hoverable with dark mode
3. Input — With validation and helper text
4. Badge — 5 color variants
5. Grid — Responsive column layouts
6. Modal — With backdrop and close button
7. Navbar — With logo, links, and actions
8. Form — Wrapper with spacing
9. Alert — 4 alert types with close
10. Skeleton — Animated loading placeholder

Each component includes:
- Full TypeScript implementation
- Props interface
- Dark mode support
- Usage examples

---

### dark-mode-guide.md

**Complete Dark Mode Implementation**
- Class-based dark mode setup
- CSS implementation details
- ThemeProvider component (full code)
- ThemeToggle component (full code)
- useTheme hook for accessing theme state
- Color palette strategy
- 4 component dark mode patterns
- 4 advanced techniques
- Testing checklist
- Common issues and solutions
- Performance optimization

---

### troubleshooting.md

**Comprehensive Troubleshooting**
- 15+ common issues with solutions
- Build & configuration problems
- Dark mode issues
- Component & styling issues
- Performance issues
- Migration issues
- 4 debugging techniques
- Resources for getting help

---

### performance-tips.md

**Performance Optimization Guide**
- Build performance (4 tips)
- Runtime performance (4 tips)
- CSS file size optimization (4 tips)
- Component performance (4 tips)
- Animation performance (4 tips)
- Dark mode performance (3 tips)
- Monitoring & profiling (4 tips)
- Deployment optimization (4 tips)
- Performance checklist (12 items)

---

## How to Use This Skill

### Invoke the Skill

```bash
/tailwindcss-v4
```

### Typical Workflows

**Workflow 1: New Project Setup**
1. Read SKILL.md "Quick Start" section
2. Follow "New Project Setup" workflow
3. Reference v4-api-reference.md for utilities
4. Use component-patterns.md for components

**Workflow 2: Migrate from v3**
1. Read migration-checklist.md
2. Follow 6-phase process
3. Reference troubleshooting.md for issues
4. Use component-patterns.md for updated components

**Workflow 3: Implement Dark Mode**
1. Read dark-mode-guide.md
2. Copy ThemeProvider implementation
3. Add ThemeToggle component
4. Reference component-patterns.md for dark mode variants

**Workflow 4: Troubleshoot Issues**
1. Search troubleshooting.md for your issue
2. Follow solution steps
3. Use debugging techniques if needed
4. Reference v4-api-reference.md for API details

**Workflow 5: Optimize Performance**
1. Read performance-tips.md
2. Apply relevant tips to your project
3. Monitor CSS file size
4. Use performance checklist

---

## Key Concepts Covered

### CSS-First Configuration
- No JavaScript config files
- All theme in `@theme { }` block in globals.css
- CSS custom properties available at runtime
- Automatic utility generation from variables

### Theme Namespaces
- `--color-*` → color utilities
- `--font-family-*` → font utilities
- `--spacing-*` → spacing utilities
- `--radius-*` → border-radius utilities
- `--shadow-*` → shadow utilities
- `--duration-*` → animation duration utilities
- `--z-index-*` → z-index utilities

### Dark Mode
- Class-based dark mode (add `dark` class to `<html>`)
- CSS selectors: `html.dark body { }`
- Dark mode utilities: `dark:bg-primary`
- ThemeProvider for state management
- System preference detection
- localStorage persistence

### Component Patterns
- Semantic color naming
- Light/dark mode variants
- Responsive design
- Interactive states
- Accessibility focus states
- Reusable component architecture

### Performance
- Minimize theme variables
- Use production builds for testing
- Avoid dynamic class names
- GPU-accelerated animations
- CSS class toggle for dark mode
- Lazy load components

---

## Integration with techai.pk

This skill is designed to be generic and reusable across projects, but aligns with techai.pk's Tailwind v4 setup:

- **Brand Colors**: Examples use semantic naming (primary, secondary, success, error)
- **Dark Mode**: Full implementation with ThemeProvider
- **Component Patterns**: Production-ready components matching techai.pk conventions
- **Best Practices**: Align with techai.pk's code conventions

---

## Maintenance & Updates

### When to Update This Skill

- Tailwind v4 releases new features
- New best practices emerge
- Common issues are discovered
- Performance optimizations are found

### How to Update

1. Update relevant reference file
2. Test changes in techai.pk project
3. Update SKILL.md if needed
4. Commit changes with clear message

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Lines | 3,519 |
| Main Guide | 640 lines |
| Reference Files | 6 files |
| Component Examples | 10 |
| Workflows | 3 complete workflows |
| Common Issues Covered | 15+ |
| Performance Tips | 28 |
| Dark Mode Patterns | 4 |
| API Reference Items | 50+ |

---

## Quick Links

- **SKILL.md**: Main guide with workflows
- **v4-api-reference.md**: Complete API documentation
- **migration-checklist.md**: v3 to v4 migration
- **component-patterns.md**: 10 production components
- **dark-mode-guide.md**: Dark mode implementation
- **troubleshooting.md**: Common issues & solutions
- **performance-tips.md**: Optimization strategies

---

## Next Steps

1. **Test the skill**: Invoke `/tailwindcss-v4` in a new conversation
2. **Use in projects**: Reference when building with Tailwind v4
3. **Gather feedback**: Note any missing topics or improvements
4. **Iterate**: Update based on real-world usage

---

**Created**: 2026-04-02
**Status**: Production-Ready ✅
**Version**: 1.0
