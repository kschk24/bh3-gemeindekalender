import { vi } from 'vitest';

export const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn().mockResolvedValue({ user: null }),
  logout: vi.fn(),
};

export const mockEventsService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  register: vi.fn(),
  getRegistrations: vi.fn(),
};

export const mockFavoritesService = {
  getAll: vi.fn().mockResolvedValue([]),
  add: vi.fn(),
  remove: vi.fn(),
};

vi.mock('../../services/api', () => ({
  authService: mockAuthService,
  eventsService: mockEventsService,
  favoritesService: mockFavoritesService,
  authEvents: new EventTarget(),
  setCsrfToken: vi.fn(),
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
