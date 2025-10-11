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
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { JwtAuthGuard } from './jwt.guard';

const COOKIE = process.env.COOKIE_NAME || 'credity.sid';
const SECURE = String(process.env.COOKIE_SECURE || 'true') === 'true';
// Express erwartet 'none' | 'lax' | 'strict' (klein geschrieben)
const SAMESITE = (
  (process.env.COOKIE_SAMESITE as string) || 'None'
).toLowerCase() as 'none' | 'lax' | 'strict';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private captcha: CaptchaService,
  ) {}

  private setSessionCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string; csrf: string },
  ) {
    res.cookie(COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: SECURE,
      sameSite: SAMESITE,
      path: '/auth',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    // CSRF Double-Submit: FE liest und sendet als Header 'x-csrf'
    res.cookie('csrfToken', tokens.csrf, {
      httpOnly: false,
      secure: SECURE,
      sameSite: SAMESITE,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }

  private assertCsrf(req: Request) {
    const cookie = req.cookies?.['csrfToken'];
    const header = req.headers['x-csrf'];
    if (!cookie || !header || cookie !== header) {
      throw new BadRequestException('CSRF check failed');
    }
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; captchaToken?: string },
    @Res({ passthrough: true }) res: Response,
    @Req() _req: Request,
  ) {
    await this.captcha.verifyOrThrow(body.captchaToken);
    const tokens = await this.auth.register(body.email, body.password);
    this.setSessionCookies(res, tokens);
    return { ok: true, accessToken: tokens.accessToken };
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() body: { email: string; password: string; captchaToken?: string },
    @Res({ passthrough: true }) res: Response,
    @Req() _req: Request,
  ) {
    await this.captcha.verifyOrThrow(body.captchaToken);
    const tokens = await this.auth.login(body.email, body.password);
    this.setSessionCookies(res, tokens);
    return { ok: true, accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return { sub: req.user.sub };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE, { path: '/auth' });
    res.clearCookie('csrfToken', { path: '/' });
    return { ok: true };
  }
}
