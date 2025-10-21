import React from 'react';

interface BrandTextProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gradient' | 'dual' | 'mono';
  className?: string;
  showFullName?: boolean;
}

const BrandText: React.FC<BrandTextProps> = ({ 
  size = 'md', 
  variant = 'gradient',
  className = '',
  showFullName = true
}) => {
  // Size configurations
  const sizes = {
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px'
  };

  // Base styles
  const baseStyle: React.CSSProperties = {
    fontSize: sizes[size],
    fontWeight: 700,
    display: 'inline-block',
    letterSpacing: '-0.02em'
  };

  // Variant styles
  const getStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          wave: {
            ...baseStyle,
            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          },
          sync: {
            ...baseStyle,
            color: '#0284c7'
          }
        };
      
      case 'dual':
        return {
          wave: {
            ...baseStyle,
            color: '#0ea5e9'
          },
          sync: {
            ...baseStyle,
            color: '#6366f1'
          }
        };
      
      case 'mono':
        return {
          wave: {
            ...baseStyle,
            color: '#0ea5e9'
          },
          sync: {
            ...baseStyle,
            color: '#0ea5e9'
          }
        };
      
      default:
        return {
          wave: baseStyle,
          sync: baseStyle
        };
    }
  };

  const styles = getStyles();

  if (!showFullName) {
    return (
      <span className={className} style={styles.wave}>
        WS
      </span>
    );
  }

  return (
    <span className={className}>
      <span style={styles.wave}>Wave</span>
      <span style={styles.sync}>Sync</span>
    </span>
  );
};

export default BrandText;
