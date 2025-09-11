import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Bell, 
  TrendingUp, 
  Activity, 
  Zap, 
  RefreshCw, 
  Play, 
  Pause, 
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Users,
  Briefcase,
  FileText,
  GraduationCap,
  CheckSquare
} from 'lucide-react';

interface InteractiveFeaturesProps {
  onFeatureToggle?: (feature: string, enabled: boolean) => void;
}

const InteractiveFeatures: React.FC<InteractiveFeaturesProps> = ({ onFeatureToggle }) => {
  const { state, dispatch } = useApp();
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLiveMode || !realTimeUpdates) return;

    const interval = setInterval(() => {
      // Simulate random updates
      const randomUpdate = Math.random();
      
      if (randomUpdate < 0.1) {
        // Simulate new assignment
        const newAssignment = {
          id: `assign_${Date.now()}`,
          seafarerId: 'user1',
          vesselId: 'vessel1',
          vessel: state.assignments[0]?.vessel || { name: 'MV OCEAN PIONEER', type: 'container' },
          position: 'second_officer' as any,
          department: 'deck' as any,
          joiningDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          signingOffDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          contractDuration: 3,
          salary: 7500,
          currency: 'USD',
          overtimeRate: 40,
          leaveDays: 7,
          status: 'pending' as any,
          companyId: 'COMP001',
          companyName: 'Ocean Logistics Ltd',
          requiredDocuments: [],
          mobilizationChecklist: [],
          contractTerms: {} as any,
          benefits: {} as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          id: `notif_${Date.now()}`,
          userId: 'user1',
          type: 'assignment' as any,
          priority: 'high' as any,
          title: 'New Assignment Available',
          message: `New assignment: ${newAssignment.vessel.name} - ${newAssignment.position}`,
          read: false,
          actionUrl: `/assignments/${newAssignment.id}`,
          metadata: {
            assignmentId: newAssignment.id,
            vesselId: newAssignment.vesselId,
            entityType: 'assignment',
            entityId: newAssignment.id,
            customData: {
              vesselName: newAssignment.vessel.name,
              position: newAssignment.position,
              expiryDate: newAssignment.expiresAt
            }
          },
          expiresAt: newAssignment.expiresAt,
          createdAt: new Date().toISOString(),
        }});
        
        if (notificationsEnabled) {
          dispatch({ type: 'SET_SUCCESS', payload: 'New assignment notification received!' });
        }
      } else if (randomUpdate < 0.2) {
        // Simulate task progress update
        const randomTask = state.tasks[Math.floor(Math.random() * state.tasks.length)];
        if (randomTask && randomTask.status === 'in_progress') {
          const newProgress = Math.min(randomTask.progress + Math.floor(Math.random() * 20), 100);
          dispatch({ type: 'UPDATE_TASK', payload: { 
            id: randomTask.id, 
            updates: { progress: newProgress } 
          }});
          
          if (newProgress === 100) {
            dispatch({ type: 'COMPLETE_TASK', payload: randomTask.id });
            if (notificationsEnabled) {
              dispatch({ type: 'SET_SUCCESS', payload: `Task "${randomTask.title}" completed!` });
            }
          }
        }
      } else if (randomUpdate < 0.3) {
        // Simulate document expiry warning
        const randomDoc = state.documents[Math.floor(Math.random() * state.documents.length)];
        if (randomDoc) {
          const daysUntilExpiry = Math.ceil((new Date(randomDoc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: {
              id: `notif_expiry_${Date.now()}`,
              userId: 'user1',
              type: 'document' as any,
              priority: 'medium' as any,
              title: 'Document Expiring Soon',
              message: `${randomDoc.title} expires in ${daysUntilExpiry} days`,
              read: false,
              actionUrl: `/documents/${randomDoc.id}`,
              metadata: {
                documentId: randomDoc.id,
                entityType: 'document',
                entityId: randomDoc.id,
                customData: {
                  documentType: randomDoc.title,
                  expiryDate: randomDoc.expiryDate,
                  daysUntilExpiry
                }
              },
              expiresAt: randomDoc.expiryDate,
              createdAt: new Date().toISOString(),
            }});
          }
        }
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isLiveMode, realTimeUpdates, notificationsEnabled, state.assignments, state.tasks, state.documents, dispatch]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      setTimeout(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_SUCCESS', payload: 'Data refreshed successfully!' });
      }, 1000);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, dispatch]);

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    onFeatureToggle?.(feature, enabled);
  };

  const playNotificationSound = () => {
    if (soundEnabled) {
      // In a real app, you would play an actual sound
      console.log('🔔 Notification sound played');
    }
  };

  const triggerVibration = () => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const simulateNotification = () => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: `demo_${Date.now()}`,
      userId: 'user1',
      type: 'system' as any,
      priority: 'info' as any,
      title: 'Demo Notification',
      message: 'This is a demo notification to test the system',
      read: false,
      actionUrl: undefined,
      metadata: {
        entityType: 'system',
        customData: {
          demo: true
        }
      },
      expiresAt: undefined,
      createdAt: new Date().toISOString(),
    }});
    
    playNotificationSound();
    triggerVibration();
  };

  const simulateError = () => {
    dispatch({ type: 'SET_ERROR', payload: 'This is a demo error message' });
  };

  const simulateSuccess = () => {
    dispatch({ type: 'SET_SUCCESS', payload: 'This is a demo success message' });
  };

  const simulateWarning = () => {
    dispatch({ type: 'SET_ERROR', payload: 'This is a demo warning message' });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '16px',
      minWidth: '300px',
      zIndex: 1000,
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Zap size={20} color="#3b82f6" />
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
          Interactive Features
        </h3>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isLiveMode ? '#10b981' : '#6b7280',
          animation: isLiveMode ? 'pulse 2s infinite' : 'none'
        }} />
      </div>

      {/* Live Mode Toggle */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isLiveMode}
            onChange={(e) => {
              setIsLiveMode(e.target.checked);
              handleFeatureToggle('liveMode', e.target.checked);
            }}
            style={{ margin: 0 }}
          />
          <Activity size={16} color="#3b82f6" />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
            Live Mode
          </span>
        </label>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 24px' }}>
          Enable real-time updates and notifications
        </p>
      </div>

      {/* Auto Refresh */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => {
              setAutoRefresh(e.target.checked);
              handleFeatureToggle('autoRefresh', e.target.checked);
            }}
            style={{ margin: 0 }}
          />
          <RefreshCw size={16} color="#3b82f6" />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
            Auto Refresh
          </span>
        </label>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 24px' }}>
          Automatically refresh data every 30 seconds
        </p>
      </div>

      {/* Notifications */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => {
              setNotificationsEnabled(e.target.checked);
              handleFeatureToggle('notifications', e.target.checked);
            }}
            style={{ margin: 0 }}
          />
          <Bell size={16} color="#3b82f6" />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
            Notifications
          </span>
        </label>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 24px' }}>
          Show notification toasts
        </p>
      </div>

      {/* Sound */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => {
              setSoundEnabled(e.target.checked);
              handleFeatureToggle('sound', e.target.checked);
            }}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
            🔊 Sound
          </span>
        </label>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 24px' }}>
          Play notification sounds
        </p>
      </div>

      {/* Vibration */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={vibrationEnabled}
            onChange={(e) => {
              setVibrationEnabled(e.target.checked);
              handleFeatureToggle('vibration', e.target.checked);
            }}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
            📳 Vibration
          </span>
        </label>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 24px' }}>
          Vibrate on notifications (mobile)
        </p>
      </div>

      {/* Demo Actions */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', color: '#1f2937' }}>
          Demo Actions
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={simulateNotification}
            style={{
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Bell size={12} />
            Test Notification
          </button>
          
          <button
            onClick={simulateSuccess}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <CheckCircle size={12} />
            Success
          </button>
          
          <button
            onClick={simulateError}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AlertTriangle size={12} />
            Error
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', color: '#1f2937' }}>
          System Status
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Live Updates: {isLiveMode ? 'ON' : 'OFF'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: autoRefresh ? '#10b981' : '#6b7280' }} />
            <span>Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: notificationsEnabled ? '#10b981' : '#6b7280' }} />
            <span>Notifications: {notificationsEnabled ? 'ON' : 'OFF'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: soundEnabled ? '#10b981' : '#6b7280' }} />
            <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default InteractiveFeatures;
