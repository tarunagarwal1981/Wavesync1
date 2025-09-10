import React from "react";
import styles from "./Dashboard.module.css";
import { Card, Button, Spinner, Badge, StatsCard, LoadingState, Skeleton, EmptyState, PageTransition, EntranceAnimation, BrandedSpinner } from "../components/ui";
import { ClipboardList, FileText, GraduationCap, CheckSquare } from "lucide-react";
import { useToast } from "../hooks/useToast";

interface Stats {
  pendingAssignments: number;
  activeContracts: number;
  expiringDocuments: number;
  trainingDue: number;
}

const useDashboardData = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [activities, setActivities] = React.useState<Array<{ id: string; title: string; meta: string }>>([]);
  const [tasks, setTasks] = React.useState<Array<{ id: string; title: string; due: string }>>([]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setStats({ pendingAssignments: 3, activeContracts: 6, expiringDocuments: 2, trainingDue: 1 });
        setActivities([
          { id: "1", title: "Signed contract for MV Ocean Star", meta: "2h ago" },
          { id: "2", title: "Uploaded Medical Certificate", meta: "4h ago" },
          { id: "3", title: "Assignment proposed for MV Blue Horizon", meta: "Yesterday" },
        ]);
        setTasks([
          { id: "1", title: "Submit Seaman Book copy", due: "Today" },
          { id: "2", title: "Complete Basic Safety Training", due: "In 3 days" },
        ]);
      } catch (e) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        setStats({ pendingAssignments: 3, activeContracts: 6, expiringDocuments: 2, trainingDue: 1 });
        setActivities([
          { id: "1", title: "Signed contract for MV Ocean Star", meta: "2h ago" },
          { id: "2", title: "Uploaded Medical Certificate", meta: "4h ago" },
          { id: "3", title: "Assignment proposed for MV Blue Horizon", meta: "Yesterday" },
        ]);
        setTasks([
          { id: "1", title: "Submit Seaman Book copy", due: "Today" },
          { id: "2", title: "Complete Basic Safety Training", due: "In 3 days" },
        ]);
      } catch (e) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return { loading, error, stats, activities, tasks, retry };
};

export const Dashboard: React.FC = () => {
  const userName = "Captain Nemo";
  const userStatus = "Online";
  const { loading, error, stats, activities, tasks, retry } = useDashboardData();
  const { success } = useToast();

  React.useEffect(() => {
    if (!loading && !error) {
      success("Dashboard loaded successfully");
    }
  }, [loading, error, success]);

  return (
    <PageTransition>
      <div className={styles.grid}>
        {/* Welcome section */}
        <EntranceAnimation delay={100}>
          <Card header={<div className={styles.welcome}>
            <div>
              <div className={styles.title}>Welcome back, {userName}</div>
              <div className={styles.subtitle}>Status: <Badge variant="success">{userStatus}</Badge></div>
            </div>
            <div>
              <Button variant="primary">Create Assignment</Button>
            </div>
          </div>} />
        </EntranceAnimation>

        {/* Statistics */}
        <div className={styles.stats}>
          <LoadingState
            isLoading={loading}
            error={error}
            onRetry={retry}
            skeleton={
              <>
                {[0,1,2,3].map(i => (
                  <EntranceAnimation key={i} delay={200 + i * 100}>
                    <StatsCard title="Loading" loading variant="assignments" />
                  </EntranceAnimation>
                ))}
              </>
            )}
          >
            {stats ? (
              <>
                <EntranceAnimation delay={200}>
                  <StatsCard title="Pending assignments" value={stats.pendingAssignments} percentChange={6} variant="assignments" icon={<ClipboardList size={18} />} />
                </EntranceAnimation>
                <EntranceAnimation delay={300}>
                  <StatsCard title="Active contracts" value={stats.activeContracts} percentChange={-2} variant="tasks" icon={<CheckSquare size={18} />} />
                </EntranceAnimation>
                <EntranceAnimation delay={400}>
                  <StatsCard title="Expiring documents" value={stats.expiringDocuments} percentChange={1} variant="documents" icon={<FileText size={18} />} />
                </EntranceAnimation>
                <EntranceAnimation delay={500}>
                  <StatsCard title="Training due" value={stats.trainingDue} percentChange={0} variant="training" icon={<GraduationCap size={18} />} />
                </EntranceAnimation>
              </>
            ) : (
              <>
                <StatsCard title="Pending assignments" value="—" variant="assignments" />
                <StatsCard title="Active contracts" value="—" variant="assignments" />
                <StatsCard title="Expiring documents" value="—" variant="documents" />
                <StatsCard title="Training due" value="—" variant="training" />
              </>
            )}
          </LoadingState>
        </div>

        <div className={styles.columns}>
          {/* Left column: Quick actions + Recent activity */}
          <div className={styles.columnLeft}>
            <EntranceAnimation delay={600}>
              <Card header={<div className={styles.sectionHeader}>Quick actions</div>}>
                <div className={styles.cardBody}>
                  <div className={styles.actions}>
                    <Button variant="primary">New Assignment</Button>
                    <Button variant="secondary">Upload Document</Button>
                    <Button variant="ghost">Invite Seafarer</Button>
                  </div>
                </div>
              </Card>
            </EntranceAnimation>

            <EntranceAnimation delay={700}>
              <Card header={<div className={styles.sectionHeader}>Recent activity</div>}>
                <div className={styles.cardBody}>
                  <LoadingState
                    isLoading={loading}
                    error={error}
                    onRetry={retry}
                    isEmpty={activities.length === 0}
                    skeleton={<BrandedSpinner size="md" label="Loading activity..." />}
                    emptyState={
                      <EmptyState
                        icon="📊"
                        title="No recent activity"
                        description="Your recent activities will appear here."
                      />
                    }
                  >
                    <div className={styles.activityList}>
                      {activities.map((a, index) => (
                        <EntranceAnimation key={a.id} delay={800 + index * 100}>
                          <div className={styles.row}>
                            <div className={styles.itemTitle}>{a.title}</div>
                            <div className={styles.itemMeta}>{a.meta}</div>
                          </div>
                        </EntranceAnimation>
                      ))}
                    </div>
                  </LoadingState>
                </div>
              </Card>
            </EntranceAnimation>
          </div>

          {/* Right column: Upcoming tasks */}
          <div className={styles.columnRight}>
            <EntranceAnimation delay={800}>
              <Card header={<div className={styles.sectionHeader}>Upcoming tasks</div>}>
                <div className={styles.cardBody}>
                  <LoadingState
                    isLoading={loading}
                    error={error}
                    onRetry={retry}
                    isEmpty={tasks.length === 0}
                    skeleton={<BrandedSpinner size="md" label="Loading tasks..." />}
                    emptyState={
                      <EmptyState
                        icon="✅"
                        title="No upcoming tasks"
                        description="You're all caught up! New tasks will appear here."
                      />
                    }
                  >
                    <div className={styles.tasksList}>
                      {tasks.map((t, index) => (
                        <EntranceAnimation key={t.id} delay={900 + index * 100}>
                          <div className={styles.row}>
                            <div className={styles.itemTitle}>{t.title}</div>
                            <div className={styles.itemMeta}>{t.due}</div>
                          </div>
                        </EntranceAnimation>
                      ))}
                    </div>
                  </LoadingState>
                </div>
              </Card>
            </EntranceAnimation>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;