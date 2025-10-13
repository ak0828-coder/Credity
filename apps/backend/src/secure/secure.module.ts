import { Module } from '@nestjs/common';
import { SecureController } from './secure.controller';
import { PrismaService } from '../prisma/prisma.service';
import { VerifiedGuard } from '../auth/guards/verified.guard';

@Module({
  controllers: [SecureController],
  providers: [PrismaService, VerifiedGuard],
})
export class SecureModule {}
