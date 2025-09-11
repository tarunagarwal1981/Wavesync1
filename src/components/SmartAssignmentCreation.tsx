import React, { useState, useMemo } from 'react';
import { 
  AISparkleIcon, 
  AIBadge, 
  AIProcessingBanner,
  AIMatchQualityBadge,
  AIInsightsToggle,
  AIRecommendationCard,
  AIScoreCircle,
  AIConfidenceIndicator
} from './AIIcons';
import { 
  AssignmentRequirements, 
  MatchResult, 
  calculateMatchScore, 
  generateAIInsights,
  formatDaysUntil,
  debounce
} from '../utils/aiMatching';
import { seafarerProfiles, assignmentTemplates } from '../data/aiMockData';
import styles from './SmartAssignmentCreation.module.css';

interface MatchWithSeafarer {
  seafarer: any;
  match: MatchResult;
}

const SmartAssignmentCreation: React.FC = () => {
  const [assignment, setAssignment] = useState<AssignmentRequirements>({
    vessel_name: '',
    position: '',
    required_certifications: [],
    min_experience: 0,
    vessel_type: '',
    route: '',
    joining_date: new Date(),
    contract_duration: 6,
    required_languages: [],
    priority_level: 'medium',
    salary_range: { min: 5000, max: 8000 },
    special_requirements: []
  });
  
  const [matches, setMatches] = useState<MatchWithSeafarer[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState<{ [key: string]: boolean }>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [aiInsights, setAIInsights] = useState<any>(null);

  // Debounced AI matching function
  const debouncedAIMatching = useMemo(
    () => debounce(async (assignmentData: AssignmentRequirements) => {
      if (!assignmentData.position || !assignmentData.vessel_type) return;
      
      setIsAIProcessing(true);
      
      // Simulate AI processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const matchResults = seafarerProfiles
        .map(seafarer => ({
          seafarer,
          match: calculateMatchScore(seafarer, assignmentData)
        }))
        .filter(result => result.match.overall_score >= 50) // Only show matches above 50%
        .sort((a, b) => b.match.overall_score - a.match.overall_score)
        .slice(0, 10); // Top 10 matches
      
      setMatches(matchResults);
      
      // Generate AI insights
      const insights = generateAIInsights(matchResults.map(m => m.match));
      setAIInsights(insights);
      
      setIsAIProcessing(false);
    }, 500),
    []
  );

  const handleAssignmentChange = (field: string, value: any) => {
    const updatedAssignment = { ...assignment, [field]: value };
    setAssignment(updatedAssignment);
    
    // Trigger AI matching
    debouncedAIMatching(updatedAssignment);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = assignmentTemplates.find(t => t.id === templateId);
    if (template) {
      setAssignment(template);
      setSelectedTemplate(templateId);
      debouncedAIMatching(template);
    }
  };

  const toggleAIInsights = (seafarerId: string) => {
    setShowAIInsights(prev => ({
      ...prev,
      [seafarerId]: !prev[seafarerId]
    }));
  };

  const sendAssignment = (seafarerId: string) => {
    // Simulate sending assignment
    console.log(`Sending assignment to seafarer ${seafarerId}`);
    // In real implementation, this would trigger an API call
  };

  const viewProfile = (seafarerId: string) => {
    // Simulate viewing profile
    console.log(`Viewing profile for seafarer ${seafarerId}`);
    // In real implementation, this would navigate to profile page
  };

  const getCertificationOptions = () => {
    const allCerts = Array.from(new Set(seafarerProfiles.flatMap(s => s.certifications)));
    return allCerts;
  };

  const getVesselTypeOptions = () => {
    const allTypes = Array.from(new Set(seafarerProfiles.flatMap(s => s.vessel_types_experience)));
    return allTypes;
  };

  const getRouteOptions = () => {
    const allRoutes = Array.from(new Set(seafarerProfiles.flatMap(s => s.route_preferences)));
    return allRoutes;
  };

  return (
    <div className={styles.smartAssignmentCreation}>
      {/* Assignment Form Header */}
      <div className={styles.assignmentHeader}>
        <h2>Create New Assignment</h2>
        <AIBadge variant="primary">
          AI-Powered Matching
        </AIBadge>
      </div>

      {/* Template Selection */}
      <div className={styles.templateSection}>
        <h3>Quick Start Templates</h3>
        <div className={styles.templateGrid}>
          {assignmentTemplates.map((template) => (
            <button
              key={template.id}
              className={`${styles.templateCard} ${selectedTemplate === template.id ? styles.templateCardSelected : ''}`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className={styles.templateHeader}>
                <h4>{template.name}</h4>
                <span className={styles.templatePriority}>{template.priority_level}</span>
              </div>
              <div className={styles.templateDetails}>
                <span>{template.vessel_name}</span>
                <span>{template.route}</span>
                <span>{template.contract_duration} months</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Assignment Form */}
      <div className={styles.assignmentForm}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label>Vessel Name *</label>
            <input
              type="text"
              placeholder="e.g., MV Ocean Pioneer"
              value={assignment.vessel_name}
              onChange={(e) => handleAssignmentChange('vessel_name', e.target.value)}
            />
          </div>
          
          <div className={styles.formField}>
            <label>Position *</label>
            <select 
              value={assignment.position}
              onChange={(e) => handleAssignmentChange('position', e.target.value)}
            >
              <option value="">Select Position</option>
              <option value="Captain">Captain</option>
              <option value="Chief Officer">Chief Officer</option>
              <option value="Second Officer">Second Officer</option>
              <option value="Third Officer">Third Officer</option>
              <option value="Chief Engineer">Chief Engineer</option>
              <option value="Second Engineer">Second Engineer</option>
              <option value="Third Engineer">Third Engineer</option>
              <option value="Bosun">Bosun</option>
              <option value="Able Seaman">Able Seaman</option>
              <option value="Ordinary Seaman">Ordinary Seaman</option>
              <option value="Cook">Cook</option>
              <option value="Steward">Steward</option>
              <option value="Electrician">Electrician</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label>Vessel Type *</label>
            <select 
              value={assignment.vessel_type}
              onChange={(e) => handleAssignmentChange('vessel_type', e.target.value)}
            >
              <option value="">Select Vessel Type</option>
              {getVesselTypeOptions().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label>Route *</label>
            <select 
              value={assignment.route}
              onChange={(e) => handleAssignmentChange('route', e.target.value)}
            >
              <option value="">Select Route</option>
              {getRouteOptions().map(route => (
                <option key={route} value={route}>{route}</option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label>Minimum Experience (Years)</label>
            <input
              type="number"
              min="0"
              max="30"
              value={assignment.min_experience}
              onChange={(e) => handleAssignmentChange('min_experience', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className={styles.formField}>
            <label>Joining Date</label>
            <input
              type="date"
              value={assignment.joining_date.toISOString().split('T')[0]}
              onChange={(e) => handleAssignmentChange('joining_date', new Date(e.target.value))}
            />
          </div>

          <div className={styles.formField}>
            <label>Contract Duration (Months)</label>
            <select 
              value={assignment.contract_duration}
              onChange={(e) => handleAssignmentChange('contract_duration', parseInt(e.target.value))}
            >
              <option value={3}>3 months</option>
              <option value={4}>4 months</option>
              <option value={5}>5 months</option>
              <option value={6}>6 months</option>
              <option value={8}>8 months</option>
              <option value={10}>10 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label>Priority Level</label>
            <select 
              value={assignment.priority_level}
              onChange={(e) => handleAssignmentChange('priority_level', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Required Certifications */}
        <div className={styles.certificationsSection}>
          <label>Required Certifications</label>
          <div className={styles.certificationsGrid}>
            {getCertificationOptions().map(cert => (
              <label key={cert} className={styles.certificationCheckbox}>
                <input
                  type="checkbox"
                  checked={assignment.required_certifications.includes(cert)}
                  onChange={(e) => {
                    const newCerts = e.target.checked
                      ? [...assignment.required_certifications, cert]
                      : assignment.required_certifications.filter(c => c !== cert);
                    handleAssignmentChange('required_certifications', newCerts);
                  }}
                />
                <span>{cert}</span>
              </label>
            ))}
          </div>
        </div>

        {/* AI Processing Indicator */}
        <AIProcessingBanner 
          message="AI is analyzing qualified seafarers..."
          isVisible={isAIProcessing}
        />
      </div>

      {/* AI Match Results */}
      {matches.length > 0 && (
        <div className={styles.aiMatchResults}>
          <div className={styles.resultsHeader}>
            <h3>
              <AISparkleIcon size={20} />
              Smart Match Results
            </h3>
            {aiInsights && (
              <AIConfidenceIndicator 
                confidence={Math.round(aiInsights.success_probability)} 
                size="medium"
              />
            )}
          </div>

          <div className={styles.matchList}>
            {matches.slice(0, 5).map((match, index) => (
              <div key={match.seafarer.id} className={styles.matchCard}>
                <div className={styles.matchRank}>
                  <span className={styles.rankNumber}>#{index + 1}</span>
                  <AIMatchQualityBadge 
                    quality={match.match.match_quality}
                    score={match.match.overall_score}
                  />
                </div>

                <div className={styles.seafarerInfo}>
                  <div className={styles.seafarerHeader}>
                    <h4>{match.seafarer.name}</h4>
                    <span className={styles.seafarerRank}>{match.seafarer.rank}</span>
                  </div>
                  <div className={styles.seafarerDetails}>
                    <span>{match.seafarer.experience_years} years experience</span>
                    <span>Available {formatDaysUntil(match.seafarer.availability_date)}</span>
                    <span>{match.seafarer.nationality}</span>
                  </div>
                  <div className={styles.seafarerStats}>
                    <span>Performance: {match.seafarer.performance_rating}/5.0</span>
                    <span>Acceptance Rate: {match.seafarer.response_history.acceptance_rate}%</span>
                  </div>
                </div>

                <div className={styles.matchScore}>
                  <AIScoreCircle score={match.match.overall_score} size={60} />
                </div>

                <div className={styles.matchActions}>
                  <button 
                    className={styles.btnSecondary} 
                    onClick={() => viewProfile(match.seafarer.id)}
                  >
                    View Profile
                  </button>
                  <button 
                    className={styles.btnPrimary} 
                    onClick={() => sendAssignment(match.seafarer.id)}
                  >
                    Send Assignment
                  </button>
                </div>

                {/* AI Insights Toggle */}
                <AIInsightsToggle
                  isOpen={showAIInsights[match.seafarer.id] || false}
                  onClick={() => toggleAIInsights(match.seafarer.id)}
                  insightsCount={match.match.scoring_factors.length}
                />

                {/* Detailed AI Scoring Breakdown */}
                {showAIInsights[match.seafarer.id] && (
                  <div className={styles.aiInsightsPanel}>
                    <h5>AI Scoring Breakdown</h5>
                    <div className={styles.scoringFactors}>
                      {match.match.scoring_factors.map((factor, idx) => (
                        <div key={idx} className={styles.factorRow}>
                          <span className={styles.factorName}>{factor.factor}</span>
                          <div className={styles.factorBar}>
                            <div 
                              className={styles.factorFill} 
                              style={{ width: `${(factor.score / 30) * 100}%` }}
                            ></div>
                          </div>
                          <span className={styles.factorScore}>{Math.round(factor.score)}/30</span>
                        </div>
                      ))}
                    </div>
                    
                    {match.match.compatibility_notes.length > 0 && (
                      <div className={styles.compatibilityNotes}>
                        <h6>Compatibility Notes</h6>
                        <ul>
                          {match.match.compatibility_notes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {match.match.risk_factors.length > 0 && (
                      <div className={styles.riskFactors}>
                        <h6>Risk Factors</h6>
                        <ul>
                          {match.match.risk_factors.map((risk, idx) => (
                            <li key={idx}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          {aiInsights && (
            <div className={styles.aiRecommendations}>
              <div className={styles.recommendationHeader}>
                <AISparkleIcon size={20} />
                <h4>AI Recommendations</h4>
              </div>
              <div className={styles.recommendationCards}>
                {aiInsights.recommendations.map((rec: any, index: number) => (
                  <AIRecommendationCard
                    key={index}
                    icon={rec.icon}
                    title={rec.title}
                    description={rec.description}
                    priority={rec.priority}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartAssignmentCreation;
