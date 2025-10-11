import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdentityService {
  constructor(private prisma: PrismaService) {}

  async markVerified(
    profileId: string,
    level: 'spid_l2' | 'spid_l3' | 'cie' = 'spid_l2',
  ) {
    // Upsert einer SPID-Identität mit stabilem subject (MOCK)
    await this.prisma.identity.upsert({
      where: {
        provider_subject: { provider: 'SPID', subject: `MOCK-${profileId}` },
      },
      update: {},
      create: {
        provider: 'SPID',
        subject: `MOCK-${profileId}`,
        profileId,
      },
    });

    const updated = await this.prisma.profileVerified.update({
      where: { id: profileId },
      data: { verifiedAt: new Date(), assuranceLevel: level as any },
    });

    // Optionales Audit (schema-agnostisch; keine Annahme über Felder wie "profileId")
    try {
      const audit = (this.prisma as any).auditLog;
      if (audit?.create) {
        await audit.create({
          data: {
            type: 'identity_verified',
            source: 'mock',
            payload: { provider: 'SPID', level, profileId }, // profileId in payload statt als Top-Level Feld
          } as any,
        });
      }
    } catch {
      // In Dev ignorieren wir Audit-Fehler (unterschiedliche Schemas etc.)
    }

    return updated;
  }
}
