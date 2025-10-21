# 🎨 Brand Components Quick Reference

## Imports

```tsx
import { NeuralCrewLogo } from '@/assets/logos';
import { BrandText } from '@/components/ui';
import BrandShowcase from '@/components/BrandShowcase';
```

## NeuralCrewLogo

| Prop | Values | Default |
|------|--------|---------|
| `variant` | `'cyan'` \| `'indigo'` | `'cyan'` |
| `animated` | `true` \| `false` | `true` |
| `width` | number | `140` |
| `height` | number | `140` |

```tsx
<NeuralCrewLogo variant="cyan" animated={true} width={140} height={140} />
```

## BrandText

| Prop | Values | Default |
|------|--------|---------|
| `variant` | `'gradient'` \| `'dual'` \| `'mono'` | `'gradient'` |
| `size` | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | `'md'` |
| `showFullName` | `true` \| `false` | `true` |

```tsx
<BrandText variant="gradient" size="md" showFullName={true} />
```

## BrandShowcase

| Prop | Values | Default |
|------|--------|---------|
| `layout` | `'horizontal'` \| `'vertical'` | `'horizontal'` |
| `size` | `'compact'` \| `'standard'` \| `'large'` | `'standard'` |
| `variant` | `'cyan'` \| `'indigo'` | `'cyan'` |
| `animated` | `true` \| `false` | `true` |

```tsx
<BrandShowcase layout="horizontal" size="standard" variant="cyan" />
```

## Common Patterns

### Navigation Bar
```tsx
<BrandShowcase layout="horizontal" size="compact" variant="cyan" />
```

### Hero Section
```tsx
<BrandShowcase layout="vertical" size="large" variant="cyan" />
```

### Mobile Menu
```tsx
<NeuralCrewLogo width={32} height={32} animated={false} />
<BrandText size="sm" showFullName={false} />
```

### Loading Screen
```tsx
<NeuralCrewLogo width={100} height={100} animated={true} />
```

## Size Guide

| Context | Logo Size | Text Size |
|---------|-----------|-----------|
| Nav Bar | 40px | md |
| Header | 60px | lg |
| Hero | 200px | xl |
| Icon | 32px | sm |
| Footer | 50px | md |

## Colors

- **Cyan**: `#06b6d4`, `#0ea5e9`, `#0284c7`
- **Indigo**: `#6366f1`

## Test Page

View all components: `http://localhost:3002/test`

## Docs

- Logo: `src/assets/logos/README.md`
- Typography: `src/components/ui/BrandText.md`
- Full Guide: `src/assets/BRAND_IDENTITY_GUIDE.md`



