import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.sub;

    if (!userId) {
      throw new ForbiddenException({
        code: 'unauthenticated',
        message: 'Login required',
      });
    }

    const pv = await this.prisma.profileVerified.findUnique({
      where: { id: userId },
      select: { assuranceLevel: true },
    });

    if (!pv || pv.assuranceLevel === 'none') {
      throw new ForbiddenException({
        code: 'verification_required',
        message: 'User must be verified',
      });
    }

    return true;
  }
}
