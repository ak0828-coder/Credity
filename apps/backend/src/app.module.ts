import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailsProcessor } from './emails.processor';

const hasRedis = !!process.env.REDIS_URL;

const bullImports = hasRedis
  ? [
      BullModule.forRoot({
        // String-URL wie "rediss://default:PASS@HOST:PORT"
        connection: process.env.REDIS_URL as unknown as string,
      }),
      BullModule.registerQueue({ name: 'emails' }),
    ]
  : [];

const bullProviders = hasRedis ? [EmailsProcessor] : [];

@Module({
  imports: [...bullImports],
  controllers: [AppController],
  providers: [AppService, ...bullProviders],
})
export class AppModule {}
