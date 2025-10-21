/**
 * AI Assignment Queue (Company Users)
 * View and approve/reject AI-generated assignments
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, Bot, User, Ship, TrendingUp, Calendar, Award } from 'lucide-react';

interface AIAssignment {
  ai_assignment_id: string;
  assignment_id: string;
  seafarer_name: string;
  vessel_name: string;
  match_score: number;
  ai_reasoning: {
    relief_analysis: any;
    match_details: {
      reasoning: string;
      strengths: string[];
      risks: string[];
      recommendations: string[];
    };
    alternatives: any[];
  };
  created_at: string;
}

export default function AIAssignmentQueue() {
  const [assignments, setAssignments] = useState<AIAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<AIAssignment | null>(null);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingAssignments();
  }, []);

  const fetchPendingAssignments = async () => {
    try {
      setLoading(true);
      
      // Get current user's company
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userData.user?.id)
        .single();

      if (!profile?.company_id) return;

      // Get pending AI assignments
      const { data, error } = await supabase
        .rpc('get_pending_ai_assignments', { p_company_id: profile.company_id });

      if (error) throw error;
      
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching AI assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (aiAssignmentId: string) => {
    try {
      setProcessing(true);
      
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .rpc('approve_ai_assignment', {
          p_ai_assignment_id: aiAssignmentId,
          p_user_id: userData.user?.id,
          p_feedback: feedback || null
        });

      if (error) throw error;

      // Refresh list
      await fetchPendingAssignments();
      setSelectedAssignment(null);
      setFeedback('');
    } catch (error) {
      console.error('Error approving assignment:', error);
      alert('Failed to approve assignment');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (aiAssignmentId: string) => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }

    try {
      setProcessing(true);
      
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .rpc('reject_ai_assignment', {
          p_ai_assignment_id: aiAssignmentId,
          p_user_id: userData.user?.id,
          p_feedback: feedback
        });

      if (error) throw error;

      // Refresh list
      await fetchPendingAssignments();
      setSelectedAssignment(null);
      setFeedback('');
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      alert('Failed to reject assignment');
    } finally {
      setProcessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreStars = (score: number) => {
    const stars = Math.round(score / 20);
    return '⭐'.repeat(stars);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Bot size={48} className="spin" />
        <p>Loading AI-generated assignments...</p>
      </div>
    );
  }

  return (
    <div className="ai-assignment-queue">
      <div className="header">
        <div className="header-content">
          <Bot size={32} />
          <div>
            <h1>AI-Generated Assignments</h1>
            <p>{assignments.length} assignment{assignments.length !== 1 ? 's' : ''} pending your review</p>
          </div>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state">
          <Bot size={64} />
          <h2>No Pending AI Assignments</h2>
          <p>The AI agent hasn't created any assignments yet, or all have been reviewed.</p>
          <p className="hint">The AI agent runs daily at 6 AM to analyze crew relief needs.</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((assignment) => (
            <div key={assignment.ai_assignment_id} className="assignment-card">
              <div className="card-header">
                <div className="badge ai-badge">
                  <Bot size={14} />
                  <span>AI Generated</span>
                </div>
                <div 
                  className="match-score" 
                  style={{ color: getScoreColor(assignment.match_score) }}
                >
                  {getScoreStars(assignment.match_score)}
                  <span>{Math.round(assignment.match_score)}%</span>
                </div>
              </div>

              <div className="card-body">
                <div className="assignment-info">
                  <div className="info-row">
                    <User size={18} />
                    <div>
                      <span className="label">Recommended Seafarer</span>
                      <span className="value">{assignment.seafarer_name}</span>
                    </div>
                  </div>

                  <div className="info-row">
                    <Ship size={18} />
                    <div>
                      <span className="label">Vessel</span>
                      <span className="value">{assignment.vessel_name}</span>
                    </div>
                  </div>

                  <div className="info-row">
                    <Calendar size={18} />
                    <div>
                      <span className="label">Created</span>
                      <span className="value">
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {assignment.ai_reasoning?.match_details && (
                  <div className="reasoning">
                    <h4>AI Reasoning:</h4>
                    <p>{assignment.ai_reasoning.match_details.reasoning}</p>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button 
                  onClick={() => setSelectedAssignment(assignment)}
                  className="button-secondary"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleApprove(assignment.ai_assignment_id)}
                  disabled={processing}
                  className="button-approve"
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAssignment && (
        <div className="modal-overlay" onClick={() => setSelectedAssignment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>AI Assignment Details</h2>
              <button onClick={() => setSelectedAssignment(null)} className="close-button">
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Match Score */}
              <div className="detail-section">
                <h3>Match Score</h3>
                <div 
                  className="score-display" 
                  style={{ color: getScoreColor(selectedAssignment.match_score) }}
                >
                  <TrendingUp size={32} />
                  <span className="score-number">{Math.round(selectedAssignment.match_score)}%</span>
                  <span className="score-stars">{getScoreStars(selectedAssignment.match_score)}</span>
                </div>
              </div>

              {/* Strengths */}
              {selectedAssignment.ai_reasoning?.match_details?.strengths && (
                <div className="detail-section">
                  <h3><CheckCircle size={20} /> Strengths</h3>
                  <ul className="strength-list">
                    {selectedAssignment.ai_reasoning.match_details.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {selectedAssignment.ai_reasoning?.match_details?.risks?.length > 0 && (
                <div className="detail-section">
                  <h3><AlertCircle size={20} /> Risk Factors</h3>
                  <ul className="risk-list">
                    {selectedAssignment.ai_reasoning.match_details.risks.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {selectedAssignment.ai_reasoning?.match_details?.recommendations && (
                <div className="detail-section">
                  <h3><Award size={20} /> Recommendations</h3>
                  <ul className="recommendation-list">
                    {selectedAssignment.ai_reasoning.match_details.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternatives */}
              {selectedAssignment.ai_reasoning?.alternatives?.length > 0 && (
                <div className="detail-section">
                  <h3>Alternative Candidates</h3>
                  <div className="alternatives">
                    {selectedAssignment.ai_reasoning.alternatives.map((alt, idx) => (
                      <div key={idx} className="alternative-card">
                        <div className="alt-header">
                          <span className="alt-rank">#{idx + 2}</span>
                          <span className="alt-score">{Math.round(alt.match_score)}%</span>
                        </div>
                        <p className="alt-reason">{alt.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="detail-section">
                <h3>Your Feedback (Optional)</h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add your feedback or notes about this AI recommendation..."
                  rows={3}
                  className="feedback-textarea"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => handleReject(selectedAssignment.ai_assignment_id)}
                disabled={processing}
                className="button-reject"
              >
                <XCircle size={18} />
                {processing ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedAssignment.ai_assignment_id)}
                disabled={processing}
                className="button-approve"
              >
                <CheckCircle size={18} />
                {processing ? 'Processing...' : 'Approve & Send to Seafarer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ai-assignment-queue {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 2rem;
          color: white;
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .header p {
          margin: 0;
          opacity: 0.9;
        }

        .loading-container, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #6b7280;
          text-align: center;
        }

        .empty-state h2 {
          margin: 1rem 0 0.5rem 0;
          color: #1f2937;
        }

        .empty-state p {
          margin: 0.25rem 0;
        }

        .empty-state .hint {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .assignments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .assignment-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s;
        }

        .assignment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .ai-badge {
          background: #dbeafe;
          color: #1e40af;
        }

        .match-score {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .card-body {
          padding: 1.5rem;
        }

        .assignment-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .info-row svg {
          color: #667eea;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-row > div {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          font-weight: 600;
          color: #1f2937;
          margin-top: 0.125rem;
        }

        .reasoning {
          margin-top: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-left: 4px solid #667eea;
          border-radius: 6px;
        }

        .reasoning h4 {
          margin: 0 0 0.5rem 0;
          color: #667eea;
          font-size: 0.875rem;
        }

        .reasoning p {
          margin: 0;
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }

        .button-secondary {
          flex: 1;
          padding: 0.625rem 1rem;
          border: 2px solid #e5e7eb;
          background: white;
          color: #374151;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .button-secondary:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .button-approve {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .button-approve:hover:not(:disabled) {
          background: #059669;
        }

        .button-approve:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-reject {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .button-reject:hover:not(:disabled) {
          background: #dc2626;
        }

        .button-reject:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 2rem;
          color: #6b7280;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
        }

        .close-button:hover {
          color: #1f2937;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-section h3 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .score-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .score-number {
          font-size: 2.5rem;
          font-weight: 700;
        }

        .score-stars {
          font-size: 1.5rem;
        }

        .strength-list,
        .risk-list,
        .recommendation-list {
          margin: 0;
          padding-left: 1.5rem;
        }

        .strength-list li {
          color: #059669;
          margin-bottom: 0.5rem;
        }

        .risk-list li {
          color: #dc2626;
          margin-bottom: 0.5rem;
        }

        .recommendation-list li {
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }

        .alternatives {
          display: grid;
          gap: 1rem;
        }

        .alternative-card {
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
        }

        .alt-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .alt-rank {
          font-weight: 700;
          color: #6b7280;
        }

        .alt-score {
          font-weight: 700;
          color: #667eea;
        }

        .alt-reason {
          margin: 0;
          font-size: 0.875rem;
          color: #374151;
        }

        .feedback-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
        }

        .feedback-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 2px solid #e5e7eb;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ai-assignment-queue {
            padding: 1rem;
          }

          .assignments-grid {
            grid-template-columns: 1fr;
          }

          .modal-overlay {
            padding: 1rem;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}


