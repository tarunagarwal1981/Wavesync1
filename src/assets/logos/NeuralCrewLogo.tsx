import React from 'react';

interface NeuralCrewLogoProps {
  width?: number;
  height?: number;
  variant?: 'cyan' | 'indigo';
  animated?: boolean;
  className?: string;
}

const NeuralCrewLogo: React.FC<NeuralCrewLogoProps> = ({
  width = 40,
  height = 40,
  variant = 'cyan',
  animated = true,
  className = ''
}) => {
  // Color schemes for variants
  const colors = {
    cyan: {
      center: '#06b6d4',
      nodes: '#0ea5e9',
      secondary: '#0284c7'
    },
    indigo: {
      center: '#6366f1',
      nodes: '#0ea5e9',
      secondary: '#6366f1'
    }
  };

  const colorScheme = colors[variant];

  return (
    <svg 
      viewBox="0 0 140 140" 
      width={width} 
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central AI core */}
      <circle cx="70" cy="70" r="12" fill={colorScheme.center}>
        {animated && (
          <animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite" />
        )}
      </circle>
      
      {/* Neural connections - Layer 1 */}
      <circle cx="45" cy="45" r="6" fill={colorScheme.nodes} opacity="0.9" />
      <circle cx="95" cy="45" r="6" fill={colorScheme.nodes} opacity="0.9" />
      <circle cx="95" cy="95" r="6" fill={colorScheme.nodes} opacity="0.9" />
      <circle cx="45" cy="95" r="6" fill={colorScheme.nodes} opacity="0.9" />
      
      {/* Neural connections - Layer 2 */}
      <circle cx="30" cy="70" r="5" fill={colorScheme.secondary} opacity="0.8" />
      <circle cx="110" cy="70" r="5" fill={colorScheme.secondary} opacity="0.8" />
      <circle cx="70" cy="30" r="5" fill={colorScheme.secondary} opacity="0.8" />
      <circle cx="70" cy="110" r="5" fill={colorScheme.secondary} opacity="0.8" />
      
      {/* Synapses - animated connections */}
      <line x1="70" y1="70" x2="45" y2="45" stroke={colorScheme.nodes} strokeWidth="2" opacity="0.5">
        {animated && (
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
        )}
      </line>
      <line x1="70" y1="70" x2="95" y2="45" stroke={colorScheme.nodes} strokeWidth="2" opacity="0.5">
        {animated && (
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
        )}
      </line>
      <line x1="70" y1="70" x2="95" y2="95" stroke={colorScheme.nodes} strokeWidth="2" opacity="0.5">
        {animated && (
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" begin="1s" repeatCount="indefinite" />
        )}
      </line>
      <line x1="70" y1="70" x2="45" y2="95" stroke={colorScheme.nodes} strokeWidth="2" opacity="0.5">
        {animated && (
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" begin="1.5s" repeatCount="indefinite" />
        )}
      </line>
      
      {/* Secondary connections */}
      <line x1="70" y1="70" x2="30" y2="70" stroke={colorScheme.secondary} strokeWidth="1.5" opacity="0.4" />
      <line x1="70" y1="70" x2="110" y2="70" stroke={colorScheme.secondary} strokeWidth="1.5" opacity="0.4" />
      <line x1="70" y1="70" x2="70" y2="30" stroke={colorScheme.secondary} strokeWidth="1.5" opacity="0.4" />
      <line x1="70" y1="70" x2="70" y2="110" stroke={colorScheme.secondary} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
};

export default NeuralCrewLogo;
