import React from 'react';
import styles from './AIIcons.module.css';

// AI Sparkle Icon Component
export const AISparkleIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 16, 
  className = '' 
}) => (
  <svg 
    viewBox="0 0 24 24" 
    className={`${styles.aiSparkle} ${className}`}
    width={size}
    height={size}
  >
    <defs>
      <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2L13.09 8.26L19 7L13.09 15.74L12 22L10.91 15.74L5 17L10.91 8.26L12 2Z" 
      fill="url(#aiGradient)" 
    />
  </svg>
);

// AI Processing Icon Component
export const AIProcessingIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <div className={`${styles.aiProcessingIcon} ${className}`} style={{ width: size, height: size }}>
    <div className={styles.aiOrbit}>
      <div className={styles.aiNucleus}></div>
      <div className={`${styles.aiElectron} ${styles.aiElectron1}`}></div>
      <div className={`${styles.aiElectron} ${styles.aiElectron2}`}></div>
      <div className={`${styles.aiElectron} ${styles.aiElectron3}`}></div>
    </div>
  </div>
);

// AI Brain Icon Component
export const AIBrainIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg 
    viewBox="0 0 24 24" 
    className={`${styles.aiBrain} ${className}`}
    width={size}
    height={size}
  >
    <defs>
      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4L8 14c0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5l.5-2c1-1 1.5-2.5 1.5-4 0-3.5-2.5-6-6-6z" 
      fill="url(#brainGradient)" 
    />
    <circle cx="9" cy="8" r="1" fill="white" opacity="0.8" />
    <circle cx="15" cy="8" r="1" fill="white" opacity="0.8" />
  </svg>
);

// AI Confidence Indicator
export const AIConfidenceIndicator: React.FC<{ 
  confidence: number; 
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}> = ({ confidence, size = 'medium', showLabel = true }) => {
  const sizeClasses = {
    small: styles.confidenceSmall,
    medium: styles.confidenceMedium,
    large: styles.confidenceLarge
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return '#10b981';
    if (conf >= 60) return '#3b82f6';
    if (conf >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={`${styles.confidenceIndicator} ${sizeClasses[size]}`}>
      {showLabel && <span className={styles.confidenceLabel}>AI Confidence</span>}
      <div className={styles.confidenceBar}>
        <div 
          className={styles.confidenceFill}
          style={{ 
            width: `${confidence}%`,
            backgroundColor: getConfidenceColor(confidence)
          }}
        ></div>
      </div>
      <span className={styles.confidenceValue}>{confidence}%</span>
    </div>
  );
};

// AI Badge Component
export const AIBadge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'small' | 'medium';
}> = ({ children, variant = 'primary', size = 'medium' }) => {
  const variantClasses = {
    primary: styles.badgePrimary,
    secondary: styles.badgeSecondary,
    success: styles.badgeSuccess,
    warning: styles.badgeWarning
  };

  const sizeClasses = {
    small: styles.badgeSmall,
    medium: styles.badgeMedium
  };

  return (
    <div className={`${styles.aiBadge} ${variantClasses[variant]} ${sizeClasses[size]}`}>
      <AISparkleIcon size={size === 'small' ? 12 : 16} />
      <span>{children}</span>
    </div>
  );
};

// AI Processing Banner
export const AIProcessingBanner: React.FC<{ 
  message: string; 
  isVisible: boolean;
}> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.processingBanner}>
      <AIProcessingIcon size={20} />
      <div className={styles.processingText}>
        <span>{message}</span>
        <div className={styles.processingDots}>
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    </div>
  );
};

// AI Match Quality Badge
export const AIMatchQualityBadge: React.FC<{ 
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  score: number;
}> = ({ quality, score }) => {
  const qualityClasses = {
    Excellent: styles.qualityExcellent,
    Good: styles.qualityGood,
    Fair: styles.qualityFair,
    Poor: styles.qualityPoor
  };

  return (
    <div className={`${styles.matchQualityBadge} ${qualityClasses[quality]}`}>
      <AISparkleIcon size={12} />
      <span>{quality} Match</span>
      <span className={styles.scoreValue}>{score}%</span>
    </div>
  );
};

// AI Insights Toggle Button
export const AIInsightsToggle: React.FC<{ 
  isOpen: boolean; 
  onClick: () => void;
  insightsCount?: number;
}> = ({ isOpen, onClick, insightsCount = 0 }) => {
  return (
    <button 
      className={`${styles.insightsToggle} ${isOpen ? styles.insightsToggleOpen : ''}`}
      onClick={onClick}
    >
      <AIBrainIcon size={16} />
      <span>AI Insights</span>
      {insightsCount > 0 && (
        <span className={styles.insightsCount}>{insightsCount}</span>
      )}
    </button>
  );
};

// AI Recommendation Card
export const AIRecommendationCard: React.FC<{ 
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}> = ({ icon, title, description, priority }) => {
  const priorityClasses = {
    high: styles.priorityHigh,
    medium: styles.priorityMedium,
    low: styles.priorityLow
  };

  return (
    <div className={`${styles.recommendationCard} ${priorityClasses[priority]}`}>
      <div className={styles.recommendationIcon}>{icon}</div>
      <div className={styles.recommendationContent}>
        <h5 className={styles.recommendationTitle}>{title}</h5>
        <p className={styles.recommendationDescription}>{description}</p>
      </div>
      <div className={`${styles.priorityIndicator} ${priorityClasses[priority]}`}></div>
    </div>
  );
};

// AI Score Circle Chart
export const AIScoreCircle: React.FC<{ 
  score: number; 
  size?: number;
  showPercentage?: boolean;
}> = ({ score, size = 50, showPercentage = true }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;


  return (
    <div className={styles.scoreCircle} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className={styles.circularChart}>
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          className={styles.circleBg}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <circle
          className={styles.circle}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset: circumference }}
        />
        {showPercentage && (
          <text 
            x={size / 2} 
            y={size / 2 + 4} 
            className={styles.scoreText}
            textAnchor="middle"
          >
            {score}%
          </text>
        )}
      </svg>
    </div>
  );
};
