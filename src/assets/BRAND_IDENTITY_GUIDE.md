# WaveSync Brand Identity Guide

Complete guide for using WaveSync brand components consistently across the application.

## Quick Import Reference

```tsx
// Logo Component
import { NeuralCrewLogo } from '@/assets/logos';

// Typography Component
import { BrandText } from '@/components/ui';
```

## Complete Component Showcase

### Neural Crew Logo

The Neural Crew Logo represents AI-powered maritime crew management through an animated neural network visualization.

#### Basic Usage

```tsx
// Default: Cyan, Animated, 140px
<NeuralCrewLogo />

// All options
<NeuralCrewLogo 
  variant="cyan"        // or "indigo"
  animated={true}       // or false
  width={140}
  height={140}
  className="custom-class"
/>
```

#### Logo Variants

**Cyan (Default)**
- Primary brand color
- Best for: Most use cases, light/dark backgrounds
- Colors: `#06b6d4`, `#0ea5e9`, `#0284c7`

**Indigo**
- Alternative accent
- Best for: Contrast needs, special features
- Colors: `#6366f1`, `#0ea5e9`

#### Logo Sizes

| Use Case | Size | Animation |
|----------|------|-----------|
| Navigation Bar | 40x40 | Optional |
| Page Header | 80x80 | Yes |
| Hero Section | 200x200 | Yes |
| Favicon/Icon | 32x32 | No |
| Loading Screen | 120x120 | Yes |

### BrandText Typography

The BrandText component provides consistent WaveSync wordmark across all surfaces.

#### Basic Usage

```tsx
// Default: Medium size, Gradient
<BrandText />

// All options
<BrandText 
  size="md"              // "sm" | "md" | "lg" | "xl"
  variant="gradient"     // "gradient" | "dual" | "mono"
  showFullName={true}    // true = "WaveSync", false = "WS"
  className="custom-class"
/>
```

#### Typography Variants

**Gradient (Recommended)**
- Wave: Gradient `#0ea5e9 → #06b6d4`
- Sync: Solid `#0284c7`
- Best for: Headers, primary branding, hero sections

**Dual**
- Wave: Sky blue `#0ea5e9`
- Sync: Indigo `#6366f1`
- Best for: Navigation, contrast needs, alternative styling

**Mono**
- Wave: Sky blue `#0ea5e9`
- Sync: Sky blue `#0ea5e9`
- Best for: Subtle branding, minimalist design, footers

#### Typography Sizes

| Size | Font Size | Weight | Use Case |
|------|-----------|--------|----------|
| `sm` | 1rem (16px) | 600 | Inline text, compact spaces |
| `md` | 1.25rem (20px) | 700 | Navigation, standard headers |
| `lg` | 1.5rem (24px) | 700 | Page titles, section headers |
| `xl` | 2rem (32px) | 800 | Hero sections, landing pages |

## Real-World Examples

### Navigation Bar (Desktop)

```tsx
<nav className="navbar">
  <div className="brand">
    <NeuralCrewLogo width={40} height={40} variant="cyan" />
    <BrandText size="md" variant="gradient" />
  </div>
  {/* navigation items */}
</nav>
```

### Mobile Navigation

```tsx
<nav className="mobile-nav">
  <NeuralCrewLogo width={32} height={32} animated={false} />
  <BrandText size="sm" variant="dual" showFullName={false} />
</nav>
```

### Login Page Hero

```tsx
<header className="login-hero">
  <NeuralCrewLogo width={200} height={200} variant="cyan" animated={true} />
  <BrandText size="xl" variant="gradient" />
  <p className="tagline">AI-Powered Maritime Crew Management</p>
</header>
```

### Loading Screen

```tsx
<div className="loading-screen">
  <NeuralCrewLogo width={120} height={120} animated={true} />
  <BrandText size="lg" variant="gradient" />
  <Spinner />
</div>
```

### Email Header

```tsx
<header className="email-header">
  <NeuralCrewLogo width={60} height={60} animated={false} />
  <BrandText size="md" variant="mono" />
</header>
```

### Dashboard Header

```tsx
<header className="dashboard-header">
  <div className="brand-section">
    <NeuralCrewLogo width={50} height={50} variant="indigo" />
    <BrandText size="md" variant="dual" />
  </div>
  <div className="user-section">
    {/* user menu */}
  </div>
</header>
```

### Footer

```tsx
<footer className="site-footer">
  <div className="brand">
    <NeuralCrewLogo width={60} height={60} animated={false} variant="cyan" />
    <BrandText size="md" variant="mono" />
  </div>
  <p className="copyright">© 2024 WaveSync. All rights reserved.</p>
</footer>
```

### Error Page (404/500)

```tsx
<div className="error-page">
  <NeuralCrewLogo width={150} height={150} animated={false} variant="indigo" />
  <BrandText size="xl" variant="dual" />
  <h2>Page Not Found</h2>
  <Button>Return Home</Button>
</div>
```

## Color Palette Reference

### Primary Colors

```css
/* Ocean Breeze Theme */
--sky-500:    #0ea5e9;  /* Primary brand color */
--cyan-500:   #06b6d4;  /* Ocean accent */
--sky-600:    #0284c7;  /* Deep ocean */
--indigo-500: #6366f1;  /* Contrast accent */

/* Supporting Colors */
--slate-700:  #334155;  /* Dark backgrounds */
--slate-500:  #64748b;  /* Secondary text */
--slate-300:  #cbd5e1;  /* Light text */
```

### Gradient Definitions

```css
/* Primary Brand Gradient */
.brand-gradient {
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
}

/* Hero Background Gradient */
.hero-gradient {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}
```

## Spacing & Layout Guidelines

### Logo + Text Combinations

```tsx
// Horizontal Layout (Recommended for Navigation)
<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
  <NeuralCrewLogo width={40} height={40} />
  <BrandText size="md" />
</div>

// Vertical Layout (Recommended for Hero Sections)
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
  <NeuralCrewLogo width={200} height={200} />
  <BrandText size="xl" />
</div>
```

### Recommended Spacing

| Layout | Logo Size | Text Size | Gap |
|--------|-----------|-----------|-----|
| Compact Nav | 32-40px | sm-md | 8-12px |
| Standard Nav | 40-50px | md | 12-16px |
| Hero Section | 150-200px | xl | 20-30px |
| Footer | 50-60px | md | 12px |

## Accessibility Guidelines

### Contrast Ratios

All brand colors meet WCAG AA standards on appropriate backgrounds:
- Sky blue (#0ea5e9) on dark: 4.5:1 ratio ✓
- Cyan (#06b6d4) on dark: 4.8:1 ratio ✓
- Indigo (#6366f1) on dark: 4.2:1 ratio ✓

### Semantic HTML

Always use proper semantic HTML with brand components:

```tsx
// Good - Semantic header
<header>
  <h1>
    <NeuralCrewLogo width={40} height={40} />
    <BrandText size="md" />
  </h1>
</header>

// Good - Navigation landmark
<nav aria-label="Main navigation">
  <BrandText size="md" />
  {/* nav items */}
</nav>
```

### Animation & Motion

- Logo animations are subtle and do not cause vestibular issues
- All animations respect `prefers-reduced-motion` media query
- Disable animations with `animated={false}` for static contexts

## Testing Your Implementation

Visit `/test` in your application to see:
- ✨ All logo variants (cyan, indigo)
- 🎬 Animation states (animated, static)
- 📐 Multiple sizes
- 🎨 All typography variants (gradient, dual, mono)
- 📏 All typography sizes (sm, md, lg, xl)
- ✂️ Short form (WS) variations

## Best Practices

### DO ✅

- Use NeuralCrewLogo for visual branding
- Use BrandText for text-based branding
- Combine logo + text in navigation
- Use gradient variant for primary branding
- Disable animations for print/email
- Use short form (WS) in compact spaces
- Maintain consistent spacing ratios

### DON'T ❌

- Don't stretch or distort logo proportions
- Don't change logo colors outside variants
- Don't use logo on busy backgrounds without contrast
- Don't mix multiple variants on same page (pick one)
- Don't use animations in email clients
- Don't use sizes smaller than 24px for logos
- Don't use text variant for interactive elements

## File Structure

```
src/
├── assets/
│   ├── logos/
│   │   ├── NeuralCrewLogo.tsx      # Logo component
│   │   ├── index.ts                # Exports
│   │   └── README.md               # Logo documentation
│   └── BRAND_IDENTITY_GUIDE.md     # This file
└── components/
    └── ui/
        ├── BrandText.tsx           # Typography component
        ├── BrandText.md            # Typography documentation
        └── index.ts                # Exports
```

## Support & Questions

For questions about brand usage, see:
- Logo docs: `src/assets/logos/README.md`
- Typography docs: `src/components/ui/BrandText.md`
- Live examples: Navigate to `/test`

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained by**: WaveSync Design Team



