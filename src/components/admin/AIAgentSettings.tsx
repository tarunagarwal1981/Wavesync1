/**
 * AI Agent Settings Panel (Admin Only)
 * Allows admins to enable/disable AI agent for specific companies
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, AlertCircle, CheckCircle, Settings, Zap } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email: string;
}

interface AIConfig {
  id?: string;
  company_id: string;
  is_enabled: boolean;
  autonomy_level: 'full' | 'semi' | 'assistant';
  min_match_score: number;
  advance_planning_days: number;
  auto_approve_threshold_usd: number;
  enabled_features: {
    crew_planning: boolean;
    task_generation: boolean;
    document_analysis: boolean;
    compliance_monitoring: boolean;
    travel_optimization: boolean;
  };
}

export default function AIAgentSettings() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [config, setConfig] = useState<AIConfig>({
    company_id: '',
    is_enabled: false,
    autonomy_level: 'semi',
    min_match_score: 85,
    advance_planning_days: 30,
    auto_approve_threshold_usd: 500,
    enabled_features: {
      crew_planning: true,
      task_generation: true,
      document_analysis: false,
      compliance_monitoring: false,
      travel_optimization: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchAIConfig(selectedCompany);
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setMessage({ type: 'error', text: 'Failed to load companies' });
    }
  };

  const fetchAIConfig = async (companyId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_agent_config')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      } else {
        // No config exists, use defaults
        setConfig({
          company_id: companyId,
          is_enabled: false,
          autonomy_level: 'semi',
          min_match_score: 85,
          advance_planning_days: 30,
          auto_approve_threshold_usd: 500,
          enabled_features: {
            crew_planning: true,
            task_generation: true,
            document_analysis: false,
            compliance_monitoring: false,
            travel_optimization: false,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching AI config:', error);
      setMessage({ type: 'error', text: 'Failed to load AI configuration' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedCompany) {
      setMessage({ type: 'error', text: 'Please select a company' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const configData = {
        ...config,
        company_id: selectedCompany,
        created_by: userData.user?.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ai_agent_config')
        .upsert(configData, {
          onConflict: 'company_id',
        });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `AI Agent ${config.is_enabled ? 'enabled' : 'disabled'} for ${companies.find(c => c.id === selectedCompany)?.name}` 
      });

      // Refresh config
      await fetchAIConfig(selectedCompany);
    } catch (error) {
      console.error('Error saving AI config:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ai-agent-settings">
      <div className="header">
        <div className="header-content">
          <div className="header-icon">
            <Zap size={32} />
          </div>
          <div>
            <h1>AI Agent Settings</h1>
            <p>Configure autonomous AI agent for crew planning and task automation</p>
          </div>
        </div>
      </div>

      <div className="settings-container">
        {/* Company Selection */}
        <div className="settings-card">
          <h2>Select Company</h2>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="company-select"
            disabled={loading}
          >
            <option value="">-- Select a company --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCompany && !loading && (
          <>
            {/* Enable/Disable AI */}
            <div className="settings-card">
              <div className="setting-row">
                <div className="setting-info">
                  <h3>AI Agent Status</h3>
                  <p>Enable or disable the AI agent for this company</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={config.is_enabled}
                    onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className={`status-badge ${config.is_enabled ? 'active' : 'inactive'}`}>
                {config.is_enabled ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    <span>Inactive</span>
                  </>
                )}
              </div>
            </div>

            {/* Autonomy Level */}
            <div className="settings-card">
              <h2>Autonomy Level</h2>
              <div className="autonomy-options">
                <label className={`autonomy-option ${config.autonomy_level === 'assistant' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="autonomy"
                    value="assistant"
                    checked={config.autonomy_level === 'assistant'}
                    onChange={(e) => setConfig({ ...config, autonomy_level: e.target.value as any })}
                  />
                  <div className="option-content">
                    <h4>Assistant Mode</h4>
                    <p>AI suggests only, company creates manually</p>
                  </div>
                </label>

                <label className={`autonomy-option ${config.autonomy_level === 'semi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="autonomy"
                    value="semi"
                    checked={config.autonomy_level === 'semi'}
                    onChange={(e) => setConfig({ ...config, autonomy_level: e.target.value as any })}
                  />
                  <div className="option-content">
                    <h4>Semi-Autonomous (Recommended)</h4>
                    <p>AI creates assignments, company approves</p>
                  </div>
                </label>

                <label className={`autonomy-option ${config.autonomy_level === 'full' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="autonomy"
                    value="full"
                    checked={config.autonomy_level === 'full'}
                    onChange={(e) => setConfig({ ...config, autonomy_level: e.target.value as any })}
                  />
                  <div className="option-content">
                    <h4>Full Autonomous</h4>
                    <p>AI acts independently (high trust)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="settings-card">
              <h2>Advanced Settings</h2>
              
              <div className="setting-row">
                <div className="setting-info">
                  <label>Minimum Match Score</label>
                  <p>AI will only suggest seafarers with match score above this threshold</p>
                </div>
                <div className="range-input">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={config.min_match_score}
                    onChange={(e) => setConfig({ ...config, min_match_score: parseInt(e.target.value) })}
                  />
                  <span className="range-value">{config.min_match_score}%</span>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <label>Advance Planning Window</label>
                  <p>How many days in advance AI should plan crew relief</p>
                </div>
                <div className="range-input">
                  <input
                    type="range"
                    min="7"
                    max="90"
                    value={config.advance_planning_days}
                    onChange={(e) => setConfig({ ...config, advance_planning_days: parseInt(e.target.value) })}
                  />
                  <span className="range-value">{config.advance_planning_days} days</span>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <label>Auto-Approve Threshold</label>
                  <p>Tasks below this amount can be auto-approved (USD)</p>
                </div>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="100"
                  value={config.auto_approve_threshold_usd}
                  onChange={(e) => setConfig({ ...config, auto_approve_threshold_usd: parseFloat(e.target.value) })}
                  className="number-input"
                />
              </div>
            </div>

            {/* Feature Flags */}
            <div className="settings-card">
              <h2>Enabled Features</h2>
              <div className="features-grid">
                <label className="feature-toggle">
                  <input
                    type="checkbox"
                    checked={config.enabled_features.crew_planning}
                    onChange={(e) => setConfig({
                      ...config,
                      enabled_features: { ...config.enabled_features, crew_planning: e.target.checked }
                    })}
                  />
                  <div className="feature-content">
                    <h4>Crew Planning</h4>
                    <p>Autonomous crew relief planning and seafarer matching</p>
                  </div>
                </label>

                <label className="feature-toggle">
                  <input
                    type="checkbox"
                    checked={config.enabled_features.task_generation}
                    onChange={(e) => setConfig({
                      ...config,
                      enabled_features: { ...config.enabled_features, task_generation: e.target.checked }
                    })}
                  />
                  <div className="feature-content">
                    <h4>Task Generation</h4>
                    <p>Auto-generate contextual tasks for assignments</p>
                  </div>
                </label>

                <label className="feature-toggle">
                  <input
                    type="checkbox"
                    checked={config.enabled_features.document_analysis}
                    onChange={(e) => setConfig({
                      ...config,
                      enabled_features: { ...config.enabled_features, document_analysis: e.target.checked }
                    })}
                    disabled
                  />
                  <div className="feature-content">
                    <h4>Document Analysis (Coming Soon)</h4>
                    <p>OCR and intelligent document processing</p>
                  </div>
                </label>

                <label className="feature-toggle">
                  <input
                    type="checkbox"
                    checked={config.enabled_features.compliance_monitoring}
                    onChange={(e) => setConfig({
                      ...config,
                      enabled_features: { ...config.enabled_features, compliance_monitoring: e.target.checked }
                    })}
                    disabled
                  />
                  <div className="feature-content">
                    <h4>Compliance Monitoring (Coming Soon)</h4>
                    <p>Proactive compliance and risk assessment</p>
                  </div>
                </label>

                <label className="feature-toggle">
                  <input
                    type="checkbox"
                    checked={config.enabled_features.travel_optimization}
                    onChange={(e) => setConfig({
                      ...config,
                      enabled_features: { ...config.enabled_features, travel_optimization: e.target.checked }
                    })}
                    disabled
                  />
                  <div className="feature-content">
                    <h4>Travel Optimization (Coming Soon)</h4>
                    <p>Intelligent travel route and cost optimization</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="actions">
              {message && (
                <div className={`message ${message.type}`}>
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{message.text}</span>
                </div>
              )}
              <button
                onClick={saveConfig}
                disabled={saving}
                className="save-button"
              >
                {saving ? (
                  <>
                    <Settings size={18} className="spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {loading && (
          <div className="loading-state">
            <Settings size={48} className="spin" />
            <p>Loading AI configuration...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .ai-agent-settings {
          padding: 2rem;
          max-width: 1200px;
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
          gap: 1.5rem;
        }

        .header-icon {
          background: rgba(255, 255, 255, 0.2);
          padding: 1rem;
          border-radius: 12px;
        }

        .header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .header p {
          margin: 0;
          opacity: 0.9;
        }

        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .settings-card h2 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .company-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
        }

        .company-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .setting-row:last-child {
          border-bottom: none;
        }

        .setting-info {
          flex: 1;
        }

        .setting-info label {
          font-weight: 600;
          color: #1f2937;
          display: block;
          margin-bottom: 0.25rem;
        }

        .setting-info p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 34px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        .toggle input:checked + .toggle-slider {
          background-color: #667eea;
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          margin-top: 1rem;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .autonomy-options {
          display: grid;
          gap: 1rem;
        }

        .autonomy-option {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .autonomy-option:hover {
          border-color: #667eea;
          background: #f9fafb;
        }

        .autonomy-option.selected {
          border-color: #667eea;
          background: #eef2ff;
        }

        .autonomy-option input {
          width: 20px;
          height: 20px;
        }

        .option-content h4 {
          margin: 0 0 0.25rem 0;
          color: #1f2937;
        }

        .option-content p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .range-input {
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 200px;
        }

        .range-input input[type="range"] {
          flex: 1;
        }

        .range-value {
          font-weight: 600;
          color: #667eea;
          min-width: 60px;
          text-align: right;
        }

        .number-input {
          padding: 0.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 1rem;
          width: 120px;
        }

        .features-grid {
          display: grid;
          gap: 1rem;
        }

        .feature-toggle {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
        }

        .feature-toggle:hover:not(:has(input:disabled)) {
          border-color: #667eea;
          background: #f9fafb;
        }

        .feature-toggle:has(input:checked) {
          border-color: #667eea;
          background: #eef2ff;
        }

        .feature-toggle:has(input:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .feature-toggle input {
          width: 20px;
          height: 20px;
        }

        .feature-content h4 {
          margin: 0 0 0.25rem 0;
          color: #1f2937;
        }

        .feature-content p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          flex: 1;
        }

        .message.success {
          background: #d1fae5;
          color: #065f46;
        }

        .message.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .save-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .save-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .loading-state p {
          margin-top: 1rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .ai-agent-settings {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .setting-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .range-input {
            width: 100%;
          }

          .actions {
            flex-direction: column;
          }

          .save-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

