import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterInput, LoginInput } from '../validators/auth.validators';

const authService = new AuthService();

const IS_PROD = process.env.NODE_ENV === 'production';
const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    maxAge: ACCESS_MAX_AGE,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/api/auth/refresh',
    maxAge: REFRESH_MAX_AGE,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { httpOnly: true, secure: IS_PROD, sameSite: 'strict' });
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/api/auth/refresh',
  });
}

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RegisterInput = req.body;
      const { user, accessToken, refreshToken } = await authService.register(data);
      setAuthCookies(res, accessToken, refreshToken);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: LoginInput = req.body;
      const { user, accessToken, refreshToken } = await authService.login(data);
      setAuthCookies(res, accessToken, refreshToken);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.refresh_token;
      if (!token) {
        return res.status(401).json({ message: 'Kein Refresh-Token' });
      }
      const { user, accessToken, refreshToken } = await authService.refreshAccessToken(token);
      setAuthCookies(res, accessToken, refreshToken);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.refresh_token;
      if (token) {
        await authService.logout(token);
      }
      clearAuthCookies(res);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
