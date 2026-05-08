import api from './api';

export const authService = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

export const projectService = {
  getAll: () => api.get('/api/projects'),
  getById: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
};

export const taskService = {
  getAll: (params) => api.get('/api/tasks', { params }),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};

export const memberService = {
  getUsers: () => api.get('/api/users'),
  addMember: (projectId, userId) => api.post(`/api/projects/${projectId}/members`, { userId }),
  removeMember: (projectId, userId) => api.delete(`/api/projects/${projectId}/members/${userId}`),
};

export const dashboardService = {
  getStats: () => api.get('/api/dashboard/stats'),
  getOverdue: () => api.get('/api/dashboard/overdue'),
};
