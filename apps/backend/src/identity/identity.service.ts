import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class IdentityService {
  constructor(private prisma: PrismaService) {}

  async markVerified(
    profileId: string,
    level: 'spid_l2' | 'spid_l3' | 'cie' = 'spid_l2',
  ) {
    // Upsert eine "SPID"-Identität mit stabilem subject
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

    // Audit
    if ((this.prisma as any).auditLog) {
      await this.prisma.auditLog.create({
        data: {
          profileId,
          type: 'identity_verified',
          source: 'mock',
          payload: { provider: 'SPID', level },
        },
      });
    }

    return updated;
  }
}
