import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

type SafeUser = { id: number; name: string; email: string; createdAt: Date };

export type AuthResponse = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Користувач з таким email вже існує');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({ name: dto.name, email: dto.email, password: hash });
    const saved = await this.userRepository.save(user);
    this.logger.log(`Registered user ${saved.id}`);

    return this.issueTokens(saved);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Невірний email або пароль');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Невірний email або пароль');

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id: payload.sub })
      .getOne();

    if (!user?.refreshTokenHash) throw new UnauthorizedException('Session revoked');

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret', expiresIn: '1h' },
    );
    return { accessToken };
  }

  async logout(userId: number): Promise<void> {
    await this.userRepository.update(userId, { refreshTokenHash: null });
  }

  private async issueTokens(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      expiresIn: '30d',
    });

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, { refreshTokenHash: refreshHash });

    return {
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      accessToken,
      refreshToken,
    };
  }
}
