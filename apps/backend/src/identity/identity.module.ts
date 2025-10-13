import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { PrismaService } from '../prisma/prisma.service';
import { DevMockGuard } from './dev-mock.guard';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, PrismaService, DevMockGuard],
})
export class IdentityModule {}
