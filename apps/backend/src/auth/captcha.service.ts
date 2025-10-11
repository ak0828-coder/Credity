import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CaptchaService {
  async verifyOrThrow(token?: string) {
    const siteTurnstile = process.env.TURNSTILE_SITE_KEY;
    const secretTurnstile = process.env.TURNSTILE_SECRET_KEY;

    // solange Keys fehlen, nichts blockieren (Dev)
    if (!siteTurnstile || !secretTurnstile) return;

    if (!token) throw new BadRequestException('Missing captcha token');

    const form = new URLSearchParams();
    form.set('secret', secretTurnstile);
    form.set('response', token);

    const resp = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: form,
      },
    );
    const data = await resp.json();
    if (!data.success) throw new BadRequestException('Captcha failed');
  }
}
