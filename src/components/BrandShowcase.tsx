import React from 'react';
import { NeuralCrewLogo } from '@/assets/logos';
import { BrandText } from '@/components/ui';

/**
 * BrandShowcase Component
 * 
 * Demonstrates proper usage of WaveSync brand components:
 * - NeuralCrewLogo: Animated neural network logo
 * - BrandText: Typography component for brand wordmark
 * 
 * This component verifies that imports work correctly with path aliases.
 */

interface BrandShowcaseProps {
  layout?: 'horizontal' | 'vertical';
  size?: 'compact' | 'standard' | 'large';
  variant?: 'cyan' | 'indigo';
  animated?: boolean;
}

const BrandShowcase: React.FC<BrandShowcaseProps> = ({
  layout = 'horizontal',
  size = 'standard',
  variant = 'cyan',
  animated = true
}) => {
  const sizeConfig = {
    compact: {
      logoSize: 40,
      textSize: 'md' as const,
      gap: '12px'
    },
    standard: {
      logoSize: 60,
      textSize: 'lg' as const,
      gap: '16px'
    },
    large: {
      logoSize: 120,
      textSize: 'xl' as const,
      gap: '24px'
    }
  };

  const config = sizeConfig[size];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    alignItems: 'center',
    gap: config.gap,
    padding: '20px'
  };

  return (
    <div style={containerStyle}>
      <NeuralCrewLogo 
        width={config.logoSize} 
        height={config.logoSize}
        variant={variant}
        animated={animated}
      />
      <BrandText 
        size={config.textSize}
        variant={variant === 'cyan' ? 'gradient' : 'dual'}
      />
    </div>
  );
};

export default BrandShowcase;



