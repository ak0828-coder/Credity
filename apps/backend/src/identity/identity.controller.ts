import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { DevMockGuard } from './dev-mock.guard';
import { IdentityService } from './identity.service';

@Controller('identity')
export class IdentityController {
  constructor(private idSvc: IdentityService) {}

  // Nur eingeloggte User + Dev-Secret + Flag → verifizieren
  @UseGuards(JwtAuthGuard, DevMockGuard)
  @Post('mock/verify')
  async verifyMock(@Req() req: Request) {
    const sub = (req as any).user?.sub as string;
    const updated = await this.idSvc.markVerified(sub, 'spid_l2');
    return {
      verified: true,
      assuranceLevel: updated.assuranceLevel,
      verifiedAt: updated.verifiedAt,
    };
  }
}
