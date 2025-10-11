import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

function randomToken(len = 32) {
  return randomBytes(len).toString('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.prisma.profileVerified.findUnique({
      where: { email },
    });
    if (exists) throw new BadRequestException('Email already in use');

    const profile = await this.prisma.profileVerified.create({
      data: { email, verifiedAt: null },
    });

    const hash = await argon2.hash(password, { type: argon2.argon2id });
    await this.prisma.identity.create({
      data: {
        provider: 'PASSWORD',
        subject: email,
        passwordHash: hash,
        profileId: profile.id,
      },
    });

    return this.issueSession(profile.id);
  }

  async login(email: string, password: string) {
    const identity = await this.prisma.identity.findUnique({
      where: { provider_subject: { provider: 'PASSWORD', subject: email } },
      include: { profile: true },
    });
    if (!identity || !identity.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await argon2.verify(identity.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueSession(identity.profileId);
  }

  private async issueSession(profileId: string) {
    const accessToken = await this.jwt.signAsync({
      sub: profileId,
      typ: 'access' as const,
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: profileId, typ: 'refresh' as const },
      { expiresIn: process.env.REFRESH_EXPIRES_IN || '30d' },
    );
    const csrf = randomToken(32);
    return { accessToken, refreshToken, csrf };
  }
}
