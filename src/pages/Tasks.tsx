import React, { useState } from 'react';
import styles from './Tasks.module.css';
import { Button, Input } from '../components/ui';
import { Task } from '../types';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Upload Passport Copy',
    description: 'PDF or image format',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-01-15',
    assignmentId: 'assignment-1'
  },
  {
    id: '2',
    title: 'Complete Medical Check',
    description: 'Bring previous reports',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-10',
    assignmentId: 'assignment-2'
  },
  {
    id: '3',
    title: 'Submit Visa Application',
    description: 'Upload embassy receipt',
    status: 'completed',
    priority: 'urgent',
    dueDate: '2024-01-05',
    assignmentId: 'assignment-3'
  }
];

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New Task',
      description: 'Task description',
      status: 'todo',
      priority: 'medium'
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return '#6b7280';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return '#10b981';
      case 'medium': return '#3b82f6';
      case 'high': return '#f59e0b';
      case 'urgent': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tasks</h1>
        <div className={styles.controls}>
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={handleAddTask}>Add Task</Button>
        </div>
      </div>

      <div className={styles.taskList}>
        {filteredTasks.map(task => (
          <div key={task.id} className={styles.taskCard}>
            <div className={styles.taskHeader}>
              <h3>{task.title}</h3>
              <div className={styles.badges}>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {task.status.replace('_', ' ')}
                </span>
                <span 
                  className={styles.priorityBadge}
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                >
                  {task.priority}
                </span>
              </div>
            </div>
            
            {task.description && (
              <p className={styles.description}>{task.description}</p>
            )}
            
            {task.dueDate && (
              <p className={styles.dueDate}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            )}

            <div className={styles.actions}>
              {task.status === 'todo' && (
                <Button 
                  size="small"
                  onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                >
                  Start
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button 
                  size="small"
                  onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className={styles.emptyState}>
          <p>No tasks found</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;