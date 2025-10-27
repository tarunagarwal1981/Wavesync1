// Admin pages with real data
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui';
import styles from './AdminPages.module.css';

// ==================== ALL USERS PAGE ====================
export const AllUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    seafarers: 0,
    company: 0,
    admins: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          company:companies(name),
          seafarer_profile:seafarer_profiles(rank, experience_years, availability_status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersData = data || [];
      setUsers(usersData);

      // Calculate stats
      const total = usersData.length;
      const seafarers = usersData.filter(u => u.user_type === 'seafarer').length;
      const company = usersData.filter(u => u.user_type === 'company').length;
      const admins = usersData.filter(u => u.user_type === 'admin').length;

      setStats({ total, active: total, seafarers, company, admins });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Users</h1>
      
      {/* User Summary */}
      <div className={styles.statsGrid}>
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={styles.iconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Total Users</h3>
            <p className={styles.statNumber}>{stats.total > 0 ? stats.total : '—'}</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Active Users</h3>
            <p className={styles.statNumber}>{stats.active > 0 ? stats.active : '—'}</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Seafarers</h3>
            <p className={styles.statNumber}>{stats.seafarers > 0 ? stats.seafarers : '—'}</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.warning}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10H17" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 14H13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Company Users</h3>
            <p className={styles.statNumber}>{stats.company > 0 ? stats.company : '—'}</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Admins</h3>
            <p className={styles.statNumber}>{stats.admins > 0 ? stats.admins : '—'}</p>
          </div>
        </Card>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <h3>No Users Found</h3>
          <p>There are no users in the system yet.</p>
        </div>
      ) : (
        <>
          {/* Seafarers */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Seafarers ({users.filter(u => u.user_type === 'seafarer').length})</h3>
            <div className={styles.userGrid}>
              {users.filter(u => u.user_type === 'seafarer').map((user) => (
                <div key={user.id} className={styles.userCard}>
                  <div className={styles.userAvatar}>{user.full_name?.charAt(0) || '?'}</div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.full_name || '—'}</div>
                    <div className={styles.userEmail}>{user.email || '—'}</div>
                    <div className={styles.userMeta}>
                      {user.seafarer_profile?.[0]?.rank || user.seafarer_profile?.rank || '—'} • 
                      {user.company?.name || 'No Company'}
                    </div>
                  </div>
                  <div className={styles.userBadge} style={{ background: '#dbeafe', color: '#1e40af' }}>
                    Seafarer
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Users */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Company Users ({users.filter(u => u.user_type === 'company').length})</h3>
            <div className={styles.userGrid}>
              {users.filter(u => u.user_type === 'company').map((user) => (
                <div key={user.id} className={styles.userCard}>
                  <div className={styles.userAvatar}>{user.full_name?.charAt(0) || '?'}</div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.full_name || '—'}</div>
                    <div className={styles.userEmail}>{user.email || '—'}</div>
                    <div className={styles.userMeta}>
                      {user.company?.name || 'No Company'}
                    </div>
                  </div>
                  <div className={styles.userBadge} style={{ background: '#e0e7ff', color: '#3730a3' }}>
                    Company
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admins */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Administrators ({users.filter(u => u.user_type === 'admin').length})</h3>
            <div className={styles.userGrid}>
              {users.filter(u => u.user_type === 'admin').map((user) => (
                <div key={user.id} className={styles.userCard}>
                  <div className={styles.userAvatar}>{user.full_name?.charAt(0) || '?'}</div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.full_name || '—'}</div>
                    <div className={styles.userEmail}>{user.email || '—'}</div>
                    <div className={styles.userMeta}>System Administrator</div>
                  </div>
                  <div className={styles.userBadge} style={{ background: '#fecaca', color: '#991b1b' }}>
                    Admin
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ==================== SYSTEM ANALYTICS PAGE ====================
export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCompanies: 0,
    totalAssignments: 0,
    activeAssignments: 0,
    totalDocuments: 0,
    totalVessels: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [usersRes, companiesRes, assignmentsRes, activeAssignmentsRes, documentsRes, vesselsRes] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('assignments').select('id', { count: 'exact', head: true }),
        supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('documents').select('id', { count: 'exact', head: true }),
        supabase.from('vessels').select('id', { count: 'exact', head: true })
      ]);

      setAnalytics({
        totalUsers: usersRes.count || 0,
        activeUsers: usersRes.count || 0,
        totalCompanies: companiesRes.count || 0,
        totalAssignments: assignmentsRes.count || 0,
        activeAssignments: activeAssignmentsRes.count || 0,
        totalDocuments: documentsRes.count || 0,
        totalVessels: vesselsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>System Analytics</h1>
      
      <div className={styles.statsGrid}>
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={styles.iconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Total Users</h3>
            <p className={styles.statNumber}>{analytics.totalUsers > 0 ? analytics.totalUsers : '—'}</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Companies</h3>
            <p className={styles.statNumber}>{analytics.totalCompanies > 0 ? analytics.totalCompanies : '—'}</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Vessels</h3>
            <p className={styles.statNumber}>{analytics.totalVessels > 0 ? analytics.totalVessels : '—'}</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.warning}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Total Assignments</h3>
            <p className={styles.statNumber}>{analytics.totalAssignments > 0 ? analytics.totalAssignments : '—'}</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Active Assignments</h3>
            <p className={styles.statNumber}>{analytics.activeAssignments > 0 ? analytics.activeAssignments : '—'}</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10H17" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 14H13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Documents</h3>
            <p className={styles.statNumber}>{analytics.totalDocuments > 0 ? analytics.totalDocuments : '—'}</p>
          </div>
        </Card>
      </div>

      <Card variant="elevated" padding="lg">
        <h3>📊 Analytics Dashboard</h3>
        <p>Real-time system metrics and performance indicators.</p>
        {analytics.totalUsers === 0 && (
          <p className={styles.note}>Create users and data to see analytics populate.</p>
        )}
      </Card>
    </div>
  );
};

// ==================== PERFORMANCE MONITOR PAGE ====================
export const PerformanceMonitorPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Performance Monitor</h1>
      
      <div className={styles.statsGrid}>
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>System Uptime</h3>
            <p className={styles.statNumber}>99.8%</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V6M12 18V22M6 12H2M22 12H18M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Avg Response Time</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.warning}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Server Load</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={styles.iconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Database Queries</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
      </div>

      <Card variant="elevated" padding="lg">
        <h3>🔧 System Performance</h3>
        <p>Monitor system health and performance metrics in real-time.</p>
        <p className={styles.note}>Advanced performance monitoring coming soon.</p>
      </Card>
    </div>
  );
};

// ==================== SYSTEM ALERTS PAGE ====================
export const SystemAlertsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>System Alerts</h1>
      
      <div className={styles.statsGrid}>
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.warning}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Critical Alerts</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Warnings</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Info</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={styles.iconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Resolved Today</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
      </div>

      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔔</div>
        <h3>No Active Alerts</h3>
        <p>All systems are operating normally.</p>
      </div>
    </div>
  );
};

// ==================== COMPANY MANAGEMENT PAGE (Redirects to existing component) ====================
export const CompanyManagementPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Company Management</h1>
      <Card variant="elevated" padding="lg">
        <h3>🏢 Company Management</h3>
        <p>Navigate to the dedicated Company Management section from the sidebar to manage companies.</p>
      </Card>
    </div>
  );
};

// ==================== PERMISSIONS & ROLES PAGE ====================
export const PermissionsRolesPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Permissions & Roles</h1>
      
      <Card variant="elevated" padding="lg">
        <h3>🔐 Role-Based Access Control</h3>
        <p>Current system roles:</p>
        <ul className={styles.roleList}>
          <li><strong>Admin:</strong> Full system access</li>
          <li><strong>Company User:</strong> Manage crew, vessels, and assignments</li>
          <li><strong>Seafarer:</strong> View assignments, documents, and training</li>
        </ul>
        <p className={styles.note}>Advanced permission management coming soon.</p>
      </Card>
    </div>
  );
};

// ==================== USER ANALYTICS PAGE ====================
export const UserAnalyticsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Analytics</h1>
      
      <div className={styles.statsGrid}>
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={styles.iconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15M10 17L15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Total Logins</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Active Today</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V6M12 18V22M6 12H2M22 12H18M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Avg Session Time</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
      </div>

      <Card variant="elevated" padding="lg">
        <h3>📈 User Behavior Analytics</h3>
        <p>Track user engagement and platform usage patterns.</p>
        <p className={styles.note}>Detailed analytics dashboard coming soon.</p>
      </Card>
    </div>
  );
};

// ==================== SYSTEM SETTINGS PAGE ====================
export const SystemSettingsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>System Settings</h1>
      
      <Card variant="elevated" padding="lg">
        <h3>⚙️ System Configuration</h3>
        <p>Configure global system settings and preferences.</p>
        <p className={styles.note}>Settings panel coming soon.</p>
      </Card>
    </div>
  );
};

// ==================== CONFIGURATION PAGE ====================
export const ConfigurationPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Configuration</h1>
      
      <Card variant="elevated" padding="lg">
        <h3>🔧 Platform Configuration</h3>
        <p>Advanced configuration options for administrators.</p>
        <p className={styles.note}>Configuration panel coming soon.</p>
      </Card>
    </div>
  );
};

// ==================== AUDIT LOGS PAGE ====================
export const AuditLogsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Audit Logs</h1>
      
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <h3>No Audit Logs Available</h3>
        <p>System audit logs will appear here once tracking is enabled.</p>
      </div>
    </div>
  );
};

// ==================== SECURITY SETTINGS PAGE ====================
export const SecuritySettingsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Security Settings</h1>
      
      <Card variant="elevated" padding="lg">
        <h3>🛡️ Security Configuration</h3>
        <p>Manage security policies and authentication settings.</p>
        <ul className={styles.roleList}>
          <li>Multi-factor authentication</li>
          <li>Password policies</li>
          <li>Session management</li>
          <li>IP whitelisting</li>
        </ul>
        <p className={styles.note}>Security settings panel coming soon.</p>
      </Card>
    </div>
  );
};

// ==================== REPORTS & EXPORTS PAGE ====================
export const ReportsExportsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Reports & Exports</h1>
      
      <Card variant="elevated" padding="lg">
        <h3>📊 System Reports</h3>
        <p>Generate and export system reports.</p>
        <ul className={styles.roleList}>
          <li>User activity reports</li>
          <li>Assignment reports</li>
          <li>Document expiry reports</li>
          <li>Compliance reports</li>
        </ul>
        <p className={styles.note}>Report generation tools coming soon.</p>
      </Card>
    </div>
  );
};

// ==================== SUPPORT TICKETS PAGE ====================
export const SupportTicketsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Support Tickets</h1>
      
      <div className={styles.statsGrid}>
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.warning}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10H17" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 14H13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Open Tickets</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V6M12 18V22M6 12H2M22 12H18M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>In Progress</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Resolved</h3>
            <p className={styles.statNumber}>—</p>
          </div>
        </Card>
      </div>

      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🎫</div>
        <h3>No Support Tickets</h3>
        <p>No active support tickets at this time.</p>
      </div>
    </div>
  );
};

// ==================== DOCUMENTATION PAGE ====================
export const DocumentationPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Documentation</h1>
      
      <Card variant="elevated" padding="lg">
        <h3>📖 System Documentation</h3>
        <p>Access guides, tutorials, and API documentation.</p>
        <ul className={styles.roleList}>
          <li>User guides</li>
          <li>Admin documentation</li>
          <li>API reference</li>
          <li>Best practices</li>
        </ul>
        <p className={styles.note}>Documentation portal coming soon.</p>
      </Card>
    </div>
  );
};

// ==================== SYSTEM UPDATES PAGE ====================
export const SystemUpdatesPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>System Updates</h1>
      
      <Card variant="elevated" padding="lg">
        <h3>🔄 Platform Updates</h3>
        <p>Current Version: 1.0.0</p>
        <p>All systems are up to date.</p>
        <p className={styles.note}>Update management tools coming soon.</p>
      </Card>
    </div>
  );
};
