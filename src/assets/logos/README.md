# Neural Crew Logo Component

The Neural Crew Logo is a custom SVG component designed for WaveSync with the Ocean Breeze theme colors. It features a neural network visualization that represents AI-powered crew management.

## Usage

```tsx
import { NeuralCrewLogo } from '@/assets/logos';

// Basic usage with default cyan variant
<NeuralCrewLogo />

// Indigo variant
<NeuralCrewLogo variant="indigo" />

// Custom size
<NeuralCrewLogo width={120} height={120} />

// Without animation
<NeuralCrewLogo animated={false} />

// Full configuration
<NeuralCrewLogo 
  variant="cyan"
  width={160}
  height={160}
  animated={true}
  className="my-custom-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `140` | Width of the logo in pixels |
| `height` | `number` | `140` | Height of the logo in pixels |
| `variant` | `'cyan' \| 'indigo'` | `'cyan'` | Color theme variant |
| `animated` | `boolean` | `true` | Enable/disable SVG animations |
| `className` | `string` | `''` | Additional CSS classes |

## Color Variants

### Cyan (Default)
- Center: `#06b6d4` (Cyan 500)
- Nodes: `#0ea5e9` (Sky 500)
- Outer: `#0284c7` (Sky 600)

### Indigo
- Center: `#6366f1` (Indigo 500)
- Nodes: `#0ea5e9` (Sky 500)
- Outer: `#6366f1` (Indigo 500)

## Features

- ✨ Two color variants: Cyan and Indigo
- 🎬 Optional SVG animations (pulsing core & synapse connections)
- 📐 Scalable to any size
- 🎨 Ocean Breeze theme colors
- 🧠 Neural network visual metaphor for AI-powered crew management
- 🎯 Fully responsive and performant

## Testing

To see the logo in action, navigate to `/test` in your application. The test page showcases:
- Both color variants (Cyan and Indigo)
- Animated and static versions
- Different sizes (200px, 160px, 80px)

## Example Implementations

### Navigation Bar
```tsx
<NeuralCrewLogo width={40} height={40} variant="cyan" />
```

### Hero Section
```tsx
<NeuralCrewLogo width={200} height={200} variant="indigo" animated={true} />
```

### Loading States
```tsx
<NeuralCrewLogo width={60} height={60} animated={true} />
```

## Design Philosophy

The logo represents:
- **Central Core**: AI intelligence hub
- **Neural Nodes**: Crew members and connections
- **Synapses**: Communication and data flow
- **Animations**: Active learning and real-time processing

