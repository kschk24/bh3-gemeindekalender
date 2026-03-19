import axios, { AxiosError } from 'axios';
import type {
  Event,
  Category,
  PaginatedResponse,
  EventFilters,
  AuthResponse,
  Registration,
  ApiError,
  Comment,
  CreateCommentInput,
  CreateEventData,
  UpdateEventData,
  AdminUser,
  AdminEvent,
  Role,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// In-memory CSRF token store
let csrfToken: string | null = null;

export function setCsrfToken(token: string) {
  csrfToken = token;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token to mutating requests
api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// EventTarget for auth events
export const authEvents = new EventTarget();

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

// Handle 401 — attempt token refresh, then retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      originalRequest?.url !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push(() => resolve(api(originalRequest!)));
        });
      }

      originalRequest!._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<AuthResponse>('/auth/refresh');
        isRefreshing = false;
        onRefreshed();
        // Update CSRF token if returned
        if ((data as { csrfToken?: string }).csrfToken) {
          setCsrfToken((data as { csrfToken?: string }).csrfToken!);
        }
        return api(originalRequest!);
      } catch {
        isRefreshing = false;
        refreshSubscribers = [];
        authEvents.dispatchEvent(new Event('unauthorized'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { email, password });
    return response.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Events Service
export const eventsService = {
  getAll: async (filters: EventFilters = {}): Promise<PaginatedResponse<Event>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<Event>>(`/events?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  create: async (data: CreateEventData): Promise<Event> => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEventData): Promise<Event> => {
    const response = await api.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  register: async (
    eventId: string,
    data?: { guestName?: string; guestEmail?: string }
  ): Promise<Registration> => {
    const response = await api.post<Registration>(`/events/${eventId}/register`, data || {});
    return response.data;
  },

  getMine: async (page = 1): Promise<PaginatedResponse<AdminEvent>> => {
    const response = await api.get<PaginatedResponse<AdminEvent>>('/events/mine', { params: { page } });
    return response.data;
  },

  getRegistrations: async (eventId: string): Promise<Registration[]> => {
    const response = await api.get<Registration[]>(`/events/${eventId}/registrations`);
    return response.data;
  },
};

// Categories Service
export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },
};

// Favorites Service
export const favoritesService = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/users/me/favorites');
    return response.data;
  },

  add: async (eventId: string): Promise<void> => {
    await api.post(`/users/me/favorites/${eventId}`);
  },

  remove: async (eventId: string): Promise<void> => {
    await api.delete(`/users/me/favorites/${eventId}`);
  },
};

// Comments Service
export const commentsService = {
  getByEventId: async (eventId: string, page?: number): Promise<Comment[]> => {
    const params = page ? `?page=${page}` : '';
    const response = await api.get<Comment[]>(`/events/${eventId}/comments${params}`);
    return response.data;
  },

  create: async (eventId: string, data: CreateCommentInput): Promise<Comment> => {
    const response = await api.post<Comment>(`/events/${eventId}/comments`, data);
    return response.data;
  },

  delete: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};

// Users Service (GDPR + Avatar)
export const usersService = {
  updateAvatar: async (avatar: string | null): Promise<import('../types').User> => {
    const response = await api.patch<import('../types').User>('/users/me/avatar', { avatar });
    return response.data;
  },

  exportData: async (): Promise<void> => {
    const response = await api.get('/users/me/export', { responseType: 'blob' });
    const url = URL.createObjectURL(response.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-data.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/me');
  },
};

// Admin Service
export const adminService = {
  getUsers: async (page = 1, limit = 20): Promise<PaginatedResponse<AdminUser>> => {
    const response = await api.get<PaginatedResponse<AdminUser>>(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  changeUserRole: async (userId: string, role: Role): Promise<AdminUser> => {
    const response = await api.patch<AdminUser>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  getEvents: async (page = 1, limit = 20): Promise<PaginatedResponse<AdminEvent>> => {
    const response = await api.get<PaginatedResponse<AdminEvent>>(`/admin/events?page=${page}&limit=${limit}`);
    return response.data;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await api.delete(`/admin/events/${eventId}`);
  },
};

export default api;
