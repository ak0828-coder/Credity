import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class DevMockGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Block in Production
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Mock IdP disabled in production');
    }
    if (process.env.ENABLE_MOCK_IDP !== 'true') {
      throw new ForbiddenException('Mock IdP not enabled');
    }
    const req = context.switchToHttp().getRequest();
    const hdr = req.headers['x-dev-auth'];
    if (!hdr || hdr !== process.env.DEV_IDP_SECRET) {
      throw new UnauthorizedException('Invalid dev secret');
    }
    return true;
  }
}
