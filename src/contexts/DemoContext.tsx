import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Assignment, Document, Task, Notification, AssignmentStatus, TaskStatus, DocumentStatus } from '../types';
import { mockAssignments, mockDocuments, mockTasks, mockNotifications } from '../data/mockData';

interface DemoState {
  assignments: Assignment[];
  documents: Document[];
  tasks: Task[];
  notifications: Notification[];
  isProcessing: boolean;
  lastAction: string | null;
}

interface DemoActions {
  acceptAssignment: (assignmentId: string) => Promise<void>;
  declineAssignment: (assignmentId: string) => Promise<void>;
  uploadDocument: (document: Partial<Document>) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  updateTaskProgress: (taskId: string, progress: number) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: Partial<Notification>) => Promise<void>;
  simulateRealTimeUpdate: () => void;
}

interface DemoContextType extends DemoState, DemoActions {}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      simulateRealTimeUpdate();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const simulateRealTimeUpdate = () => {
    // Randomly add new notifications
    if (Math.random() > 0.7) {
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        title: "New Assignment Available",
        message: "A new Chief Officer position has been posted for MV ATLANTIC STAR",
        type: "assignment" as any,
        priority: "medium" as any,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: "/assignments",
        metadata: {
          vesselName: "MV ATLANTIC STAR",
          position: "Chief Officer",
          company: "Atlantic Shipping Ltd"
        }
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }

    // Randomly update task progress
    if (Math.random() > 0.8) {
      setTasks(prev => prev.map(task => {
        if (task.status === TaskStatus.IN_PROGRESS && Math.random() > 0.5) {
          const newProgress = Math.min(100, task.progress + Math.floor(Math.random() * 20));
          return {
            ...task,
            progress: newProgress,
            status: newProgress === 100 ? TaskStatus.COMPLETED : task.status,
            updatedAt: new Date().toISOString()
          };
        }
        return task;
      }));
    }
  };

  const acceptAssignment = async (assignmentId: string): Promise<void> => {
    setIsProcessing(true);
    setLastAction('Accepting assignment...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, status: AssignmentStatus.ACCEPTED, updatedAt: new Date().toISOString() }
        : assignment
    ));

    // Add success notification
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      const successNotification: Notification = {
        id: `notif_${Date.now()}`,
        title: "Assignment Accepted",
        message: `You have successfully accepted the ${assignment.position} position on ${assignment.vessel.name}`,
        type: "success" as any,
        priority: "medium" as any,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/assignments/${assignmentId}`,
        metadata: {
          assignmentId,
          vesselName: assignment.vessel.name,
          position: assignment.position
        }
      };
      
      setNotifications(prev => [successNotification, ...prev]);
    }

    setIsProcessing(false);
    setLastAction('Assignment accepted successfully!');
    
    // Clear action after 3 seconds
    setTimeout(() => setLastAction(null), 3000);
  };

  const declineAssignment = async (assignmentId: string): Promise<void> => {
    setIsProcessing(true);
    setLastAction('Declining assignment...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, status: AssignmentStatus.DECLINED, updatedAt: new Date().toISOString() }
        : assignment
    ));

    setIsProcessing(false);
    setLastAction('Assignment declined');
    
    setTimeout(() => setLastAction(null), 3000);
  };

  const uploadDocument = async (document: Partial<Document>): Promise<void> => {
    setIsProcessing(true);
    setLastAction('Uploading document...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newDocument: Document = {
      id: `doc_${Date.now()}`,
      type: document.type || "certificate" as any,
      title: document.title || "New Document",
      description: document.description || "",
      fileName: document.fileName || "document.pdf",
      fileSize: document.fileSize || 1024000,
      mimeType: document.mimeType || "application/pdf",
      uploadDate: new Date().toISOString(),
      expiryDate: document.expiryDate,
      status: DocumentStatus.VALID,
      issuingAuthority: document.issuingAuthority || "Maritime Authority",
      documentNumber: document.documentNumber || `DOC-${Date.now()}`,
      category: document.category || "certificate",
      tags: document.tags || [],
      metadata: document.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setDocuments(prev => [newDocument, ...prev]);

    // Add success notification
    const successNotification: Notification = {
      id: `notif_${Date.now()}`,
      title: "Document Uploaded",
      message: `${newDocument.title} has been successfully uploaded and verified`,
      type: "success" as any,
      priority: "low" as any,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: "/documents",
      metadata: {
        documentId: newDocument.id,
        documentType: newDocument.type,
        fileName: newDocument.fileName
      }
    };
    
    setNotifications(prev => [successNotification, ...prev]);

    setIsProcessing(false);
    setLastAction('Document uploaded successfully!');
    
    setTimeout(() => setLastAction(null), 3000);
  };

  const completeTask = async (taskId: string): Promise<void> => {
    setIsProcessing(true);
    setLastAction('Completing task...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: TaskStatus.COMPLETED, 
            progress: 100,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : task
    ));

    setIsProcessing(false);
    setLastAction('Task completed!');
    
    setTimeout(() => setLastAction(null), 3000);
  };

  const updateTaskProgress = async (taskId: string, progress: number): Promise<void> => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            progress: Math.max(0, Math.min(100, progress)),
            status: progress === 100 ? TaskStatus.COMPLETED : TaskStatus.IN_PROGRESS,
            updatedAt: new Date().toISOString()
          }
        : task
    ));
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true, updatedAt: new Date().toISOString() }
        : notification
    ));
  };

  const addNotification = async (notification: Partial<Notification>): Promise<void> => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      title: notification.title || "New Notification",
      message: notification.message || "",
      type: notification.type || "info" as any,
      priority: notification.priority || "medium" as any,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata || {}
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const value: DemoContextType = {
    assignments,
    documents,
    tasks,
    notifications,
    isProcessing,
    lastAction,
    acceptAssignment,
    declineAssignment,
    uploadDocument,
    completeTask,
    updateTaskProgress,
    markNotificationAsRead,
    addNotification,
    simulateRealTimeUpdate
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};

export default DemoProvider;
