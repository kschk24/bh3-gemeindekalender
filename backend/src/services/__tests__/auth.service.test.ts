import { AuthService } from '../auth.service';
import { AppError } from '../../middleware/errorHandler';

// PrismaClient is auto-mocked via jest.config.ts moduleNameMapper
const { PrismaClient } = require('@prisma/client');
const prismaInstance = new PrismaClient();

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    it('throws 409 if email already exists', async () => {
      prismaInstance.user.findUnique.mockResolvedValue({ id: '1', email: 'a@b.de' });

      await expect(authService.register({ email: 'a@b.de', password: 'pw' }))
        .rejects.toThrow(AppError);
    });

    it('creates user and returns tokens', async () => {
      prismaInstance.user.findUnique.mockResolvedValue(null);
      prismaInstance.user.create.mockResolvedValue({
        id: '1', email: 'a@b.de', role: 'USER', createdAt: new Date(),
      });
      prismaInstance.refreshToken.create.mockResolvedValue({});

      const result = await authService.register({ email: 'a@b.de', password: 'pw' });
      expect(result.user.email).toBe('a@b.de');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('login', () => {
    it('throws 401 for unknown user', async () => {
      prismaInstance.user.findUnique.mockResolvedValue(null);

      await expect(authService.login({ email: 'x@y.de', password: 'pw' }))
        .rejects.toThrow(AppError);
    });

    it('throws 401 for wrong password', async () => {
      prismaInstance.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.de',
        passwordHash: '$2b$10$invalidhash',
        role: 'USER',
        createdAt: new Date(),
      });

      await expect(authService.login({ email: 'a@b.de', password: 'wrongpw' }))
        .rejects.toThrow(AppError);
    });
  });
});
