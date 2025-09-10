import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
  },

  // Users
  getCurrentUser: async () => {
    const response = await apiClient.get('/user/me');
    return response.data;
  },

  // Assignments
  getAssignments: async () => {
    const response = await apiClient.get('/assignments');
    return response.data;
  },

  getAssignment: async (id: string) => {
    const response = await apiClient.get(`/assignments/${id}`);
    return response.data;
  },

  // Documents
  getDocuments: async () => {
    const response = await apiClient.get('/documents');
    return response.data;
  },

  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/documents/upload', formData);
    return response.data;
  },

  // Tasks
  getTasks: async () => {
    const response = await apiClient.get('/tasks');
    return response.data;
  },

  createTask: async (task: any) => {
    const response = await apiClient.post('/tasks', task);
    return response.data;
  },

  updateTask: async (id: string, task: any) => {
    const response = await apiClient.put(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: string) => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export default apiService;