import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import styles from './TaskManagement.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  assigned_to: string;
  assignment_id: string | null;
  seafarer_name?: string;
  assignment_title?: string;
}

interface Seafarer {
  id: string;
  full_name: string;
  email: string;
}

interface Assignment {
  id: string;
  title: string;
  seafarer_id: string;
}

interface TaskFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  due_date: string;
  assigned_to: string;
  assignment_id: string;
}

const TaskManagement: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [seafarers, setSeafarers] = useState<Seafarer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
    assignment_id: ''
  });

  // Fetch tasks
  const fetchTasks = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          seafarer:user_profiles!tasks_assigned_to_fkey(full_name),
          assignment:assignments(title)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        seafarer_name: item.seafarer?.full_name || 'Unknown',
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

  // Fetch seafarers
  const fetchSeafarers = async () => {
    if (!profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('company_id', profile.company_id)
        .eq('user_type', 'seafarer')
        .order('full_name');

      if (error) throw error;
      setSeafarers(data || []);
    } catch (error) {
      console.error('Error fetching seafarers:', error);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    if (!profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, seafarer_id')
        .eq('company_id', profile.company_id)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchSeafarers();
    fetchAssignments();
  }, [profile?.company_id]);

  // Handle form input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // If assignment is selected, auto-fill the assigned_to field
    if (name === 'assignment_id' && value) {
      const assignment = assignments.find(a => a.id === value);
      if (assignment) {
        setFormData(prev => ({ ...prev, assigned_to: assignment.seafarer_id }));
      }
    }
  };

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.company_id || !formData.assigned_to) {
      addToast({
        title: 'Error',
        description: 'Please select a seafarer',
        type: 'error'
      });
      return;
    }

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to,
        assigned_by: profile.id,
        company_id: profile.company_id,
        assignment_id: formData.assignment_id || null
      };

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingId);

        if (error) throw error;

        addToast({
          title: 'Task Updated',
          description: 'Task has been updated successfully',
          type: 'success'
        });
      } else {
        // Create
        const { error } = await supabase
          .from('tasks')
          .insert(taskData);

        if (error) throw error;

        addToast({
          title: 'Task Created',
          description: 'Task has been assigned successfully',
          type: 'success'
        });
      }

      resetForm();
      fetchTasks();
    } catch (error: any) {
      console.error('Error saving task:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to save task',
        type: 'error'
      });
    }
  };

  // Handle edit
  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assigned_to: task.assigned_to,
      assignment_id: task.assignment_id || ''
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      addToast({
        title: 'Task Deleted',
        description: 'Task has been removed',
        type: 'success'
      });

      fetchTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete task',
        type: 'error'
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      due_date: '',
      assigned_to: '',
      assignment_id: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.seafarer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'in_progress': return styles.statusInProgress;
      case 'completed': return styles.statusCompleted;
      case 'overdue': return styles.statusOverdue;
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

  // Format category
  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Count tasks by status
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;

  // Get assignments for selected seafarer
  const filteredAssignments = formData.assigned_to
    ? assignments.filter(a => a.seafarer_id === formData.assigned_to)
    : assignments;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Task Management</h1>
          <p className={styles.subtitle}>Create and assign tasks to seafarers</p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => setShowForm(true)}
        >
          + Create Task
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{pendingCount}</h3>
            <p className={styles.statLabel}>Active Tasks</p>
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
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filterStatus === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${filterStatus === 'pending' ? styles.filterActive : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button
            className={`${styles.filterButton} ${filterStatus === 'completed' ? styles.filterActive : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
          <button
            className={`${styles.filterButton} ${filterStatus === 'overdue' ? styles.filterActive : ''}`}
            onClick={() => setFilterStatus('overdue')}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className={styles.modal} onClick={() => !editingId && resetForm()}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Edit Task' : 'Create New Task'}</h2>
              <button className={styles.closeButton} onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Task Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Upload Passport Copy"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide details about the task..."
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="general">General</option>
                    <option value="document_upload">Document Upload</option>
                    <option value="training">Training</option>
                    <option value="medical">Medical</option>
                    <option value="compliance">Compliance</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="offboarding">Offboarding</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Priority *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Assign to Seafarer *</label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Seafarer</option>
                  {seafarers.map(seafarer => (
                    <option key={seafarer.id} value={seafarer.id}>
                      {seafarer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Related Assignment (Optional)</label>
                <select
                  name="assignment_id"
                  value={formData.assignment_id}
                  onChange={handleInputChange}
                >
                  <option value="">No Assignment</option>
                  {filteredAssignments.map(assignment => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={resetForm} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingId ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <p>Create your first task to get started</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredTasks.map((task) => (
            <div key={task.id} className={styles.card}>
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

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{task.title}</h3>
                {task.description && (
                  <p className={styles.cardDescription}>{task.description}</p>
                )}
                
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Assigned to:</span>
                    <span className={styles.metaValue}>{task.seafarer_name}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Category:</span>
                    <span className={styles.metaValue}>{formatCategory(task.category)}</span>
                  </div>
                  {task.assignment_title && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Assignment:</span>
                      <span className={styles.metaValue}>{task.assignment_title}</span>
                    </div>
                  )}
                  {task.due_date && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Due:</span>
                      <span className={styles.metaValue}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEdit(task)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
