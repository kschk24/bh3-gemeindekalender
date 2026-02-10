// Shared types for Gemeindekalender

// User types
export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
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
  startDate: Date;
  endDate: Date;
  categoryId: string;
  category?: Category;
  imageUrl?: string;
  requiresAccount: boolean;
  maxParticipants?: number;
  accessibility?: AccessibilityInfo;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
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
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  eventId: string;
}

// API Request/Response types
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
}

export interface CreateEventDto {
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
  accessibility?: {
    wheelchairAccessible?: boolean;
    hearingLoop?: boolean;
    signLanguage?: boolean;
    easyLanguage?: boolean;
  };
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface CreateRegistrationDto {
  guestName?: string;
  guestEmail?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API Error Response
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
