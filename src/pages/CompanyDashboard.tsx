import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../hooks/useToast';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  FileText,
  CheckSquare,
  Ship,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from './CompanyDashboard.module.css';

interface AnalyticsData {
  crew: any;
  documents: any;
  tasks: any;
  assignments: any;
  vessels: any;
  generated_at: string;
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color }) => (
  <div className={styles.statCard} style={{ borderLeftColor: color }}>
    <div className={styles.statIcon} style={{ backgroundColor: `${color}15` }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div className={styles.statContent}>
      <div className={styles.statTitle}>{title}</div>
      <div className={styles.statValue}>{value}</div>
      {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
    </div>
  </div>
);

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899'
};

const CompanyDashboard = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (profile?.company_id) {
      fetchAnalytics();
    }
  }, [profile]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_dashboard_analytics', {
        p_company_id: profile.company_id
      });

      if (error) {
        throw error;
      }

      setAnalytics(data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      addToast({
        type: 'error',
        title: 'Failed to load analytics',
        description: error?.message || 'Please try again',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!analytics) return;

    try {
      setExporting(true);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('⚓ WaveSync Analytics Report', pageWidth / 2, 25, { align: 'center' });

      // Date
      doc.setFontSize(10);
      doc.setTextColor(240, 240, 240);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: 'center' });

      let yPos = 50;

      // Crew Statistics
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('👥 Crew Statistics', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Total Crew', analytics.crew.total_crew || 0],
          ['Available', analytics.crew.available || 0],
          ['On Assignment', analytics.crew.on_assignment || 0],
          ['On Leave', analytics.crew.on_leave || 0],
          ['Avg Experience (Years)', analytics.crew.avg_experience_years?.toFixed(1) || 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Document Statistics
      doc.setFontSize(16);
      doc.text('📄 Document Compliance', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Total Documents', analytics.documents.total_documents || 0],
          ['Valid', analytics.documents.valid || 0],
          ['Expiring Soon', analytics.documents.expiring_soon || 0],
          ['Expiring Urgent', analytics.documents.expiring_urgent || 0],
          ['Expired', analytics.documents.expired || 0],
          ['Compliance Rate', `${analytics.documents.compliance_rate || 0}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Task Statistics
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.text('✅ Task Management', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Total Tasks', analytics.tasks.total_tasks || 0],
          ['Completed', analytics.tasks.completed || 0],
          ['In Progress', analytics.tasks.in_progress || 0],
          ['Pending', analytics.tasks.pending || 0],
          ['Overdue', analytics.tasks.overdue || 0],
          ['Completion Rate', `${analytics.tasks.completion_rate || 0}%`],
          ['Avg Completion Time', `${analytics.tasks.avg_completion_time_days || 0} days`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] }
      });

      // Save PDF
      doc.save(`wavesync-analytics-${new Date().toISOString().split('T')[0]}.pdf`);

      addToast({
        type: 'success',
        title: 'Report exported',
        description: 'PDF downloaded successfully',
        duration: 3000
        });
      } catch (error) {
      console.error('Error exporting PDF:', error);
      addToast({
        type: 'error',
        title: 'Export failed',
        description: 'Please try again',
        duration: 5000
      });
      } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    if (!analytics) return;

    try {
      let csvContent = 'WaveSync Analytics Report\n';
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

      // Crew Statistics
      csvContent += 'CREW STATISTICS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Crew,${analytics.crew.total_crew || 0}\n`;
      csvContent += `Available,${analytics.crew.available || 0}\n`;
      csvContent += `On Assignment,${analytics.crew.on_assignment || 0}\n`;
      csvContent += `On Leave,${analytics.crew.on_leave || 0}\n\n`;

      // Document Statistics
      csvContent += 'DOCUMENT STATISTICS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Documents,${analytics.documents.total_documents || 0}\n`;
      csvContent += `Valid,${analytics.documents.valid || 0}\n`;
      csvContent += `Expiring Soon,${analytics.documents.expiring_soon || 0}\n`;
      csvContent += `Expired,${analytics.documents.expired || 0}\n`;
      csvContent += `Compliance Rate,${analytics.documents.compliance_rate || 0}%\n\n`;

      // Task Statistics
      csvContent += 'TASK STATISTICS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Tasks,${analytics.tasks.total_tasks || 0}\n`;
      csvContent += `Completed,${analytics.tasks.completed || 0}\n`;
      csvContent += `Pending,${analytics.tasks.pending || 0}\n`;
      csvContent += `Completion Rate,${analytics.tasks.completion_rate || 0}%\n\n`;

      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `wavesync-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      addToast({
        type: 'success',
        title: 'Report exported',
        description: 'CSV downloaded successfully',
        duration: 3000
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      addToast({
        type: 'error',
        title: 'Export failed',
        description: 'Please try again',
        duration: 5000
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <RefreshCw className={styles.spinner} size={48} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const crewByRank = analytics?.crew?.by_rank
    ? Object.entries(analytics.crew.by_rank).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  const tasksByPriority = analytics?.tasks?.by_priority
    ? Object.entries(analytics.tasks.by_priority).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  const crewStatusData = [
    { name: 'Available', value: analytics?.crew?.available || 0, color: COLORS.success },
    { name: 'On Assignment', value: analytics?.crew?.on_assignment || 0, color: COLORS.info },
    { name: 'On Leave', value: analytics?.crew?.on_leave || 0, color: COLORS.warning }
  ];

  const documentComplianceData = [
    { name: 'Valid', value: analytics?.documents?.valid || 0, color: COLORS.success },
    { name: 'Expiring Soon', value: analytics?.documents?.expiring_soon || 0, color: COLORS.warning },
    { name: 'Expiring Urgent', value: analytics?.documents?.expiring_urgent || 0, color: COLORS.error },
    { name: 'Expired', value: analytics?.documents?.expired || 0, color: '#DC2626' }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📊 Dashboard</h1>
          <p className={styles.subtitle}>
            Comprehensive insights into your maritime operations
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={fetchAnalytics} className={styles.refreshButton}>
            <RefreshCw size={18} />
            Refresh
          </button>
          <button onClick={exportToCSV} className={styles.exportButton}>
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className={styles.exportButton}
            disabled={exporting}
          >
            <Download size={18} />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={Users}
          title="Total Crew"
          value={analytics?.crew?.total_crew ?? '-'}
          subtitle={analytics?.crew ? `${analytics.crew.available || 0} available` : undefined}
          color={COLORS.primary}
        />
        <StatCard
          icon={FileText}
          title="Documents"
          value={analytics?.documents?.total_documents ?? '-'}
          subtitle={analytics?.documents ? `${analytics.documents.compliance_rate || 0}% compliant` : undefined}
          color={COLORS.success}
        />
        <StatCard
          icon={CheckSquare}
          title="Tasks"
          value={analytics?.tasks?.total_tasks ?? '-'}
          subtitle={analytics?.tasks ? `${analytics.tasks.completion_rate || 0}% completed` : undefined}
          color={COLORS.info}
        />
        <StatCard
          icon={Ship}
          title="Vessels"
          value={analytics?.vessels?.total_vessels ?? '-'}
          subtitle={analytics?.vessels ? `${analytics.vessels.active || 0} active` : undefined}
          color={COLORS.secondary}
        />
            </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Crew Status Distribution */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>👥 Crew Status Distribution</h3>
          {crewStatusData.reduce((s, d) => s + (d.value as number), 0) > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ top: 8, right: 8, bottom: 24, left: 8 }}>
                <Pie
                  data={crewStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {crewStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyChart}>-</div>
          )}
          </div>

        {/* Document Compliance */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>📄 Document Compliance Status</h3>
          {documentComplianceData.reduce((s, d) => s + (d.value as number), 0) > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ top: 8, right: 8, bottom: 24, left: 8 }}>
                <Pie
                  data={documentComplianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {documentComplianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyChart}>-</div>
          )}
          </div>

        {/* Crew by Rank */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>👔 Crew by Rank</h3>
          {crewByRank.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={crewByRank}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyChart}>-</div>
          )}
          </div>

        {/* Tasks by Priority */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>⚡ Tasks by Priority</h3>
          {tasksByPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS.warning} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyChart}>-</div>
          )}
            </div>
          </div>

      {/* Additional Stats Tables */}
      <div className={styles.tablesGrid}>
        {/* Task Breakdown */}
        <div className={styles.tableCard}>
          <h3 className={styles.tableTitle}>✅ Task Breakdown</h3>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td>Total Tasks</td>
                <td className={styles.tableValue}>{analytics?.tasks?.total_tasks ?? '-'}</td>
              </tr>
              <tr>
                <td>Completed</td>
                <td className={styles.tableValue} style={{ color: COLORS.success }}>
                  {analytics?.tasks?.completed ?? '-'}
                </td>
              </tr>
              <tr>
                <td>In Progress</td>
                <td className={styles.tableValue} style={{ color: COLORS.info }}>
                  {analytics?.tasks?.in_progress ?? '-'}
                </td>
              </tr>
              <tr>
                <td>Pending</td>
                <td className={styles.tableValue} style={{ color: COLORS.warning }}>
                  {analytics?.tasks?.pending ?? '-'}
                </td>
              </tr>
              <tr>
                <td>Overdue</td>
                <td className={styles.tableValue} style={{ color: COLORS.error }}>
                  {analytics?.tasks?.overdue ?? '-'}
                </td>
              </tr>
              <tr className={styles.tableHighlight}>
                <td>Completion Rate</td>
                <td className={styles.tableValue}>
                  {analytics?.tasks?.completion_rate != null ? `${analytics.tasks.completion_rate}%` : '-'}
                </td>
              </tr>
            </tbody>
          </table>
          </div>

        {/* Assignment Stats */}
        <div className={styles.tableCard}>
          <h3 className={styles.tableTitle}>📋 Assignment Statistics</h3>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td>Total Assignments</td>
                <td className={styles.tableValue}>{analytics?.assignments?.total_assignments ?? '-'}</td>
              </tr>
              <tr>
                <td>Accepted</td>
                <td className={styles.tableValue} style={{ color: COLORS.success }}>
                  {analytics?.assignments?.accepted ?? '-'}
                </td>
              </tr>
              <tr>
                <td>Pending</td>
                <td className={styles.tableValue} style={{ color: COLORS.warning }}>
                  {analytics?.assignments?.pending ?? '-'}
                </td>
              </tr>
              <tr>
                <td>Rejected</td>
                <td className={styles.tableValue} style={{ color: COLORS.error }}>
                  {analytics?.assignments?.rejected ?? '-'}
                </td>
              </tr>
              <tr className={styles.tableHighlight}>
                <td>Acceptance Rate</td>
                <td className={styles.tableValue}>
                  {analytics?.assignments?.acceptance_rate != null ? `${analytics.assignments.acceptance_rate}%` : '-'}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
      </div>
      
      {/* Footer */}
      <div className={styles.footer}>
        <p>
          <Calendar size={16} />
          Last updated: {analytics?.generated_at ? new Date(analytics.generated_at).toLocaleString() : '-'}
        </p>
          </div>
    </div>
  );
};

export default CompanyDashboard;
