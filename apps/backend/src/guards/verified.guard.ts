import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest() as any;
    const sub = req?.user?.sub as string | undefined;
    if (!sub) throw new ForbiddenException('Not authenticated');

    const prof = await this.prisma.profileVerified.findUnique({
      where: { id: sub },
    });
    if (!prof || prof.assuranceLevel === 'none') {
      throw new ForbiddenException('Verified identity required');
    }
    return true;
  }
}
