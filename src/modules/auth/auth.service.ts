import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  generateSessionId,
  verifyRefreshToken,
  TokenPayload
} from '../../utils/jwt';
import { BadRequestException, UnauthorizedException, ConflictException, NotFoundException } from '../../exceptions/HttpExceptions';
import { AdminLoginDto } from '../../dtos/admin.dto';
import { SignupDto, LoginDto } from '../../dtos/other.dto';
import { Invite } from '../../entities/invite.entity';
import { Session } from '../../entities/session.entity';
import { User } from '../../entities/user.entity';
import { Admin } from '../../entities/admin.entity';

export class AuthService {
  constructor(
    private userRepo: Repository<User>,
    private inviteRepo: Repository<Invite>,
    private adminRepo: Repository<Admin>,
    private sessionRepo: Repository<Session>
  ) {}

  async signup(dto: SignupDto): Promise<{ message: string }> {
    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }]
    });
    if (existing) throw new ConflictException('Email or username already taken');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      date: new Date(),
      lastactive: new Date(),
      lastlogon: new Date(),
      is_active: false,
    });

    if (dto.inviteCode) {
      const invite = await this.inviteRepo.findOne({
        where: { code: dto.inviteCode, status: 'unused' }
      });
      if (!invite || (invite.expires_at && invite.expires_at < new Date())) {
        throw new BadRequestException('Invalid or expired invite code');
      }
      user.is_active = true;
      user.is_waitlisted = false;
      user.activated_at = new Date();
      user.used_invite_id = invite.id;
      invite.status = 'used';
      invite.used_by_id = user.id;
      await this.inviteRepo.save(invite);
    } else {
      user.is_waitlisted = true;
      user.waitlisted_at = new Date();
      const lastWait = await this.userRepo.findOne({
        where: { is_waitlisted: true },
        order: { waitlist_position: 'DESC' }
      });
      user.waitlist_position = lastWait ? (lastWait.waitlist_position || 0) + 1 : 1;
    }

    await this.userRepo.save(user);
    return {
      message: user.is_active
        ? 'Account created! You can now log in.'
        : 'You have been added to the waitlist. You will receive an email once approved.'
    };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.is_active) throw new UnauthorizedException('Account not activated. Check waitlist or use invite.');

    const sessionId = generateSessionId();
    const session = this.sessionRepo.create({
      sessionId,
      userId: user.id,
      user: user.username,
      lastLogon: new Date(),
      lastActivity: new Date(),
      active: true,
    });
    await this.sessionRepo.save(session);

    user.lastlogon = new Date();
    await this.userRepo.save(user);

    const accessPayload: TokenPayload = { userId: user.id, username: user.username, sessionId };
    const refreshPayload = { userId: user.id, username: user.username };
    const accessToken = generateAccessToken(accessPayload);
    const refreshToken = generateRefreshToken(refreshPayload);
    return { accessToken, refreshToken, user };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) throw new UnauthorizedException('Invalid refresh token');

    // Find the most recent active session for this user
    const session = await this.sessionRepo.findOne({
      where: { userId: payload.userId, active: true },
      order: { lastActivity: 'DESC' }
    });
    if (!session) throw new UnauthorizedException('No active session found');

    const user = await this.userRepo.findOne({ where: { id: payload.userId, is_active: true } });
    if (!user) throw new UnauthorizedException('User not found or inactive');

    session.lastActivity = new Date();
    await this.sessionRepo.save(session);

    const newAccessPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      sessionId: session.sessionId
    };
    const newRefreshPayload = { userId: user.id, username: user.username };
    const newAccessToken = generateAccessToken(newAccessPayload);
    const newRefreshToken = generateRefreshToken(newRefreshPayload);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionRepo.update({ sessionId }, { active: false });
  }

  async adminLogin(dto: AdminLoginDto): Promise<{ accessToken: string; refreshToken: string; admin: Admin }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || user.rank < 10) throw new UnauthorizedException('Not an admin account');

    const admin = await this.adminRepo.findOne({ where: { userId: user.id }, relations: ['user'] });
    if (!admin || !admin.is_active) throw new UnauthorizedException('Admin account disabled');

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid password');

    // Use camelCase property verificationMethods
    if (admin.verification_methods?.totp) {
      if (!dto.totpCode) throw new BadRequestException('TOTP code required');
      // TODO: verify TOTP
    }

    const sessionId = generateSessionId();
    const session = this.sessionRepo.create({
      sessionId,
      userId: user.id,
      user: user.username,
      lastLogon: new Date(),
      lastActivity: new Date(),
      active: true,
    });
    await this.sessionRepo.save(session);

    admin.last_login = new Date();  // camelCase
    await this.adminRepo.save(admin);

    const accessPayload: TokenPayload = { userId: user.id, username: user.username, sessionId };
    const refreshPayload = { userId: user.id, username: user.username };
    const accessToken = generateAccessToken(accessPayload);
    const refreshToken = generateRefreshToken(refreshPayload);
    return { accessToken, refreshToken, admin };
  }

  async getWaitlist(): Promise<User[]> {
    return this.userRepo.find({
      where: { is_waitlisted: true, is_active: false },
      order: { waitlist_position: 'ASC' }
    });
  }

  async approveWaitlistUser(userId: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId, is_waitlisted: true } });
    if (!user) throw new NotFoundException('User not on waitlist');
    user.is_waitlisted = false;
    user.is_active = true;
    user.activated_at = new Date();
    await this.userRepo.save(user);
  }

  async generateInvites(adminId: string, count = 1, expiresDays = 30): Promise<string[]> {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = `HIW-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const invite = this.inviteRepo.create({
        code,
        created_by_id: adminId,
        expires_at: new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000),
        status: 'unused'
      });
      await this.inviteRepo.save(invite);
      codes.push(code);
    }
    return codes;
  }
}