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

// --- Hilfsfunktionen: E-Mail normalisieren & Passwort-Policy ---
function normalizeEmail(e?: string): string {
  return (e ?? '').trim().toLowerCase();
}

function assertPasswordPolicy(pw?: string): void {
  const p = (pw ?? '').trim();
  if (p.length < 8) {
    throw new BadRequestException({
      code: 'weak_password',
      message: 'Passwort zu kurz (min. 8 Zeichen).',
    });
  }
  // Optional strenger (bei Bedarf einkommentieren):
  // const rx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  // if (!rx.test(p)) {
  //   throw new BadRequestException({
  //     code: 'weak_password',
  //     message: 'Bitte Buchstaben, Zahl & Sonderzeichen kombinieren.',
  //   });
  // }
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    // Normalisieren & Policy prüfen
    const normEmail = normalizeEmail(email);
    assertPasswordPolicy(password);

    // Existenz prüfen mit **normalisierter** E-Mail
    const exists = await this.prisma.profileVerified.findUnique({
      where: { email: normEmail },
    });
    if (exists) {
      throw new BadRequestException({
        code: 'email_in_use',
        message: 'E-Mail bereits registriert.',
      });
    }

    // Profil anlegen
    const profile = await this.prisma.profileVerified.create({
      data: { email: normEmail, verifiedAt: null },
    });

    // Passwort hashen & Identity anlegen
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    await this.prisma.identity.create({
      data: {
        provider: 'PASSWORD',
        subject: normEmail,
        passwordHash: hash,
        profileId: profile.id,
      },
    });

    return this.issueSession(profile.id);
  }

  async login(email: string, password: string) {
    // Normalisieren
    const normEmail = normalizeEmail(email);

    // Identity über (provider, subject) suchen – subject = **normalisierte** E-Mail
    const identity = await this.prisma.identity.findUnique({
      where: { provider_subject: { provider: 'PASSWORD', subject: normEmail } },
      include: { profile: true },
    });
    if (!identity || !identity.passwordHash) {
      throw new UnauthorizedException({
        code: 'invalid_credentials',
        message: 'Invalid credentials',
      });
    }

    // Passwort prüfen
    const ok = await argon2.verify(identity.passwordHash, password);
    if (!ok) {
      throw new UnauthorizedException({
        code: 'invalid_credentials',
        message: 'Invalid credentials',
      });
    }

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

  // ⬇️ Refresh prüfen & rotieren
  async verifyRefreshAndRotate(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET!,
      });
    } catch {
      throw new UnauthorizedException({
        code: 'invalid_refresh',
        message: 'Invalid refresh token',
      });
    }
    if (payload?.typ !== 'refresh' || !payload?.sub) {
      throw new UnauthorizedException({
        code: 'invalid_refresh_type',
        message: 'Invalid refresh token type',
      });
    }
    return this.issueSession(payload.sub);
  }
}
