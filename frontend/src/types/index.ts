// User types
export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  category?: Category;
  imageUrl?: string;
  requiresAccount: boolean;
  maxParticipants?: number;
  accessibility?: AccessibilityInfo;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    registrations: number;
  };
}

export interface Category {
  id: string;
  name: string;
  color: string;
  _count?: {
    events: number;
  };
}

export interface AccessibilityInfo {
  id: string;
  eventId: string;
  wheelchairAccessible: boolean;
  hearingLoop: boolean;
  signLanguage: boolean;
  easyLanguage: boolean;
}

export interface Registration {
  id: string;
  userId?: string;
  eventId: string;
  guestName?: string;
  guestEmail?: string;
  createdAt: string;
}

// API types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EventFilters {
  search?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  wheelchairAccessible?: boolean;
  hearingLoop?: boolean;
  signLanguage?: boolean;
  easyLanguage?: boolean;
  page?: number;
  limit?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
