import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockAssignments, mockDocuments, mockTasks, mockTraining, mockNotifications } from '../data/mockData';

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

interface AppState {
  assignments: typeof mockAssignments;
  documents: typeof mockDocuments;
  tasks: typeof mockTasks;
  training: typeof mockTraining;
  notifications: typeof mockNotifications;
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    loading: boolean;
    error: string | null;
    success: string | null;
  };
  filters: {
    assignments: {
      status: string;
      search: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    };
    documents: {
      category: string;
      search: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    };
    tasks: {
      status: string;
      search: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    };
    training: {
      status: string;
      search: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    };
    notifications: {
      status: string;
      search: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    };
  };
}

// ============================================================================
// ACTION TYPES
// ============================================================================

type AppAction =
  // UI Actions
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  
  // Assignment Actions
  | { type: 'UPDATE_ASSIGNMENT'; payload: { id: string; updates: Partial<typeof mockAssignments[0]> } }
  | { type: 'ACCEPT_ASSIGNMENT'; payload: string }
  | { type: 'REJECT_ASSIGNMENT'; payload: string }
  
  // Document Actions
  | { type: 'UPLOAD_DOCUMENT'; payload: typeof mockDocuments[0] }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<typeof mockDocuments[0]> } }
  
  // Task Actions
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<typeof mockTasks[0]> } }
  | { type: 'START_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'PAUSE_TASK'; payload: string }
  | { type: 'RESET_TASK'; payload: string }
  | { type: 'ADD_TASK'; payload: typeof mockTasks[0] }
  | { type: 'DELETE_TASK'; payload: string }
  
  // Training Actions
  | { type: 'ENROLL_COURSE'; payload: string }
  | { type: 'START_COURSE'; payload: string }
  | { type: 'COMPLETE_COURSE'; payload: string }
  | { type: 'UPDATE_COURSE_PROGRESS'; payload: { id: string; progress: number } }
  
  // Notification Actions
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_NOTIFICATION_UNREAD'; payload: string }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'ARCHIVE_NOTIFICATION'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: typeof mockNotifications[0] }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  
  // Filter Actions
  | { type: 'SET_FILTER'; payload: { section: keyof AppState['filters']; filter: string; value: any } }
  | { type: 'RESET_FILTERS'; payload: keyof AppState['filters'] };

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AppState = {
  assignments: mockAssignments,
  documents: mockDocuments,
  tasks: mockTasks,
  training: mockTraining,
  notifications: mockNotifications,
  ui: {
    sidebarOpen: false,
    theme: 'light',
    loading: false,
    error: null,
    success: null,
  },
  filters: {
    assignments: {
      status: 'all',
      search: '',
      sortBy: 'date',
      sortOrder: 'desc',
    },
    documents: {
      category: 'all',
      search: '',
      sortBy: 'name',
      sortOrder: 'asc',
    },
    tasks: {
      status: 'all',
      search: '',
      sortBy: 'dueDate',
      sortOrder: 'asc',
    },
    training: {
      status: 'all',
      search: '',
      sortBy: 'title',
      sortOrder: 'asc',
    },
    notifications: {
      status: 'all',
      search: '',
      sortBy: 'date',
      sortOrder: 'desc',
    },
  },
};

// ============================================================================
// REDUCER
// ============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // UI Actions
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen,
        },
      };
    
    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
          success: null,
        },
      };
    
    case 'SET_SUCCESS':
      return {
        ...state,
        ui: {
          ...state.ui,
          success: action.payload,
          error: null,
        },
      };
    
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: null,
          success: null,
        },
      };

    // Assignment Actions
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(assignment =>
          assignment.id === action.payload.id
            ? { ...assignment, ...action.payload.updates }
            : assignment
        ),
      };
    
    case 'ACCEPT_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(assignment =>
          assignment.id === action.payload
            ? { 
                ...assignment, 
                status: 'accepted' as any,
                respondedAt: new Date().toISOString(),
                responseMessage: 'Assignment accepted'
              }
            : assignment
        ),
        ui: {
          ...state.ui,
          success: 'Assignment accepted successfully!',
        },
      };
    
    case 'REJECT_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(assignment =>
          assignment.id === action.payload
            ? { 
                ...assignment, 
                status: 'rejected' as any,
                respondedAt: new Date().toISOString(),
                responseMessage: 'Assignment rejected'
              }
            : assignment
        ),
        ui: {
          ...state.ui,
          success: 'Assignment rejected successfully!',
        },
      };

    // Document Actions
    case 'UPLOAD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload],
        ui: {
          ...state.ui,
          success: 'Document uploaded successfully!',
        },
      };
    
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        ui: {
          ...state.ui,
          success: 'Document deleted successfully!',
        },
      };
    
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id
            ? { ...doc, ...action.payload.updates }
            : doc
        ),
      };

    // Task Actions
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };
    
    case 'START_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, status: 'in_progress' as any, updatedAt: new Date().toISOString() }
            : task
        ),
        ui: {
          ...state.ui,
          success: 'Task started successfully!',
        },
      };
    
    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { 
                ...task, 
                status: 'completed' as any, 
                progress: 100,
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : task
        ),
        ui: {
          ...state.ui,
          success: 'Task completed successfully!',
        },
      };
    
    case 'PAUSE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, status: 'todo' as any, updatedAt: new Date().toISOString() }
            : task
        ),
        ui: {
          ...state.ui,
          success: 'Task paused successfully!',
        },
      };
    
    case 'RESET_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { 
                ...task, 
                status: 'todo' as any, 
                progress: 0,
                completedAt: undefined,
                updatedAt: new Date().toISOString()
              }
            : task
        ),
        ui: {
          ...state.ui,
          success: 'Task reset successfully!',
        },
      };
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        ui: {
          ...state.ui,
          success: 'Task added successfully!',
        },
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        ui: {
          ...state.ui,
          success: 'Task deleted successfully!',
        },
      };

    // Training Actions
    case 'ENROLL_COURSE':
      return {
        ...state,
        training: state.training.map(course =>
          course.id === action.payload
            ? { 
                ...course, 
                status: 'enrolled' as any,
                enrolledAt: new Date().toISOString(),
                progress: 0
              }
            : course
        ),
        ui: {
          ...state.ui,
          success: 'Successfully enrolled in course!',
        },
      };
    
    case 'START_COURSE':
      return {
        ...state,
        training: state.training.map(course =>
          course.id === action.payload
            ? { ...course, status: 'in_progress' as any }
            : course
        ),
        ui: {
          ...state.ui,
          success: 'Course started successfully!',
        },
      };
    
    case 'COMPLETE_COURSE':
      return {
        ...state,
        training: state.training.map(course =>
          course.id === action.payload
            ? { 
                ...course, 
                status: 'completed' as any,
                progress: 100,
                completedAt: new Date().toISOString()
              }
            : course
        ),
        ui: {
          ...state.ui,
          success: 'Course completed successfully!',
        },
      };
    
    case 'UPDATE_COURSE_PROGRESS':
      return {
        ...state,
        training: state.training.map(course =>
          course.id === action.payload.id
            ? { ...course, progress: action.payload.progress }
            : course
        ),
      };

    // Notification Actions
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        ),
      };
    
    case 'MARK_NOTIFICATION_UNREAD':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: false, readAt: undefined }
            : notification
        ),
      };
    
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        ui: {
          ...state.ui,
          success: 'Notification deleted successfully!',
        },
      };
    
    case 'ARCHIVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        ),
        ui: {
          ...state.ui,
          success: 'Notification archived successfully!',
        },
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          !notification.read
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        ),
        ui: {
          ...state.ui,
          success: 'All notifications marked as read!',
        },
      };
    
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        ui: {
          ...state.ui,
          success: 'All notifications cleared!',
        },
      };

    // Filter Actions
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.section]: {
            ...state.filters[action.payload.section],
            [action.payload.filter]: action.payload.value,
          },
        },
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload]: initialState.filters[action.payload],
        },
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // UI Actions
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  clearMessages: () => void;
  
  // Assignment Actions
  updateAssignment: (id: string, updates: Partial<typeof mockAssignments[0]>) => void;
  acceptAssignment: (id: string) => void;
  rejectAssignment: (id: string) => void;
  
  // Document Actions
  uploadDocument: (document: typeof mockDocuments[0]) => void;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<typeof mockDocuments[0]>) => void;
  
  // Task Actions
  updateTask: (id: string, updates: Partial<typeof mockTasks[0]>) => void;
  startTask: (id: string) => void;
  completeTask: (id: string) => void;
  pauseTask: (id: string) => void;
  resetTask: (id: string) => void;
  addTask: (task: typeof mockTasks[0]) => void;
  deleteTask: (id: string) => void;
  
  // Training Actions
  enrollCourse: (id: string) => void;
  startCourse: (id: string) => void;
  completeCourse: (id: string) => void;
  updateCourseProgress: (id: string, progress: number) => void;
  
  // Notification Actions
  markNotificationRead: (id: string) => void;
  markNotificationUnread: (id: string) => void;
  deleteNotification: (id: string) => void;
  archiveNotification: (id: string) => void;
  addNotification: (notification: typeof mockNotifications[0]) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  
  // Filter Actions
  setFilter: (section: keyof AppState['filters'], filter: string, value: any) => void;
  resetFilters: (section: keyof AppState['filters']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (state.ui.success || state.ui.error) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_MESSAGES' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.ui.success, state.ui.error]);

  // UI Actions
  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const setTheme = (theme: 'light' | 'dark' | 'system') => dispatch({ type: 'SET_THEME', payload: theme });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const setSuccess = (success: string | null) => dispatch({ type: 'SET_SUCCESS', payload: success });
  const clearMessages = () => dispatch({ type: 'CLEAR_MESSAGES' });

  // Assignment Actions
  const updateAssignment = (id: string, updates: Partial<typeof mockAssignments[0]>) => 
    dispatch({ type: 'UPDATE_ASSIGNMENT', payload: { id, updates } });
  const acceptAssignment = (id: string) => dispatch({ type: 'ACCEPT_ASSIGNMENT', payload: id });
  const rejectAssignment = (id: string) => dispatch({ type: 'REJECT_ASSIGNMENT', payload: id });

  // Document Actions
  const uploadDocument = (document: typeof mockDocuments[0]) => 
    dispatch({ type: 'UPLOAD_DOCUMENT', payload: document });
  const deleteDocument = (id: string) => dispatch({ type: 'DELETE_DOCUMENT', payload: id });
  const updateDocument = (id: string, updates: Partial<typeof mockDocuments[0]>) => 
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { id, updates } });

  // Task Actions
  const updateTask = (id: string, updates: Partial<typeof mockTasks[0]>) => 
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  const startTask = (id: string) => dispatch({ type: 'START_TASK', payload: id });
  const completeTask = (id: string) => dispatch({ type: 'COMPLETE_TASK', payload: id });
  const pauseTask = (id: string) => dispatch({ type: 'PAUSE_TASK', payload: id });
  const resetTask = (id: string) => dispatch({ type: 'RESET_TASK', payload: id });
  const addTask = (task: typeof mockTasks[0]) => dispatch({ type: 'ADD_TASK', payload: task });
  const deleteTask = (id: string) => dispatch({ type: 'DELETE_TASK', payload: id });

  // Training Actions
  const enrollCourse = (id: string) => dispatch({ type: 'ENROLL_COURSE', payload: id });
  const startCourse = (id: string) => dispatch({ type: 'START_COURSE', payload: id });
  const completeCourse = (id: string) => dispatch({ type: 'COMPLETE_COURSE', payload: id });
  const updateCourseProgress = (id: string, progress: number) => 
    dispatch({ type: 'UPDATE_COURSE_PROGRESS', payload: { id, progress } });

  // Notification Actions
  const markNotificationRead = (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  const markNotificationUnread = (id: string) => dispatch({ type: 'MARK_NOTIFICATION_UNREAD', payload: id });
  const deleteNotification = (id: string) => dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  const archiveNotification = (id: string) => dispatch({ type: 'ARCHIVE_NOTIFICATION', payload: id });
  const addNotification = (notification: typeof mockNotifications[0]) => 
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  const markAllNotificationsRead = () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  const clearAllNotifications = () => dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });

  // Filter Actions
  const setFilter = (section: keyof AppState['filters'], filter: string, value: any) => 
    dispatch({ type: 'SET_FILTER', payload: { section, filter, value } });
  const resetFilters = (section: keyof AppState['filters']) => 
    dispatch({ type: 'RESET_FILTERS', payload: section });

  const value: AppContextType = {
    state,
    dispatch,
    
    // UI Actions
    toggleSidebar,
    setTheme,
    setLoading,
    setError,
    setSuccess,
    clearMessages,
    
    // Assignment Actions
    updateAssignment,
    acceptAssignment,
    rejectAssignment,
    
    // Document Actions
    uploadDocument,
    deleteDocument,
    updateDocument,
    
    // Task Actions
    updateTask,
    startTask,
    completeTask,
    pauseTask,
    resetTask,
    addTask,
    deleteTask,
    
    // Training Actions
    enrollCourse,
    startCourse,
    completeCourse,
    updateCourseProgress,
    
    // Notification Actions
    markNotificationRead,
    markNotificationUnread,
    deleteNotification,
    archiveNotification,
    addNotification,
    markAllNotificationsRead,
    clearAllNotifications,
    
    // Filter Actions
    setFilter,
    resetFilters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
