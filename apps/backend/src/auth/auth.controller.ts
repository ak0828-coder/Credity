import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  HttpCode,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { JwtAuthGuard } from './jwt.guard';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

const COOKIE = process.env.COOKIE_NAME || 'credity.sid';
const SECURE = String(process.env.COOKIE_SECURE || 'true') === 'true';
// Express erwartet 'none' | 'lax' | 'strict'
const SAMESITE = (
  (process.env.COOKIE_SAMESITE as string) || 'None'
).toLowerCase() as 'none' | 'lax' | 'strict';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly captcha: CaptchaService,
  ) {}

  /** Setzt HttpOnly-Refresh-Cookie und nicht-HttpOnly CSRF-Cookie (Double-Submit). */
  private setSessionCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string; csrf: string },
  ) {
    // Refresh nur unter /auth senden (Angriffsfläche reduzieren)
    res.cookie(COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: SECURE,
      sameSite: SAMESITE,
      path: '/auth',
      // tatsächliche Gültigkeit kommt aus JWT exp; Max-Age dient nur dem Browser
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    // CSRF: nicht HttpOnly, damit FE den Header 'x-csrf' setzen kann (Double-Submit)
    res.cookie('csrfToken', tokens.csrf, {
      httpOnly: false,
      secure: SECURE,
      sameSite: SAMESITE,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }

  /** Löscht Cookies sicher (inkl. secure/sameSite), damit alle Browser sie wirklich entfernen. */
  private clearSessionCookies(res: Response) {
    // via Set-Cookie mit Vergangenheit-Expiry, um alle Varianten zuverlässig zu treffen
    res.cookie(COOKIE, '', {
      httpOnly: true,
      secure: SECURE,
      sameSite: SAMESITE,
      path: '/auth',
      expires: new Date(0),
    });
    res.cookie('csrfToken', '', {
      httpOnly: false,
      secure: SECURE,
      sameSite: SAMESITE,
      path: '/',
      expires: new Date(0),
    });
  }

  /** Double-Submit CSRF: Cookie muss exakt Header 'x-csrf' entsprechen. */
  private assertCsrf(req: Request) {
    const cookie = req.cookies?.['csrfToken'];
    const header = req.headers['x-csrf'];
    // header kann string|string[] sein
    const headerVal = Array.isArray(header) ? header[0] : header;
    if (!cookie || !headerVal || cookie !== headerVal) {
      throw new BadRequestException({
        code: 'csrf_failed',
        message: 'CSRF check failed',
      });
    }
  }

  @Post('register')
  @HttpCode(200)
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() _req: Request,
  ) {
    await this.captcha.verifyOrThrow(body.captchaToken || undefined);
    const tokens = await this.auth.register(body.email, body.password);
    this.setSessionCookies(res, tokens);
    return { ok: true, accessToken: tokens.accessToken };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() _req: Request,
  ) {
    await this.captcha.verifyOrThrow(body.captchaToken || undefined);
    const tokens = await this.auth.login(body.email, body.password);
    this.setSessionCookies(res, tokens);
    return { ok: true, accessToken: tokens.accessToken };
  }

  /** Liest HttpOnly-Refresh-Cookie, prüft/rotiert ihn, setzt neue Cookies + liefert frischen accessToken. */
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.assertCsrf(req);

    const rt = req.cookies?.[COOKIE];
    if (!rt) {
      throw new UnauthorizedException({
        code: 'no_refresh',
        message: 'Missing refresh cookie',
      });
    }

    const tokens = await this.auth.verifyRefreshAndRotate(rt);
    this.setSessionCookies(res, tokens);
    // csrf steckt bereits im Cookie; optional mit zurückgeben:
    return { ok: true, accessToken: tokens.accessToken, csrf: tokens.csrf };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(200)
  me(@Req() req: any) {
    return { ok: true, sub: req.user.sub };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearSessionCookies(res);
    return { ok: true };
  }
}
