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

export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/**
 * Téléversement direct navigateur -> Cloudinary (vidéos) avec suivi de progression.
 * Le serveur fournit seulement une signature : le fichier ne transite pas par l'API.
 */
export async function uploadVideoDirect(
  file: File,
  folder: 'gallery',
  onProgress?: (percent: number) => void
): Promise<{ url: string }> {
  const sig = await apiRequest<{
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
    eager?: string;
    eagerAsync?: boolean;
  }>(`/uploads/signature?folder=${folder}&resourceType=video`);

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);
  if (sig.eager) form.append('eager', sig.eager);
  if (sig.eagerAsync) form.append('eager_async', 'true');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) resolve({ url: body.secure_url });
        else reject(new Error(body?.error?.message || 'Échec du téléversement de la vidéo'));
      } catch {
        reject(new Error('Échec du téléversement de la vidéo'));
      }
    };
    xhr.onerror = () => reject(new Error('Connexion interrompue pendant le téléversement'));
    xhr.send(form);
  });
}

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

  getPaymentStatus: (id: string) =>
    apiRequest<{ paymentStatus: 'not_required' | 'pending' | 'paid' | 'failed'; ticketCode?: string }>(
      `/registrations/${encodeURIComponent(id)}/payment-status`
    ),

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

  getStatus: (id: string) =>
    apiRequest<{ status: 'pending' | 'completed' | 'failed'; amount: number; currency: string; provider?: 'stripe' | 'fedapay' }>(
      `/donations/${encodeURIComponent(id)}/status`
    ),

  getStats: () => apiRequest<{ totalAmount: number; count: number; avgAmount: number }>('/donations/stats'),

  updateStatus: (id: string, status: 'pending' | 'completed' | 'failed') =>
    apiRequest<any>(`/donations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  delete: (id: string) => apiRequest<{ message: string }>(`/donations/${id}`, { method: 'DELETE' }),
};

// ============ SUIVI DE PAIEMENT ============
/**
 * Interroge un statut de paiement jusqu'a ce qu'il soit tranche (ou jusqu'au delai).
 * Le serveur verifie lui-meme aupres de Stripe/FedaPay : on n'affiche jamais "valide"
 * sur la seule foi de l'URL de retour.
 */
export async function pollUntilSettled<T>(
  fetchStatus: () => Promise<T>,
  isSettled: (value: T) => boolean,
  { intervalMs = 2500, timeoutMs = 60000, signal }: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<T | null> {
  const deadline = Date.now() + timeoutMs;
  let last: T | null = null;
  while (!signal?.aborted) {
    try {
      last = await fetchStatus();
      if (isSettled(last)) return last;
    } catch {
      // erreur reseau ponctuelle : on reessaie jusqu'au delai
    }
    if (Date.now() + intervalMs > deadline) break;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return last;
}

/** Issue cote navigateur d'un paiement de billet, a confirmer ensuite par le serveur. */
export interface TicketPaymentResult {
  registrationId: string;
  /** paid/processing : le serveur doit encore confirmer ; failed : refuse immediatement. */
  kind: 'paid' | 'processing' | 'failed';
  message?: string;
}
