import { Controller, Post, UseGuards, HttpCode, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { VerifiedGuard } from '../auth/guards/verified.guard';

@Controller('secure')
export class SecureController {
  @Post('consents-test')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, VerifiedGuard)
  createConsent(@Req() req: any) {
    return { ok: true, by: req.user.sub, note: 'consent created (demo)' };
  }
}
