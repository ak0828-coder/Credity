import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { EmailsProcessor } from './emails.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL!,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
      prefix: process.env.BULLMQ_PREFIX ?? 'credity',
    }),
    BullModule.registerQueue({ name: 'emails' }),
  ],
  controllers: [AppController],
  providers: [EmailsProcessor],
})
export class AppModule {}
