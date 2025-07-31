// API Service for BudgetFlip
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface Project {
  id: string;
  display_id?: string;
  name: string;
  address?: string;
  budget: number;
  start_date?: string;
  target_end_date?: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  total_spent?: number;
  expense_count?: number;
  members?: User[];
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  project_id: string;
  amount: number;
  vendor: string;
  description?: string;
  date: string;
  category_id?: string;
  status?: 'pending' | 'approved' | 'paid' | 'rejected';
  created_at: string;
  category_name?: string;
  category_color?: string;
}

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper for API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error?.message || 'API request failed');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    // Save tokens
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Save tokens
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Update tokens
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response.data.token;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiRequest('/projects');
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiRequest(`/projects/${id}`);
    return response.data;
  },

  create: async (project: Partial<Project>): Promise<Project> => {
    const response = await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
    return response.data;
  },

  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const response = await apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  addMember: async (projectId: string, email: string, role: string = 'member'): Promise<void> => {
    await apiRequest(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  removeMember: async (projectId: string, memberId: string): Promise<void> => {
    await apiRequest(`/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE',
    });
  },
};

// Expenses API
export const expensesAPI = {
  getByProject: async (projectId: string): Promise<Expense[]> => {
    const response = await apiRequest(`/expenses/project/${projectId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await apiRequest(`/expenses/${id}`);
    return response.data;
  },

  create: async (expense: Partial<Expense>): Promise<Expense> => {
    const response = await apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    return response.data;
  },

  update: async (id: string, updates: Partial<Expense>): Promise<Expense> => {
    const response = await apiRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  getCategories: async (): Promise<any[]> => {
    const response = await apiRequest('/expenses/categories');
    return response.data;
  },

  getStats: async (projectId: string): Promise<any> => {
    const response = await apiRequest(`/expenses/project/${projectId}/stats`);
    return response.data;
  },
};

// Error handler with token refresh
export const setupAPIInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    let response = await originalFetch(...args);
    
    // If we get a 401, try to refresh the token
    if (response.status === 401 && !args[0].toString().includes('/auth/')) {
      try {
        await authAPI.refreshToken();
        // Retry the original request with new token
        const [url, options] = args;
        response = await originalFetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            ...getAuthHeaders(),
          },
        });
      } catch (error) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return response;
  };
};