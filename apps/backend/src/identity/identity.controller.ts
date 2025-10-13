import {
  Controller,
  Post,
  Get,
  HttpCode,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { DevMockGuard } from './dev-mock.guard';
import { IdentityService } from './identity.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('identity')
export class IdentityController {
  constructor(
    private readonly identity: IdentityService,
    private readonly prisma: PrismaService,
  ) {}

  // DEV/Preview: Mock-Verify => setzt verifiedAt + assuranceLevel
  // AuditLog: best-effort; Typen via "as any" umgehen, damit Build stabil bleibt
  @UseGuards(JwtAuthGuard, DevMockGuard)
  @Post('mock/verify')
  @HttpCode(200)
  async mockVerify(@Req() req: any) {
    const userId: string = req.user?.sub;
    const out = await this.identity.markVerified(userId, 'spid_l2');

    try {
      // Wenn dein AuditLog-Modell payload (JSON) hat, wird es geschrieben.
      // Falls nicht vorhanden / Client veraltet, wird das im catch abgefangen.
      const prismaAny = this.prisma as any;
      if (prismaAny?.auditLog?.create) {
        await prismaAny.auditLog.create({
          data: {
            // nur payload benutzen – keine Annahmen über andere Felder
            payload: {
              userId,
              action: 'identity_verified',
              level: out.assuranceLevel,
              verifiedAt: out.verifiedAt,
            },
          },
        });
      }
    } catch (_e) {
      // Audit darf niemals den Flow brechen – später sauber migrieren/generate neu laufen lassen
      // console.warn('Audit write failed', _e);
    }

    return out;
  }

  // DEV/Preview: Letzte 5 Audit-Events (ohne Filter, nur sortiert)
  @UseGuards(JwtAuthGuard, DevMockGuard)
  @Get('audit/recent')
  async recentAudits(@Req() _req: any) {
    try {
      const prismaAny = this.prisma as any;
      if (prismaAny?.auditLog?.findMany) {
        return prismaAny.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
        });
      }
      return []; // wenn das Model nicht existiert
    } catch {
      return []; // niemals hart fehlschlagen
    }
  }
}
