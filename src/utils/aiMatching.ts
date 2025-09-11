// AI-Powered Assignment Matching System
export interface SeafarerProfile {
  id: string;
  name: string;
  rank: string;
  certifications: string[];
  experience_years: number;
  performance_rating: number; // 1-5 scale
  availability_date: Date;
  last_assignment_end: Date;
  vessel_types_experience: string[];
  route_preferences: string[];
  languages: string[];
  response_history: {
    average_response_time: number; // hours
    acceptance_rate: number; // percentage
    reliability_score: number; // 1-5
  };
  nationality: string;
  phone: string;
  email: string;
  emergency_contact: string;
  medical_expiry: Date;
  passport_expiry: Date;
  visa_expiry: Date;
  notes: string;
}

export interface AssignmentRequirements {
  vessel_name: string;
  position: string;
  required_certifications: string[];
  min_experience: number;
  vessel_type: string;
  route: string;
  joining_date: Date;
  contract_duration: number; // months
  required_languages?: string[];
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  salary_range?: {
    min: number;
    max: number;
  };
  special_requirements?: string[];
}

export interface MatchResult {
  overall_score: number;
  match_quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  scoring_factors: {
    factor: string;
    score: number;
    weight: string;
    details?: string;
  }[];
  ai_confidence: number; // 0-100
  recommended_action: 'Immediate Assignment' | 'Send Offer' | 'Consider Alternative' | 'Not Recommended';
  compatibility_notes: string[];
  risk_factors: string[];
}

export interface AIInsights {
  top_candidates: number;
  average_response_time: number;
  success_probability: number;
  market_availability: 'High' | 'Medium' | 'Low';
  competitive_landscape: string;
  recommendations: {
    icon: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

// Core AI Matching Algorithm
export const calculateMatchScore = (seafarer: SeafarerProfile, assignment: AssignmentRequirements): MatchResult => {
  let score = 0;
  const factors = [];
  const compatibilityNotes = [];
  const riskFactors = [];

  // 1. Certification Match (30% weight)
  const certMatch = seafarer.certifications.filter(cert => 
    assignment.required_certifications.includes(cert)
  ).length / assignment.required_certifications.length;
  const certScore = certMatch * 30;
  score += certScore;
  factors.push({ 
    factor: 'Certifications', 
    score: certScore, 
    weight: '30%',
    details: `${Math.round(certMatch * 100)}% match (${seafarer.certifications.filter(cert => assignment.required_certifications.includes(cert)).length}/${assignment.required_certifications.length})`
  });

  if (certMatch < 0.8) {
    riskFactors.push('Missing key certifications');
  } else {
    compatibilityNotes.push('All required certifications present');
  }

  // 2. Experience Level (25% weight)
  const expRatio = seafarer.experience_years / assignment.min_experience;
  const expScore = Math.min(expRatio, 1.5) * 25; // Cap at 1.5x for bonus
  score += expScore;
  factors.push({ 
    factor: 'Experience', 
    score: expScore, 
    weight: '25%',
    details: `${seafarer.experience_years} years (${Math.round(expRatio * 100)}% of minimum)`
  });

  if (seafarer.experience_years > assignment.min_experience * 1.2) {
    compatibilityNotes.push('Highly experienced for this role');
  }

  // 3. Availability (20% weight)
  const daysUntilAvailable = Math.max(0, 
    (seafarer.availability_date.getTime() - assignment.joining_date.getTime()) / (1000 * 60 * 60 * 24)
  );
  const availScore = Math.max(0, (30 - daysUntilAvailable) / 30) * 20;
  score += availScore;
  factors.push({ 
    factor: 'Availability', 
    score: availScore, 
    weight: '20%',
    details: `${daysUntilAvailable} days until available`
  });

  if (daysUntilAvailable > 14) {
    riskFactors.push('Not available for immediate assignment');
  } else if (daysUntilAvailable <= 7) {
    compatibilityNotes.push('Available for immediate assignment');
  }

  // 4. Performance History (15% weight)
  const perfScore = (seafarer.performance_rating / 5) * 15;
  score += perfScore;
  factors.push({ 
    factor: 'Performance', 
    score: perfScore, 
    weight: '15%',
    details: `${seafarer.performance_rating}/5.0 rating`
  });

  if (seafarer.performance_rating >= 4.5) {
    compatibilityNotes.push('Excellent performance history');
  } else if (seafarer.performance_rating < 3.5) {
    riskFactors.push('Below average performance rating');
  }

  // 5. Vessel Type Experience (10% weight)
  const vesselScore = seafarer.vessel_types_experience.includes(assignment.vessel_type) ? 10 : 0;
  score += vesselScore;
  factors.push({ 
    factor: 'Vessel Type', 
    score: vesselScore, 
    weight: '10%',
    details: seafarer.vessel_types_experience.includes(assignment.vessel_type) ? 'Has experience' : 'No experience'
  });

  if (!seafarer.vessel_types_experience.includes(assignment.vessel_type)) {
    riskFactors.push('No experience with this vessel type');
  }

  // Bonus: Response History (up to 5 points)
  const responseBonus = Math.min(seafarer.response_history.acceptance_rate / 20, 5);
  score += responseBonus;
  if (responseBonus > 0) {
    factors.push({ 
      factor: 'Response Bonus', 
      score: responseBonus, 
      weight: 'Bonus',
      details: `${seafarer.response_history.acceptance_rate}% acceptance rate`
    });
  }

  // Bonus: Language Match (up to 3 points)
  if (assignment.required_languages && assignment.required_languages.length > 0) {
    const languageMatch = assignment.required_languages.filter(lang => 
      seafarer.languages.includes(lang)
    ).length / assignment.required_languages.length;
    const langBonus = languageMatch * 3;
    score += langBonus;
    if (langBonus > 0) {
      factors.push({ 
        factor: 'Language Match', 
        score: langBonus, 
        weight: 'Bonus',
        details: `${Math.round(languageMatch * 100)}% language match`
      });
    }
  }

  // Calculate AI Confidence
  const aiConfidence = calculateConfidence(seafarer);

  return {
    overall_score: Math.round(Math.min(score, 100)),
    match_quality: getMatchQuality(score),
    scoring_factors: factors,
    ai_confidence: aiConfidence,
    recommended_action: getRecommendation(score, riskFactors.length),
    compatibility_notes: compatibilityNotes,
    risk_factors: riskFactors
  };
};

const getMatchQuality = (score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Poor';
};

const calculateConfidence = (seafarer: SeafarerProfile): number => {
  let confidence = 80; // Base confidence

  // Increase confidence based on data completeness
  const dataCompleteness = [
    seafarer.certifications.length > 0,
    seafarer.experience_years > 0,
    seafarer.performance_rating > 0,
    seafarer.response_history.acceptance_rate > 0
  ].filter(Boolean).length / 4;

  confidence += dataCompleteness * 15;

  // Adjust based on historical accuracy
  if (seafarer.response_history.acceptance_rate > 80) {
    confidence += 5;
  }

  return Math.min(Math.round(confidence), 100);
};

const getRecommendation = (score: number, riskCount: number): 'Immediate Assignment' | 'Send Offer' | 'Consider Alternative' | 'Not Recommended' => {
  if (score >= 85 && riskCount === 0) return 'Immediate Assignment';
  if (score >= 70 && riskCount <= 1) return 'Send Offer';
  if (score >= 55) return 'Consider Alternative';
  return 'Not Recommended';
};

// AI Learning and Insights
export const generateAIInsights = (matches: MatchResult[]): AIInsights => {
  const topCandidates = matches.filter(m => m.overall_score >= 70).length;
  const avgResponseTime = matches.reduce((acc, m) => {
    // Simulate response time based on score
    return acc + (m.overall_score > 80 ? 2 : m.overall_score > 60 ? 6 : 12);
  }, 0) / matches.length;

  const successProbability = Math.min(topCandidates * 15, 95);

  const marketAvailability = topCandidates > 5 ? 'High' : topCandidates > 2 ? 'Medium' : 'Low';

  const competitiveLandscape = marketAvailability === 'High' 
    ? 'High competition - multiple qualified candidates available'
    : marketAvailability === 'Medium'
    ? 'Moderate competition - good candidates available'
    : 'Limited availability - consider expanding search criteria';

  const recommendations = [
    {
      icon: '🎯',
      title: 'Top Choice Strategy',
      description: `Send to top ${Math.min(3, topCandidates)} candidates first - ${successProbability}% chance of acceptance`,
      priority: 'high' as const
    },
    {
      icon: '⚡',
      title: 'Response Optimization',
      description: `Average response time: ${avgResponseTime.toFixed(1)} hours`,
      priority: 'medium' as const
    },
    {
      icon: '📊',
      title: 'Market Analysis',
      description: competitiveLandscape,
      priority: 'low' as const
    }
  ];

  return {
    top_candidates: topCandidates,
    average_response_time: avgResponseTime,
    success_probability: successProbability,
    market_availability: marketAvailability,
    competitive_landscape: competitiveLandscape,
    recommendations
  };
};

// Utility Functions
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const formatDaysUntil = (date: Date): string => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Available now';
  if (diffDays === 0) return 'Available today';
  if (diffDays === 1) return 'Available tomorrow';
  return `Available in ${diffDays} days`;
};

// Debounce utility for AI processing
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
