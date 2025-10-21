# BrandText Component

The BrandText component provides consistent, beautiful typography for the WaveSync brand across the application. It supports multiple variants and sizes to fit any use case.

## Usage

```tsx
import { BrandText } from '@/components/ui';

// Basic usage with gradient (default)
<BrandText />

// Different variants
<BrandText variant="gradient" />  // Wave gradient + Sync solid
<BrandText variant="dual" />      // Wave cyan + Sync indigo
<BrandText variant="mono" />      // Full monochrome cyan

// Different sizes
<BrandText size="sm" />   // 1rem (16px)
<BrandText size="md" />   // 1.25rem (20px) - default
<BrandText size="lg" />   // 1.5rem (24px)
<BrandText size="xl" />   // 2rem (32px)

// Short form (WS)
<BrandText showFullName={false} />

// Full configuration
<BrandText 
  size="lg"
  variant="dual"
  showFullName={true}
  className="my-custom-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Font size and weight |
| `variant` | `'gradient' \| 'dual' \| 'mono'` | `'gradient'` | Color style variant |
| `className` | `string` | `''` | Additional CSS classes |
| `showFullName` | `boolean` | `true` | Show "WaveSync" or "WS" |

## Size Reference

| Size | Font Size | Weight | Use Case |
|------|-----------|--------|----------|
| `sm` | 1rem (16px) | 600 | Inline text, small UI elements |
| `md` | 1.25rem (20px) | 700 | Navigation bars, headers |
| `lg` | 1.5rem (24px) | 700 | Page titles, section headers |
| `xl` | 2rem (32px) | 800 | Hero sections, landing pages |

## Variant Styles

### Gradient (Default)
- **Wave**: Cyan gradient (`#0ea5e9` → `#06b6d4`)
- **Sync**: Solid sky blue (`#0284c7`)
- **Best for**: Headers, hero sections, primary branding

### Dual
- **Wave**: Solid sky blue (`#0ea5e9`)
- **Sync**: Indigo (`#6366f1`)
- **Best for**: Navigation, alternative styling, contrast needs

### Mono
- **Wave**: Sky blue (`#0ea5e9`)
- **Sync**: Sky blue (`#0ea5e9`)
- **Best for**: Subtle branding, light backgrounds, minimalist design

## Color Palette

```css
/* Primary Colors */
Sky Blue:     #0ea5e9  /* Main brand color */
Cyan:         #06b6d4  /* Ocean accent */
Sky Dark:     #0284c7  /* Deep ocean */
Indigo:       #6366f1  /* Contrast accent */
```

## Example Implementations

### Navigation Bar
```tsx
<nav>
  <BrandText size="md" variant="gradient" />
</nav>
```

### Login Page Hero
```tsx
<header>
  <BrandText size="xl" variant="gradient" />
  <p>Maritime Crew Management Platform</p>
</header>
```

### Compact Mobile Menu
```tsx
<div className="mobile-menu">
  <BrandText size="sm" variant="dual" showFullName={false} />
</div>
```

### Email Signature
```tsx
<footer>
  <BrandText size="md" variant="mono" />
  <p>Maritime Solutions</p>
</footer>
```

### Loading Screen
```tsx
<div className="loading-screen">
  <BrandText size="xl" variant="gradient" />
  <Spinner />
</div>
```

## Design Philosophy

- **Wave** represents the ocean, movement, and adaptability
- **Sync** represents connection, coordination, and technology
- The gradient flows like water, embodying the maritime theme
- Dual colors represent the bridge between sea and technology

## Accessibility

- Uses semantic HTML (`<span>` elements)
- Maintains WCAG AA contrast ratios on dark backgrounds
- Font weights ensure readability at all sizes
- No animation (pure CSS) for performance and compatibility

## Browser Support

Works in all modern browsers with full CSS gradient support:
- Chrome/Edge 88+
- Firefox 83+
- Safari 14+

For older browsers, the gradient gracefully falls back to solid colors.

## Testing

To see all variants in action, navigate to `/test` in your application. The test page showcases:
- All three style variants
- All four sizes
- Short form (WS) variations
- Real-world usage examples

## Related Components

- `NeuralCrewLogo` - Animated logo component
- `BrandedSpinner` - Loading spinner with brand colors

