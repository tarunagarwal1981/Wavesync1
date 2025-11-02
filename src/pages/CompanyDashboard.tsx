import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import styles from './CompanyDashboard.module.css';
import { Card, CardHeader, CardBody } from '../components/ui';

interface CompanyDashboardStats {
  activeCrew: number;
  officersCount: number;
  crewCount: number;
  openPositions: number;
  urgentPositions: number;
  vessels: number;
  activeVessels: number;
  dryDockVessels: number;
  pendingApprovals: number;
  pendingContracts: number;
  pendingDocuments: number;
}

const CompanyDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<CompanyDashboardStats>({
    activeCrew: 0,
    officersCount: 0,
    crewCount: 0,
    openPositions: 0,
    urgentPositions: 0,
    vessels: 0,
    activeVessels: 0,
    dryDockVessels: 0,
    pendingApprovals: 0,
    pendingContracts: 0,
    pendingDocuments: 0
  });
  const [loading, setLoading] = useState(true);

  // Officer ranks (common maritime officer ranks)
  const officerRanks = [
    'Captain', 'Master', 'Chief Engineer', 'Chief Officer', 'First Officer',
    'Second Officer', 'Third Officer', 'Chief Mate', 'Officer', 'Engineer',
    'Chief Engineer Officer', 'Second Engineer', 'Third Engineer'
  ];

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        console.log('🔍 CompanyDashboard: Fetching stats for company_id:', profile.company_id);

        // First check all seafarers to debug
        const { data: allSeafarers } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, company_id')
          .eq('user_type', 'seafarer')
          .limit(10);
        
        console.log('🔍 CompanyDashboard: All seafarers (first 10):', allSeafarers);

        // Fetch all crew (all seafarers with this company_id)
        const { data: crewData, error: crewError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_type', 'seafarer')
          .eq('company_id', profile.company_id);

        if (crewError) {
          console.error('❌ CompanyDashboard: Error fetching crew:', crewError);
        } else {
          console.log('✅ CompanyDashboard: Fetched crew count:', crewData?.length || 0, crewData);
        }

        let officersCount = 0;
        let crewCount = 0;

        if (crewData && crewData.length > 0) {
          // Get seafarer profiles to check ranks
          const crewIds = crewData.map(c => c.id);
          const { data: seafarerProfiles } = await supabase
            .from('seafarer_profiles')
            .select('rank')
            .in('user_id', crewIds);

          // Count officers vs crew (count all seafarers, regardless of availability status)
          if (seafarerProfiles) {
            seafarerProfiles.forEach(sp => {
              const rank = sp.rank?.toLowerCase() || '';
              const isOfficer = officerRanks.some(or => rank.includes(or.toLowerCase()));
              if (isOfficer) {
                officersCount++;
              } else {
                crewCount++;
              }
            });
          }

          // If no seafarer profiles found, assume all are crew
          if (seafarerProfiles?.length === 0) {
            crewCount = crewData.length;
          }
        }

        // Fetch open positions (assignments with status 'pending' and no seafarer assigned)
        const { data: positionsData } = await supabase
          .from('assignments')
          .select('id, start_date')
          .eq('company_id', profile.company_id)
          .eq('status', 'pending')
          .is('seafarer_id', null);

        // Count urgent positions (start_date within 7 days)
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        let urgentPositions = 0;
        if (positionsData) {
          urgentPositions = positionsData.filter(p => {
            if (!p.start_date) return false;
            const startDate = new Date(p.start_date);
            return startDate <= sevenDaysFromNow && startDate >= today;
          }).length;
        }

        // Fetch vessels
        const { data: vesselsData } = await supabase
          .from('vessels')
          .select('id, status')
          .eq('company_id', profile.company_id);

        let activeVessels = 0;
        let dryDockVessels = 0;

        if (vesselsData) {
          vesselsData.forEach(v => {
            const status = (v.status || '').toLowerCase();
            if (status === 'active') {
              activeVessels++;
            } else if (status === 'dry_dock' || status === 'dry dock' || status === 'drydock') {
              dryDockVessels++;
            }
          });
        }

        // Fetch pending approvals (documents with status 'pending' from seafarers in this company)
        let documentsData = null;
        if (crewData && crewData.length > 0) {
          const crewIds = crewData.map(c => c.id);
          const { data } = await supabase
            .from('documents')
            .select('id, document_type')
            .eq('status', 'pending')
            .in('user_id', crewIds);
          documentsData = data;
        }

        let pendingContracts = 0;
        let pendingDocuments = 0;

        if (documentsData) {
          documentsData.forEach(doc => {
            const docType = (doc.document_type || '').toLowerCase();
            if (docType === 'contract' || docType.includes('contract')) {
              pendingContracts++;
            } else {
              pendingDocuments++;
            }
          });
        }

        setStats({
          activeCrew: crewData?.length || 0, // Count all company seafarers
          officersCount,
          crewCount,
          openPositions: positionsData?.length || 0,
          urgentPositions,
          vessels: vesselsData?.length || 0,
          activeVessels,
          dryDockVessels,
          pendingApprovals: documentsData?.length || 0,
          pendingContracts,
          pendingDocuments
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile?.company_id]);

  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (!num && num !== 0) return '-';
    return num.toString();
  };


  return (
    <div className={styles.dashboard}>
      <div className={styles.demoBanner}>
        Welcome: {profile?.full_name} - {profile?.user_type}
      </div>
      
      <h1 className={styles.title}>
        Company Dashboard
      </h1>
      
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
            <h3 className={styles.statTitle}>Active Crew</h3>
            <p className={styles.statNumber}>{loading ? '...' : formatNumber(stats.activeCrew)}</p>
            <p className={styles.statSubtext}>
              {loading ? '...' : stats.activeCrew === 0 
                ? '-' 
                : `${formatNumber(stats.officersCount)} ${stats.officersCount === 1 ? 'officer' : 'officers'}, ${formatNumber(stats.crewCount)} ${stats.crewCount === 1 ? 'crew' : 'crew'}`}
            </p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10H17" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 14H13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Open Positions</h3>
            <p className={styles.statNumber}>{loading ? '...' : formatNumber(stats.openPositions)}</p>
            <p className={styles.statSubtext}>
              {loading ? '...' : stats.urgentPositions > 0 ? `${formatNumber(stats.urgentPositions)} ${stats.urgentPositions === 1 ? 'urgent' : 'urgent'}` : '-'}
            </p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.warning}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Vessels</h3>
            <p className={styles.statNumber}>{loading ? '...' : formatNumber(stats.vessels)}</p>
            <p className={styles.statSubtext}>
              {loading ? '...' : stats.vessels === 0 
                ? '-' 
                : `${formatNumber(stats.activeVessels)} active${stats.dryDockVessels > 0 ? `, ${formatNumber(stats.dryDockVessels)} ${stats.dryDockVessels === 1 ? 'dry dock' : 'dry dock'}` : ''}`}
            </p>
          </div>
        </Card>
        
        <Card variant="elevated" hoverable padding="lg">
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Pending Approvals</h3>
            <p className={styles.statNumber}>{loading ? '...' : formatNumber(stats.pendingApprovals)}</p>
            <p className={styles.statSubtext}>
              {loading ? '...' : stats.pendingApprovals > 0 
                ? `${formatNumber(stats.pendingContracts)} ${stats.pendingContracts === 1 ? 'contract' : 'contracts'}, ${formatNumber(stats.pendingDocuments)} ${stats.pendingDocuments === 1 ? 'document' : 'documents'}` 
                : '-'}
            </p>
          </div>
        </Card>
      </div>
      
      <Card variant="elevated" padding="none">
        <CardHeader>
          <h2 className={styles.actionsTitle}>Quick Actions</h2>
        </CardHeader>
        <CardBody>
          <div className={styles.actionsGrid}>
            <button className={`${styles.actionButton} ${styles.primary}`}>
              Manage Crew
            </button>
            <button className={`${styles.actionButton} ${styles.success}`}>
              Post Job
            </button>
            <button className={`${styles.actionButton} ${styles.secondary}`}>
              View Reports
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CompanyDashboard;
