import React, { useState } from 'react';
import styles from './Tasks.module.css';
import { Button, Input, ProgressIndicator, EmptyState } from '../components/ui';
import { useDemo } from '../contexts/DemoContext';
import { TaskStatus } from '../types';

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
  const { tasks, completeTask, updateTaskProgress, isProcessing, lastAction } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTask = () => {
    // TODO: Implement add task functionality
    console.log('Adding new task');
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === TaskStatus.COMPLETED) {
      await completeTask(taskId);
    } else {
      // Update progress based on status
      const progress = newStatus === TaskStatus.IN_PROGRESS ? 50 : 0;
      await updateTaskProgress(taskId, progress);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return '#6b7280';
      case TaskStatus.IN_PROGRESS: return '#3b82f6';
      case TaskStatus.COMPLETED: return '#10b981';
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
      {/* Processing Indicator */}
      {isProcessing && (
        <div className={styles.processingIndicator}>
          <div className={styles.processingSpinner}></div>
          <span className={styles.processingText}>{lastAction}</span>
        </div>
      )}

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

            {/* Progress Indicator */}
            <ProgressIndicator
              progress={task.progress || 0}
              animated={true}
              showPercentage={true}
              size="small"
              variant={task.status === TaskStatus.COMPLETED ? 'success' : 'default'}
            />

            <div className={styles.actions}>
              {task.status === TaskStatus.TODO && (
                <Button 
                  size="small"
                  onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.IN_PROGRESS)}
                >
                  Start
                </Button>
              )}
              {task.status === TaskStatus.IN_PROGRESS && (
                <Button 
                  size="small"
                  onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.COMPLETED)}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <EmptyState
          icon="📋"
          title="No tasks found"
          description={
            searchQuery 
              ? `No tasks match "${searchQuery}". Try adjusting your search criteria.`
              : "You don't have any tasks assigned at the moment."
          }
          suggestions={[
            "Check if you have pending assignments",
            "Complete document uploads",
            "Contact your company for new tasks",
            "Update your profile information"
          ]}
          action={searchQuery ? {
            label: "Clear Search",
            onClick: () => setSearchQuery("")
          } : {
            label: "Add New Task",
            onClick: handleAddTask
          }}
        />
      )}
    </div>
  );
};

export default Tasks;