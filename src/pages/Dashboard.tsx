import React from "react";

export const Dashboard: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Welcome Section */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              color: '#111827',
              marginBottom: '8px'
            }}>
              Welcome back, Captain Nemo!
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Here's what's happening with your assignments and documents.
            </p>
          </div>
          <button style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Create Assignment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {[
          { title: 'Pending Assignments', value: '3', change: '+12%', color: '#3b82f6' },
          { title: 'Active Contracts', value: '1', change: '+5%', color: '#10b981' },
          { title: 'Documents Expiring', value: '2', change: '-8%', color: '#f59e0b' },
          { title: 'Training Due', value: '4', change: '+20%', color: '#8b5cf6' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#6b7280',
                margin: 0
              }}>
                {stat.title}
              </h3>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `${stat.color}20`,
                display: 'grid',
                placeItems: 'center',
                color: stat.color,
                fontSize: '16px'
              }}>
                📊
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#111827'
              }}>
                {stat.value}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: stat.change.startsWith('+') ? '#10b981' : '#ef4444'
              }}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        {/* Quick Actions */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { label: 'New Assignment', icon: '📋' },
              { label: 'Upload Document', icon: '📄' },
              { label: 'Invite Seafarer', icon: '👥' }
            ].map((action, index) => (
              <button key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                background: '#fff',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
              >
                <span style={{ fontSize: '16px' }}>{action.icon}</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            Recent Activity
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { title: 'Signed contract for MV Ocean Star', time: '2h ago' },
              { title: 'Uploaded Medical Certificate', time: '4h ago' },
              { title: 'Assignment proposed for MV Blue Horizon', time: 'Yesterday' }
            ].map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                border: '1px solid #f3f4f6',
                borderRadius: '12px',
                background: '#f9fafb'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#3b82f6'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                    {activity.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;