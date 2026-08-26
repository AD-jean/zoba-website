import type { Ticket } from '../types/database';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('adminToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(error.message || 'Erreur serveur');
  }

  return response.json();
}

// ============ UPLOADS ============
export const uploadsApi = {
  upload: async (file: File, folder: 'members' | 'activities' | 'news' | 'gallery'): Promise<{ url: string }> => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || 'Erreur serveur');
    }

    return response.json();
  },
};

// ============ AUTH ============
export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; admin: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verify: () =>
    apiRequest<{ valid: boolean; admin?: AdminUser }>('/auth/verify'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ============ MEMBERS ============
export const membersApi = {
  getAll: (organization?: string) =>
    apiRequest<any[]>(`/members${organization ? `?organization=${organization}` : ''}`),

  getById: (id: string) => apiRequest<any>(`/members/${id}`),

  create: (data: any) => apiRequest<any>('/members', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiRequest<{ message: string }>(`/members/${id}`, { method: 'DELETE' }),
};

// ============ ACTIVITIES ============
export const activitiesApi = {
  getAll: (filters?: { upcoming?: boolean; department?: string }) => {
    const params = new URLSearchParams();
    if (filters?.upcoming) params.append('upcoming', 'true');
    if (filters?.department) params.append('department', filters.department);
    return apiRequest<any[]>(`/activities?${params.toString()}`);
  },

  getById: (id: string) => apiRequest<any>(`/activities/${id}`),

  create: (data: any) => apiRequest<any>('/activities', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiRequest<{ message: string }>(`/activities/${id}`, { method: 'DELETE' }),
};

// ============ NEWS ============
export const newsApi = {
  getAll: (filters?: { limit?: number; category?: string }) => {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.category) params.append('category', filters.category);
    return apiRequest<any[]>(`/news?${params.toString()}`);
  },

  getById: (id: string) => apiRequest<any>(`/news/${id}`),

  create: (data: any) => apiRequest<any>('/news', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiRequest<{ message: string }>(`/news/${id}`, { method: 'DELETE' }),
};

// ============ GALLERY ============
export const galleryApi = {
  getAll: (filters?: { category?: string; department?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    return apiRequest<any[]>(`/gallery?${params.toString()}`);
  },

  getById: (id: string) => apiRequest<any>(`/gallery/${id}`),

  create: (data: any) => apiRequest<any>('/gallery', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiRequest<{ message: string }>(`/gallery/${id}`, { method: 'DELETE' }),
};

// ============ CONTACTS ============
export const contactsApi = {
  submit: (data: { name: string; email: string; phone?: string; message: string }) =>
    apiRequest<{ message: string; id: string }>('/contacts', { method: 'POST', body: JSON.stringify(data) }),

  getAll: (filters?: { unread?: boolean }) => {
    const params = filters?.unread ? '?unread=true' : '';
    return apiRequest<any[]>(`/contacts${params}`);
  },

  markAsRead: (id: string) => apiRequest<any>(`/contacts/${id}/read`, { method: 'PUT' }),

  delete: (id: string) => apiRequest<{ message: string }>(`/contacts/${id}`, { method: 'DELETE' }),
};

// ============ SUBSCRIBERS ============
export const subscribersApi = {
  subscribe: (email: string) =>
    apiRequest<{ message: string; id?: string }>('/subscribers', { method: 'POST', body: JSON.stringify({ email }) }),

  unsubscribe: (email: string) =>
    apiRequest<{ message: string }>('/subscribers/unsubscribe', { method: 'DELETE', body: JSON.stringify({ email }) }),

  getAll: () => apiRequest<any[]>('/subscribers'),

  setActive: (id: string, active: boolean) =>
    apiRequest<any>(`/subscribers/${id}`, { method: 'PUT', body: JSON.stringify({ active }) }),

  delete: (id: string) => apiRequest<{ message: string }>(`/subscribers/${id}`, { method: 'DELETE' }),
};

// ============ REGISTRATIONS ============
export const registrationsApi = {
  register: (data: { activityId: string; name: string; email: string; phone: string; church?: string; notes?: string }) =>
    apiRequest<{ message: string; id: string; ticketCode: string }>('/registrations', { method: 'POST', body: JSON.stringify(data) }),

  checkout: (data: { activityId: string; name: string; email: string; phone: string; church?: string; notes?: string; provider: 'stripe' | 'fedapay' }) =>
    apiRequest<
      | { provider: 'stripe'; clientSecret: string; id: string }
      | { provider: 'fedapay'; transactionId: number; id: string }
    >('/registrations/checkout', { method: 'POST', body: JSON.stringify(data) }),

  getTicket: (ticketCode: string) => apiRequest<Ticket>(`/registrations/ticket/${ticketCode}`),

  checkIn: (ticketCode: string) =>
    apiRequest<{ alreadyCheckedIn: boolean; name: string; checkedInAt: string }>(`/registrations/checkin/${ticketCode}`, { method: 'POST' }),

  getAll: (filters?: { activityId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.activityId) params.append('activityId', filters.activityId);
    if (filters?.status) params.append('status', filters.status);
    return apiRequest<any[]>(`/registrations?${params.toString()}`);
  },

  updateStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled') =>
    apiRequest<any>(`/registrations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  delete: (id: string) => apiRequest<{ message: string }>(`/registrations/${id}`, { method: 'DELETE' }),
};

// ============ DONATIONS ============
export const donationsApi = {
  record: (data: { donorName?: string; donorEmail?: string; donorPhone?: string; amount: number; currency?: string; paymentMethod: string; message?: string }) =>
    apiRequest<{ message: string; id: string }>('/donations', { method: 'POST', body: JSON.stringify(data) }),

  checkout: (data: { amount: number; currency?: string; provider: 'stripe' | 'fedapay'; donorName?: string; donorEmail?: string; donorPhone?: string }) =>
    apiRequest<
      | { provider: 'stripe'; url: string }
      | { provider: 'fedapay'; url: string }
    >('/donations/checkout', { method: 'POST', body: JSON.stringify(data) }),

  getAll: (filters?: { status?: string }) => {
    const params = filters?.status ? `?status=${filters.status}` : '';
    return apiRequest<any[]>(`/donations${params}`);
  },

  getStats: () => apiRequest<{ totalAmount: number; count: number; avgAmount: number }>('/donations/stats'),

  updateStatus: (id: string, status: 'pending' | 'completed' | 'failed') =>
    apiRequest<any>(`/donations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  delete: (id: string) => apiRequest<{ message: string }>(`/donations/${id}`, { method: 'DELETE' }),
};
