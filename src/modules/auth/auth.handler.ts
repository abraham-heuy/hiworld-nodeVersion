import { Request, Response, NextFunction } from 'express';
import { AdminLoginDto } from '../../dtos/admin.dto';
import { SignupDto, LoginDto } from '../../dtos/other.dto';
import { HttpException } from '../../exceptions/HttpExceptions';
import { AuthService } from './auth.service';

export class AuthController {
  constructor(private authService: AuthService) {}

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: SignupDto = req.body;
      const result = await this.authService.signup(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: LoginDto = req.body;
      const { accessToken, refreshToken, user } = await this.authService.login(dto);
      res.json({ accessToken, refreshToken, user });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new HttpException(400, 'Refresh token required');
      const tokens = await this.authService.refreshTokens(refreshToken);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.sessionId; // set by protect middleware
      if (!sessionId) throw new HttpException(401, 'Not authenticated');
      await this.authService.logout(sessionId);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Admin only endpoints (protected by middleware)
  getWaitlist = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const waitlist = await this.authService.getWaitlist();
      res.json(waitlist);
    } catch (error) {
      next(error);
    }
  };

  approveWaitlistUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
    //   const adminId = req.authenticatedUser!.id;
      await this.authService.approveWaitlistUser( userId);
      res.json({ message: 'User approved successfully' });
    } catch (error) {
      next(error);
    }
  };

  generateInvites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.authenticatedUser!.id;
      const { count = 1, expiresDays = 30 } = req.body;
      const codes = await this.authService.generateInvites(adminId, count, expiresDays);
      res.json({ invites: codes });
    } catch (error) {
      next(error);
    }
  };

  adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: AdminLoginDto = req.body;
      const { accessToken, refreshToken, admin } = await this.authService.adminLogin(dto);
      res.json({ accessToken, refreshToken, admin });
    } catch (error) {
      next(error);
    }
  };
}