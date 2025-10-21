/**
 * AI Performance Dashboard (Company Users)
 * Track AI agent performance metrics and insights
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bot, TrendingUp, Clock, CheckCircle, XCircle, Users, Activity } from 'lucide-react';

interface PerformanceMetrics {
  total_assignments: number;
  approved_assignments: number;
  rejected_assignments: number;
  approval_rate: number;
  avg_match_score: number;
  avg_review_time_hours: number;
  avg_processing_time_minutes: number;
  time_saved_hours: number;
}

interface RecentActivity {
  action_type: string;
  entity_type: string;
  entity_name: string;
  created_at: string;
  metadata: any;
}

export default function AIPerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
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

      // Calculate date range
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch performance summary
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_ai_performance_summary', {
          p_company_id: profile.company_id,
          p_start_date: startDate.toISOString()
        });

      if (metricsError) throw metricsError;
      
      if (metricsData && metricsData.length > 0) {
        setMetrics(metricsData[0]);
      }

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('ai_action_logs')
        .select('action_type, entity_type, entity_id, metadata, created_at')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) throw activityError;
      
      // Enrich activity with entity names
      const enrichedActivity = await Promise.all(
        (activityData || []).map(async (activity) => {
          let entityName = 'Unknown';
          
          if (activity.entity_type === 'assignment' && activity.entity_id) {
            const { data: assignment } = await supabase
              .from('assignments')
              .select('seafarer:user_profiles(full_name)')
              .eq('id', activity.entity_id)
              .single();
            
            entityName = (assignment as any)?.seafarer?.full_name || 'Unknown';
          }

          return {
            ...activity,
            entity_name: entityName
          };
        })
      );

      setRecentActivity(enrichedActivity);
    } catch (error) {
      console.error('Error fetching AI performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'assignment_created':
        return <Users size={16} />;
      case 'assignment_approved':
        return <CheckCircle size={16} />;
      case 'assignment_rejected':
        return <XCircle size={16} />;
      case 'crew_analysis':
        return <Activity size={16} />;
      default:
        return <Bot size={16} />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'assignment_approved':
        return '#10b981';
      case 'assignment_rejected':
        return '#ef4444';
      case 'assignment_created':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Bot size={48} className="spin" />
        <p>Loading AI performance data...</p>
      </div>
    );
  }

  return (
    <div className="ai-performance-dashboard">
      <div className="header">
        <div className="header-content">
          <Activity size={32} />
          <div>
            <h1>AI Agent Performance</h1>
            <p>Track AI automation effectiveness and insights</p>
          </div>
        </div>
        <div className="time-range-selector">
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button
            className={timeRange === '90d' ? 'active' : ''}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
        </div>
      </div>

      {metrics ? (
        <>
          {/* Key Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
                <Bot size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total AI Assignments</span>
                <span className="metric-value">{metrics.total_assignments}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
                <CheckCircle size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Approval Rate</span>
                <span className="metric-value">{Math.round(metrics.approval_rate)}%</span>
                <span className="metric-subtitle">
                  {metrics.approved_assignments} of {metrics.total_assignments}
                </span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
                <TrendingUp size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Avg Match Score</span>
                <span className="metric-value">{Math.round(metrics.avg_match_score)}%</span>
                <span className="metric-subtitle">
                  {'⭐'.repeat(Math.round(metrics.avg_match_score / 20))}
                </span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#e9d5ff', color: '#6b21a8' }}>
                <Clock size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Time Saved</span>
                <span className="metric-value">{Math.round(metrics.time_saved_hours)}h</span>
                <span className="metric-subtitle">
                  ≈ {Math.round(metrics.time_saved_hours / 8)} work days
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="stats-grid">
            <div className="stats-card">
              <h3>Assignment Breakdown</h3>
              <div className="chart-container">
                <div className="pie-chart">
                  <div 
                    className="pie-slice approved"
                    style={{
                      '--percentage': `${metrics.approval_rate}%`
                    } as React.CSSProperties}
                  />
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot approved"></span>
                    <span>Approved: {metrics.approved_assignments}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot rejected"></span>
                    <span>Rejected: {metrics.rejected_assignments}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <h3>Efficiency Metrics</h3>
              <div className="efficiency-list">
                <div className="efficiency-item">
                  <span className="efficiency-label">Avg Processing Time</span>
                  <span className="efficiency-value">
                    {Math.round(metrics.avg_processing_time_minutes)} min
                  </span>
                </div>
                <div className="efficiency-item">
                  <span className="efficiency-label">Avg Review Time</span>
                  <span className="efficiency-value">
                    {Math.round(metrics.avg_review_time_hours)} hrs
                  </span>
                </div>
                <div className="efficiency-item">
                  <span className="efficiency-label">Time per Assignment</span>
                  <span className="efficiency-value">
                    {Math.round(
                      (metrics.avg_processing_time_minutes + metrics.avg_review_time_hours * 60) / 60
                    )} hrs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h2>Recent AI Activity</h2>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <div 
                      className="activity-icon"
                      style={{ color: getActionColor(activity.action_type) }}
                    >
                      {getActionIcon(activity.action_type)}
                    </div>
                    <div className="activity-content">
                      <span className="activity-action">
                        {formatActionType(activity.action_type)}
                      </span>
                      <span className="activity-details">
                        {activity.entity_type === 'assignment' && activity.entity_name}
                      </span>
                    </div>
                    <span className="activity-time">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-activity">
                  <Bot size={32} />
                  <p>No recent AI activity</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <Bot size={64} />
          <h2>No AI Performance Data Yet</h2>
          <p>The AI agent hasn't created any assignments in the selected time range.</p>
          <p className="hint">Check back after the AI agent has been active for a while.</p>
        </div>
      )}

      <style>{`
        .ai-performance-dashboard {
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
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .time-range-selector {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem;
          border-radius: 8px;
        }

        .time-range-selector button {
          padding: 0.5rem 1rem;
          background: transparent;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .time-range-selector button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .time-range-selector button.active {
          background: white;
          color: #667eea;
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

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .metric-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-content {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }

        .metric-subtitle {
          font-size: 0.875rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stats-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stats-card h3 {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
        }

        .chart-container {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .pie-chart {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(
            #10b981 0% var(--percentage),
            #ef4444 var(--percentage) 100%
          );
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-dot.approved {
          background: #10b981;
        }

        .legend-dot.rejected {
          background: #ef4444;
        }

        .efficiency-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .efficiency-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .efficiency-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .efficiency-value {
          font-weight: 700;
          color: #1f2937;
        }

        .activity-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .activity-section h2 {
          margin: 0 0 1rem 0;
          color: #1f2937;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .activity-action {
          font-weight: 600;
          color: #1f2937;
        }

        .activity-details {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .activity-time {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .empty-activity {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: #6b7280;
        }

        .empty-activity p {
          margin-top: 0.5rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ai-performance-dashboard {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .metrics-grid,
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .time-range-selector {
            width: 100%;
          }

          .time-range-selector button {
            flex: 1;
          }

          .activity-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .activity-time {
            width: 100%;
            text-align: right;
          }
        }
      `}</style>
    </div>
  );
}


