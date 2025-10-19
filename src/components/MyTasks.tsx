import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import styles from './MyTasks.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
  completion_notes: string | null;
  assignment_id: string | null;
  assigned_by_name?: string;
  assignment_title?: string;
}

const MyTasks: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_by:user_profiles!tasks_assigned_by_fkey(full_name),
          assignment:assignments(title)
        `)
        .eq('assigned_to', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        assigned_by_name: item.assigned_by?.full_name || 'Unknown',
        assignment_title: item.assignment?.title || null
      })) || [];

      setTasks(transformedData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load tasks',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [profile?.id]);

  // Handle complete task
  const handleCompleteClick = (task: Task) => {
    setSelectedTask(task);
    setCompletionNotes('');
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async () => {
    if (!selectedTask) return;

    try {
      setCompleting(true);

      const { error } = await supabase.rpc('complete_task', {
        p_task_id: selectedTask.id,
        p_completion_notes: completionNotes || null
      });

      if (error) throw error;

      addToast({
        title: 'Task Completed',
        description: `"${selectedTask.title}" has been marked as complete`,
        type: 'success'
      });

      setShowCompleteModal(false);
      setSelectedTask(null);
      setCompletionNotes('');
      fetchTasks();
    } catch (error: any) {
      console.error('Error completing task:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to complete task',
        type: 'error'
      });
    } finally {
      setCompleting(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending' || task.status === 'in_progress';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') return task.status === 'overdue';
    return true;
  });

  // Count tasks by status
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'in_progress': return styles.statusInProgress;
      case 'completed': return styles.statusCompleted;
      case 'overdue': return styles.statusOverdue;
      case 'cancelled': return styles.statusCancelled;
      default: return styles.statusDefault;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return styles.priorityLow;
      case 'medium': return styles.priorityMedium;
      case 'high': return styles.priorityHigh;
      case 'urgent': return styles.priorityUrgent;
      default: return styles.priorityDefault;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'document_upload': return '📄';
      case 'training': return '🎓';
      case 'medical': return '⚕️';
      case 'compliance': return '✅';
      case 'onboarding': return '👋';
      case 'offboarding': return '👋';
      case 'general': return '📋';
      default: return '📌';
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  // Format category
  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Tasks</h1>
          <p className={styles.subtitle}>View and complete your assigned tasks</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{pendingCount}</h3>
            <p className={styles.statLabel}>Pending Tasks</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{completedCount}</h3>
            <p className={styles.statLabel}>Completed</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{overdueCount}</h3>
            <p className={styles.statLabel}>Overdue</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'pending' ? styles.filterActive : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'completed' ? styles.filterActive : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedCount})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'overdue' ? styles.filterActive : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue ({overdueCount})
        </button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No Tasks Found</h3>
          <p>
            {filter === 'all' 
              ? 'You have no tasks assigned yet'
              : `No ${filter} tasks`}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredTasks.map((task) => (
            <div key={task.id} className={styles.card}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.categoryIcon}>
                  {getCategoryIcon(task.category)}
                </div>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`${styles.badge} ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{task.title}</h3>
                {task.description && (
                  <p className={styles.cardDescription}>{task.description}</p>
                )}
                
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Category:</span>
                    <span className={styles.metaValue}>{formatCategory(task.category)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Assigned by:</span>
                    <span className={styles.metaValue}>{task.assigned_by_name}</span>
                  </div>
                  {task.assignment_title && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Related to:</span>
                      <span className={styles.metaValue}>{task.assignment_title}</span>
                    </div>
                  )}
                  {task.due_date && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Due date:</span>
                      <span className={`${styles.metaValue} ${task.status === 'overdue' ? styles.overdue : ''}`}>
                        {formatDate(task.due_date)}
                      </span>
                    </div>
                  )}
                </div>

                {task.status === 'completed' && task.completion_notes && (
                  <div className={styles.completionInfo}>
                    <p className={styles.completionLabel}>Completion notes:</p>
                    <p className={styles.completionNotes}>{task.completion_notes}</p>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              {task.status !== 'completed' && task.status !== 'cancelled' && (
                <div className={styles.cardActions}>
                  <button
                    className={styles.completeButton}
                    onClick={() => handleCompleteClick(task)}
                  >
                    ✓ Mark Complete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Task Modal */}
      {showCompleteModal && selectedTask && (
        <div className={styles.modal} onClick={() => setShowCompleteModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Complete Task</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowCompleteModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                You are about to mark <strong>"{selectedTask.title}"</strong> as complete.
              </p>
              <label className={styles.label}>
                Completion Notes (optional)
              </label>
              <textarea
                className={styles.textarea}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about completing this task..."
                rows={4}
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowCompleteModal(false)}
                disabled={completing}
              >
                Cancel
              </button>
              <button
                className={styles.submitButton}
                onClick={handleCompleteSubmit}
                disabled={completing}
              >
                {completing ? 'Completing...' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
