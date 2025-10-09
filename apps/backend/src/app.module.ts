import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  providers: [PrismaService, AppService],
  controllers: [AppController],
})
export class AppModule {}
