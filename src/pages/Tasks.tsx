import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockTasks } from '../data/mockData';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  MoreVertical,
  Target,
  TrendingUp
} from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks] = useState(mockTasks);
  const [selectedTab, setSelectedTab] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'dueDate' | 'priority' | 'progress'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter tasks based on selected tab
  const filteredTasks = tasks.filter(task => {
    if (selectedTab === 'all') return true;
    return task.status === selectedTab;
  });

  // Filter by search query
  const searchFilteredTasks = filteredTasks.filter(task => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Sort tasks
  const sortedTasks = [...searchFilteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
        comparison = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#6b7280';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return Clock;
      case 'in_progress': return Play;
      case 'completed': return CheckSquare;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleStartTask = (taskId: string) => {
    console.log('Starting task:', taskId);
    alert('Task started! This would update the task status in a real application.');
  };

  const handleCompleteTask = (taskId: string) => {
    console.log('Completing task:', taskId);
    alert('Task completed! This would update the task status in a real application.');
  };

  const handlePauseTask = (taskId: string) => {
    console.log('Pausing task:', taskId);
    alert('Task paused! This would update the task status in a real application.');
  };

  const handleResetTask = (taskId: string) => {
    console.log('Resetting task:', taskId);
    alert('Task reset! This would reset the task progress in a real application.');
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const overdueTasks = tasks.filter(t => {
    const daysUntilDue = getDaysUntilDue(t.dueDate);
    return daysUntilDue < 0 && t.status !== 'completed';
  }).length;
  const averageProgress = tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
          Task Management
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Track and manage your maritime tasks and mobilization checklist
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={20} color="#3b82f6" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {totalTasks}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Tasks</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {todoTasks}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>To Do</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={20} color="#3b82f6" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {inProgressTasks}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>In Progress</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={20} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {completedTasks}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Completed</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fecaca', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {overdueTasks}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Overdue</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#e9d5ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#8b5cf6" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {Math.round(averageProgress)}%
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Avg Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {sortedTasks.map((task) => {
          const StatusIcon = getStatusIcon(task.status);
          const daysUntilDue = getDaysUntilDue(task.dueDate);
          const isOverdue = daysUntilDue < 0 && task.status !== 'completed';
          
          return (
            <div key={task.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}>
              {/* Header */}
              <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
                      {task.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {task.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      backgroundColor: `${getStatusColor(task.status)}20`,
                      borderRadius: '6px'
                    }}>
                      <StatusIcon size={14} color={getStatusColor(task.status)} />
                      <span style={{ fontSize: '12px', fontWeight: '500', color: getStatusColor(task.status) }}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority and Due Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={16} />
                    <span style={{ 
                      color: getPriorityColor(task.priority),
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} />
                    <span style={{ color: isOverdue ? '#ef4444' : '#6b7280' }}>
                      {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    Progress
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {task.progress}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${task.progress}%`,
                    height: '100%',
                    backgroundColor: getStatusColor(task.status),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {task.status === 'todo' && (
                    <button
                      onClick={() => handleStartTask(task.id)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Play size={16} />
                      Start
                    </button>
                  )}

                  {task.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckSquare size={16} />
                        Complete
                      </button>
                      <button
                        onClick={() => handlePauseTask(task.id)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Pause size={16} />
                        Pause
                      </button>
                    </>
                  )}

                  {task.status === 'completed' && (
                    <button
                      onClick={() => handleResetTask(task.id)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <RotateCcw size={16} />
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedTasks.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <CheckSquare size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
            No tasks found
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {searchQuery ? 'Try adjusting your search criteria' : 'No tasks match the selected filter'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Tasks;