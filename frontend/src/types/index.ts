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
  EVENT_MANAGER = 'EVENT_MANAGER',
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
    comments: number;
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
  categoryId?: string | string[];
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
}

export interface RefreshResponse {
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

export type ApiResult<T> = { success: true; data: T } | { success: false; error: ApiError };

export interface AccessibilityInput {
  wheelchairAccessible?: boolean;
  hearingLoop?: boolean;
  signLanguage?: boolean;
  easyLanguage?: boolean;
}

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  imageUrl?: string;
  requiresAccount?: boolean;
  maxParticipants?: number;
  createdBy?: string;
  accessibility?: AccessibilityInput;
}

export type UpdateEventData = Partial<CreateEventData>;
export type UserProfile = Pick<User, 'id' | 'email' | 'role' | 'createdAt'>;

// Comment types
export interface Comment {
  id: string;
  content: string;
  eventId: string;
  userId?: string;
  guestName?: string;
  user?: {
    id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  content: string;
  guestName?: string;
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  _count: { comments: number; favorites: number };
}

export interface AdminEvent {
  id: string;
  title: string;
  startDate: string;
  createdBy: string;
  category: Category;
  _count: { registrations: number };
}
