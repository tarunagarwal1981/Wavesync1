// Admin stub pages
import React from 'react';

export const AdminAnalyticsPage: React.FC = () => {
  const analyticsData = {
    systemMetrics: {
      totalUsers: 1245,
      activeUsers: 1189,
      totalCompanies: 68,
      activeCompanies: 62,
      systemUptime: '99.8%',
      averageResponseTime: '245ms'
    },
    userActivity: {
      dailyLogins: 342,
      weeklyActiveUsers: 892,
      monthlyActiveUsers: 1189,
      averageSessionDuration: '2.4 hours'
    },
    platformStats: {
      totalAssignments: 2347,
      activeAssignments: 234,
      completedAssignments: 1987,
      pendingAssignments: 126,
      totalDocuments: 15678,
      totalNotifications: 8945
    },
    performanceMetrics: {
      serverLoad: '23%',
      databaseQueries: '1.2M/hour',
      storageUsed: '2.4TB',
      bandwidthUsage: '45GB/day'
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        System Analytics
      </h1>
      
      {/* System Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            User Metrics
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Total Users:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{analyticsData.systemMetrics.totalUsers.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Active Users:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{analyticsData.systemMetrics.activeUsers.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Daily Logins:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{analyticsData.userActivity.dailyLogins}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Avg Session:</span>
              <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{analyticsData.userActivity.averageSessionDuration}</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Company Metrics
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Total Companies:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{analyticsData.systemMetrics.totalCompanies}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Active Companies:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{analyticsData.systemMetrics.activeCompanies}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Weekly Active:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{analyticsData.userActivity.weeklyActiveUsers}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Monthly Active:</span>
              <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{analyticsData.userActivity.monthlyActiveUsers}</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Platform Stats
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Total Assignments:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{analyticsData.platformStats.totalAssignments.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Active Assignments:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{analyticsData.platformStats.activeAssignments}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Total Documents:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{analyticsData.platformStats.totalDocuments.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Notifications:</span>
              <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{analyticsData.platformStats.totalNotifications.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            System Performance
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Uptime:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{analyticsData.systemMetrics.systemUptime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Response Time:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{analyticsData.systemMetrics.averageResponseTime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Server Load:</span>
              <span style={{ fontWeight: '600', color: '#f59e0b' }}>{analyticsData.performanceMetrics.serverLoad}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Storage Used:</span>
              <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{analyticsData.performanceMetrics.storageUsed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          System Performance Trends
        </h3>
        <div style={{
          height: '300px',
          background: '#f9fafb',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '16px'
        }}>
          📊 Real-time System Analytics Dashboard Coming Soon
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <button style={{
            padding: '16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Generate System Report</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Comprehensive system analysis</div>
          </button>
          <button style={{
            padding: '16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>User Activity Report</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Detailed user engagement metrics</div>
          </button>
          <button style={{
            padding: '16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Performance Report</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>System performance analysis</div>
          </button>
          <button style={{
            padding: '16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Export Analytics</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Export all analytics data</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export const PerformanceMonitorPage: React.FC = () => {
  const performanceData = {
    serverMetrics: {
      cpuUsage: '23%',
      memoryUsage: '67%',
      diskUsage: '45%',
      networkLatency: '12ms',
      activeConnections: 1247,
      requestsPerSecond: 342
    },
    databaseMetrics: {
      queryTime: '45ms',
      connectionPool: '78/100',
      cacheHitRate: '94.2%',
      slowQueries: 12,
      deadlocks: 0,
      locks: 23
    },
    applicationMetrics: {
      responseTime: '245ms',
      errorRate: '0.12%',
      throughput: '1.2M req/hour',
      uptime: '99.8%',
      memoryLeaks: 0,
      gcTime: '15ms'
    },
    alerts: [
      { id: 1, type: 'warning', message: 'Memory usage above 70%', timestamp: '2 minutes ago', status: 'active' },
      { id: 2, type: 'info', message: 'Scheduled maintenance in 2 hours', timestamp: '15 minutes ago', status: 'scheduled' },
      { id: 3, type: 'success', message: 'Database optimization completed', timestamp: '1 hour ago', status: 'resolved' }
    ]
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Performance Monitor
      </h1>
      
      {/* Server Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Server Performance
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>CPU Usage:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{performanceData.serverMetrics.cpuUsage}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Memory Usage:</span>
              <span style={{ fontWeight: '600', color: '#f59e0b' }}>{performanceData.serverMetrics.memoryUsage}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Disk Usage:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{performanceData.serverMetrics.diskUsage}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Network Latency:</span>
              <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{performanceData.serverMetrics.networkLatency}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Active Connections:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{performanceData.serverMetrics.activeConnections.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Requests/sec:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{performanceData.serverMetrics.requestsPerSecond}</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Database Performance
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Query Time:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{performanceData.databaseMetrics.queryTime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Connection Pool:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{performanceData.databaseMetrics.connectionPool}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Cache Hit Rate:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{performanceData.databaseMetrics.cacheHitRate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Slow Queries:</span>
              <span style={{ fontWeight: '600', color: '#f59e0b' }}>{performanceData.databaseMetrics.slowQueries}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Deadlocks:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{performanceData.databaseMetrics.deadlocks}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Active Locks:</span>
              <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{performanceData.databaseMetrics.locks}</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Application Metrics
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Response Time:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{performanceData.applicationMetrics.responseTime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Error Rate:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{performanceData.applicationMetrics.errorRate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Throughput:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{performanceData.applicationMetrics.throughput}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Uptime:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{performanceData.applicationMetrics.uptime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Memory Leaks:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{performanceData.applicationMetrics.memoryLeaks}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>GC Time:</span>
              <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{performanceData.applicationMetrics.gcTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Charts */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Real-time Performance Charts
        </h3>
        <div style={{
          height: '300px',
          background: '#f9fafb',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '16px'
        }}>
          📈 Live Performance Monitoring Dashboard Coming Soon
        </div>
      </div>

      {/* System Alerts */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Recent System Alerts
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {performanceData.alerts.map((alert) => (
            <div key={alert.id} style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: alert.type === 'warning' ? '#f59e0b' : alert.type === 'success' ? '#22c55e' : '#3b82f6'
                }}></div>
                <div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{alert.message}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{alert.timestamp}</div>
                </div>
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                background: alert.status === 'active' ? '#fef3c7' : alert.status === 'scheduled' ? '#dbeafe' : '#d1fae5',
                color: alert.status === 'active' ? '#92400e' : alert.status === 'scheduled' ? '#1e40af' : '#065f46'
              }}>
                {alert.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SystemAlertsPage: React.FC = () => {
  const alertsData = {
    critical: [
      { id: 1, title: 'Database Connection Pool Exhausted', message: 'Connection pool has reached 95% capacity', timestamp: '2 minutes ago', severity: 'critical', status: 'active' },
      { id: 2, title: 'High Memory Usage Detected', message: 'Server memory usage has exceeded 90%', timestamp: '5 minutes ago', severity: 'critical', status: 'investigating' }
    ],
    warning: [
      { id: 3, title: 'Slow Query Performance', message: 'Average query time has increased by 200%', timestamp: '15 minutes ago', severity: 'warning', status: 'monitoring' },
      { id: 4, title: 'Disk Space Low', message: 'Disk usage has reached 85% capacity', timestamp: '1 hour ago', severity: 'warning', status: 'active' },
      { id: 5, title: 'Unusual Login Activity', message: 'Detected 50+ failed login attempts from single IP', timestamp: '2 hours ago', severity: 'warning', status: 'resolved' }
    ],
    info: [
      { id: 6, title: 'Scheduled Maintenance', message: 'System maintenance scheduled for tonight at 2 AM', timestamp: '3 hours ago', severity: 'info', status: 'scheduled' },
      { id: 7, title: 'Backup Completed', message: 'Daily backup completed successfully', timestamp: '6 hours ago', severity: 'info', status: 'completed' },
      { id: 8, title: 'New User Registration', message: '5 new companies registered today', timestamp: '8 hours ago', severity: 'info', status: 'completed' }
    ]
  };


  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        System Alerts
      </h1>
      
      {/* Alert Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>2</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Critical Alerts</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>3</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Warning Alerts</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6', marginBottom: '8px' }}>3</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Info Alerts</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#22c55e', marginBottom: '8px' }}>5</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Resolved Today</div>
        </div>
      </div>

      {/* Critical Alerts */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Critical Alerts
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {alertsData.critical.map((alert) => (
            <div key={alert.id} style={{
              padding: '16px',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              background: '#fef2f2'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {alert.title}
                </h4>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#fecaca',
                  color: '#991b1b'
                }}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>{alert.message}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{alert.timestamp}</span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: alert.status === 'active' ? '#fecaca' : '#fef3c7',
                  color: alert.status === 'active' ? '#991b1b' : '#92400e'
                }}>
                  {alert.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Alerts */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Warning Alerts
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {alertsData.warning.map((alert) => (
            <div key={alert.id} style={{
              padding: '16px',
              border: '1px solid #fed7aa',
              borderRadius: '8px',
              background: '#fffbeb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {alert.title}
                </h4>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#fed7aa',
                  color: '#92400e'
                }}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>{alert.message}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{alert.timestamp}</span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: alert.status === 'active' ? '#fecaca' : alert.status === 'monitoring' ? '#dbeafe' : '#d1fae5',
                  color: alert.status === 'active' ? '#991b1b' : alert.status === 'monitoring' ? '#1e40af' : '#065f46'
                }}>
                  {alert.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Alerts */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Information Alerts
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {alertsData.info.map((alert) => (
            <div key={alert.id} style={{
              padding: '16px',
              border: '1px solid #dbeafe',
              borderRadius: '8px',
              background: '#eff6ff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {alert.title}
                </h4>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#dbeafe',
                  color: '#1e40af'
                }}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>{alert.message}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{alert.timestamp}</span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: alert.status === 'scheduled' ? '#e0e7ff' : '#d1fae5',
                  color: alert.status === 'scheduled' ? '#3730a3' : '#065f46'
                }}>
                  {alert.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AllUsersPage: React.FC = () => {
  const usersData = {
    seafarers: [
      { id: 1, name: 'John Smith', email: 'john.smith@maritime.com', role: 'Seafarer', rank: 'Captain', status: 'Active', lastLogin: '2 hours ago', company: 'Ocean Shipping Ltd' },
      { id: 2, name: 'Maria Garcia', email: 'maria.garcia@maritime.com', role: 'Seafarer', rank: 'Chief Officer', status: 'Active', lastLogin: '1 hour ago', company: 'Pacific Lines' },
      { id: 3, name: 'Ahmed Hassan', email: 'ahmed.hassan@maritime.com', role: 'Seafarer', rank: 'Chief Engineer', status: 'Inactive', lastLogin: '3 days ago', company: 'Atlantic Maritime' },
      { id: 4, name: 'Li Wei', email: 'li.wei@maritime.com', role: 'Seafarer', rank: 'Second Officer', status: 'Active', lastLogin: '30 minutes ago', company: 'Global Shipping Co' },
      { id: 5, name: 'Elena Petrov', email: 'elena.petrov@maritime.com', role: 'Seafarer', rank: 'Bosun', status: 'Active', lastLogin: '4 hours ago', company: 'Baltic Sea Lines' }
    ],
    companyUsers: [
      { id: 6, name: 'David Johnson', email: 'david.johnson@oceanshipping.com', role: 'Company User', rank: 'Fleet Manager', status: 'Active', lastLogin: '15 minutes ago', company: 'Ocean Shipping Ltd' },
      { id: 7, name: 'Sarah Wilson', email: 'sarah.wilson@pacificlines.com', role: 'Company User', rank: 'HR Manager', status: 'Active', lastLogin: '1 hour ago', company: 'Pacific Lines' },
      { id: 8, name: 'Michael Brown', email: 'michael.brown@atlanticmaritime.com', role: 'Company User', rank: 'Operations Director', status: 'Active', lastLogin: '2 hours ago', company: 'Atlantic Maritime' },
      { id: 9, name: 'Lisa Chen', email: 'lisa.chen@globalshipping.com', role: 'Company User', rank: 'Crew Manager', status: 'Inactive', lastLogin: '1 week ago', company: 'Global Shipping Co' },
      { id: 10, name: 'Robert Taylor', email: 'robert.taylor@balticsea.com', role: 'Company User', rank: 'Technical Manager', status: 'Active', lastLogin: '3 hours ago', company: 'Baltic Sea Lines' }
    ],
    admins: [
      { id: 11, name: 'Admin User', email: 'admin@wavesync.com', role: 'Admin', rank: 'System Administrator', status: 'Active', lastLogin: '5 minutes ago', company: 'WaveSync Maritime' },
      { id: 12, name: 'Support Admin', email: 'support@wavesync.com', role: 'Admin', rank: 'Support Administrator', status: 'Active', lastLogin: '1 hour ago', company: 'WaveSync Maritime' }
    ]
  };


  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        All Users
      </h1>
      
      {/* User Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6', marginBottom: '8px' }}>1,245</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Total Users</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#22c55e', marginBottom: '8px' }}>1,189</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Active Users</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#8b5cf6', marginBottom: '8px' }}>1,175</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Seafarers</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>68</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Company Users</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>2</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Admins</div>
        </div>
      </div>

      {/* Seafarers */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Seafarers ({usersData.seafarers.length})
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {usersData.seafarers.map((user) => (
            <div key={user.id} style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{user.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{user.email}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.rank} • {user.company}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#dbeafe',
                  color: '#1e40af'
                }}>
                  {user.role}
                </span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: user.status === 'Active' ? '#d1fae5' : '#f3f4f6',
                  color: user.status === 'Active' ? '#065f46' : '#6b7280'
                }}>
                  {user.status}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{user.lastLogin}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Company Users */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Company Users ({usersData.companyUsers.length})
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {usersData.companyUsers.map((user) => (
            <div key={user.id} style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#8b5cf6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{user.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{user.email}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.rank} • {user.company}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#e0e7ff',
                  color: '#3730a3'
                }}>
                  {user.role}
                </span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: user.status === 'Active' ? '#d1fae5' : '#f3f4f6',
                  color: user.status === 'Active' ? '#065f46' : '#6b7280'
                }}>
                  {user.status}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{user.lastLogin}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admins */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Administrators ({usersData.admins.length})
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {usersData.admins.map((user) => (
            <div key={user.id} style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{user.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{user.email}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.rank} • {user.company}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#fecaca',
                  color: '#991b1b'
                }}>
                  {user.role}
                </span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#d1fae5',
                  color: '#065f46'
                }}>
                  {user.status}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{user.lastLogin}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CompanyManagementPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Company Management
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Company Management page coming soon...</p>
      </div>
    </div>
  );
};

export const PermissionsRolesPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Permissions & Roles
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Permissions & Roles page coming soon...</p>
      </div>
    </div>
  );
};

export const UserAnalyticsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        User Analytics
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>User Analytics page coming soon...</p>
      </div>
    </div>
  );
};

export const SystemSettingsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        System Settings
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>System Settings page coming soon...</p>
      </div>
    </div>
  );
};

export const ConfigurationPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Configuration
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Configuration page coming soon...</p>
      </div>
    </div>
  );
};

export const AuditLogsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Audit Logs
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Audit Logs page coming soon...</p>
      </div>
    </div>
  );
};

export const SecuritySettingsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Security Settings
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Security Settings page coming soon...</p>
      </div>
    </div>
  );
};

export const ReportsExportsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Reports & Exports
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Reports & Exports page coming soon...</p>
      </div>
    </div>
  );
};

export const SupportTicketsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Support Tickets
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Support Tickets page coming soon...</p>
      </div>
    </div>
  );
};

export const DocumentationPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Documentation
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Documentation page coming soon...</p>
      </div>
    </div>
  );
};

export const SystemUpdatesPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        System Updates
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>System Updates page coming soon...</p>
      </div>
    </div>
  );
};
