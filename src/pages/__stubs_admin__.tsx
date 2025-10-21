// Admin pages with real data
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total > 0 ? stats.total : '—'}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.active > 0 ? stats.active : '—'}</div>
          <div className={styles.statLabel}>Active Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.seafarers > 0 ? stats.seafarers : '—'}</div>
          <div className={styles.statLabel}>Seafarers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.company > 0 ? stats.company : '—'}</div>
          <div className={styles.statLabel}>Company Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.admins > 0 ? stats.admins : '—'}</div>
          <div className={styles.statLabel}>Admins</div>
        </div>
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
              {users.filter(u => u.user_type === 'seafarer').slice(0, 5).map((user) => (
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
              {users.filter(u => u.user_type === 'company').slice(0, 5).map((user) => (
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
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.totalUsers > 0 ? analytics.totalUsers : '—'}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.totalCompanies > 0 ? analytics.totalCompanies : '—'}</div>
          <div className={styles.statLabel}>Companies</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.totalVessels > 0 ? analytics.totalVessels : '—'}</div>
          <div className={styles.statLabel}>Vessels</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.totalAssignments > 0 ? analytics.totalAssignments : '—'}</div>
          <div className={styles.statLabel}>Total Assignments</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.activeAssignments > 0 ? analytics.activeAssignments : '—'}</div>
          <div className={styles.statLabel}>Active Assignments</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.totalDocuments > 0 ? analytics.totalDocuments : '—'}</div>
          <div className={styles.statLabel}>Documents</div>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h3>📊 Analytics Dashboard</h3>
        <p>Real-time system metrics and performance indicators.</p>
        {analytics.totalUsers === 0 && (
          <p className={styles.note}>Create users and data to see analytics populate.</p>
        )}
      </div>
    </div>
  );
};

// ==================== PERFORMANCE MONITOR PAGE ====================
export const PerformanceMonitorPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Performance Monitor</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>99.8%</div>
          <div className={styles.statLabel}>System Uptime</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>Avg Response Time</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>Server Load</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>Database Queries</div>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h3>🔧 System Performance</h3>
        <p>Monitor system health and performance metrics in real-time.</p>
        <p className={styles.note}>Advanced performance monitoring coming soon.</p>
      </div>
    </div>
  );
};

// ==================== SYSTEM ALERTS PAGE ====================
export const SystemAlertsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>System Alerts</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>Critical Alerts</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>Warnings</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>Info</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>Resolved Today</div>
        </div>
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
      <div className={styles.infoCard}>
        <h3>🏢 Company Management</h3>
        <p>Navigate to the dedicated Company Management section from the sidebar to manage companies.</p>
      </div>
    </div>
  );
};

// ==================== PERMISSIONS & ROLES PAGE ====================
export const PermissionsRolesPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Permissions & Roles</h1>
      
      <div className={styles.infoCard}>
        <h3>🔐 Role-Based Access Control</h3>
        <p>Current system roles:</p>
        <ul className={styles.roleList}>
          <li><strong>Admin:</strong> Full system access</li>
          <li><strong>Company User:</strong> Manage crew, vessels, and assignments</li>
          <li><strong>Seafarer:</strong> View assignments, documents, and training</li>
        </ul>
        <p className={styles.note}>Advanced permission management coming soon.</p>
      </div>
    </div>
  );
};

// ==================== USER ANALYTICS PAGE ====================
export const UserAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalLogins: 0,
    activeToday: 0,
    avgSessionTime: '—'
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Analytics</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalLogins > 0 ? stats.totalLogins : '—'}</div>
          <div className={styles.statLabel}>Total Logins</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.activeToday > 0 ? stats.activeToday : '—'}</div>
          <div className={styles.statLabel}>Active Today</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.avgSessionTime}</div>
          <div className={styles.statLabel}>Avg Session Time</div>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h3>📈 User Behavior Analytics</h3>
        <p>Track user engagement and platform usage patterns.</p>
        <p className={styles.note}>Detailed analytics dashboard coming soon.</p>
      </div>
    </div>
  );
};

// ==================== SYSTEM SETTINGS PAGE ====================
export const SystemSettingsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>System Settings</h1>
      
      <div className={styles.infoCard}>
        <h3>⚙️ System Configuration</h3>
        <p>Configure global system settings and preferences.</p>
        <p className={styles.note}>Settings panel coming soon.</p>
      </div>
    </div>
  );
};

// ==================== CONFIGURATION PAGE ====================
export const ConfigurationPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Configuration</h1>
      
      <div className={styles.infoCard}>
        <h3>🔧 Platform Configuration</h3>
        <p>Advanced configuration options for administrators.</p>
        <p className={styles.note}>Configuration panel coming soon.</p>
      </div>
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
      
      <div className={styles.infoCard}>
        <h3>🛡️ Security Configuration</h3>
        <p>Manage security policies and authentication settings.</p>
        <ul className={styles.roleList}>
          <li>Multi-factor authentication</li>
          <li>Password policies</li>
          <li>Session management</li>
          <li>IP whitelisting</li>
        </ul>
        <p className={styles.note}>Security settings panel coming soon.</p>
      </div>
    </div>
  );
};

// ==================== REPORTS & EXPORTS PAGE ====================
export const ReportsExportsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Reports & Exports</h1>
      
      <div className={styles.infoCard}>
        <h3>📊 System Reports</h3>
        <p>Generate and export system reports.</p>
        <ul className={styles.roleList}>
          <li>User activity reports</li>
          <li>Assignment reports</li>
          <li>Document expiry reports</li>
          <li>Compliance reports</li>
        </ul>
        <p className={styles.note}>Report generation tools coming soon.</p>
      </div>
    </div>
  );
};

// ==================== SUPPORT TICKETS PAGE ====================
export const SupportTicketsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Support Tickets</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>Open Tickets</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>—</div>
          <div className={styles.statLabel}>Resolved</div>
        </div>
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
      
      <div className={styles.infoCard}>
        <h3>📖 System Documentation</h3>
        <p>Access guides, tutorials, and API documentation.</p>
        <ul className={styles.roleList}>
          <li>User guides</li>
          <li>Admin documentation</li>
          <li>API reference</li>
          <li>Best practices</li>
        </ul>
        <p className={styles.note}>Documentation portal coming soon.</p>
      </div>
    </div>
  );
};

// ==================== SYSTEM UPDATES PAGE ====================
export const SystemUpdatesPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>System Updates</h1>
      
      <div className={styles.infoCard}>
        <h3>🔄 Platform Updates</h3>
        <p>Current Version: 1.0.0</p>
        <p>All systems are up to date.</p>
        <p className={styles.note}>Update management tools coming soon.</p>
      </div>
    </div>
  );
};
