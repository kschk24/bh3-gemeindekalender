import axios, { AxiosError } from 'axios';
import {
  Event,
  Category,
  PaginatedResponse,
  EventFilters,
  AuthResponse,
  Registration,
  ApiError,
  Comment,
  CreateCommentInput,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Could redirect to login here
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
};

// Events Service
export const eventsService = {
  getAll: async (filters: EventFilters = {}): Promise<PaginatedResponse<Event>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
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

  create: async (data: Partial<Event>): Promise<Event> => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Event>): Promise<Event> => {
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
  getByEventId: async (eventId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/events/${eventId}/comments`);
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

export default api;
