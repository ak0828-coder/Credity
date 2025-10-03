import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { EmailsProcessor } from './emails.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL!, // Upstash rediss://...
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
      prefix: process.env.BULLMQ_PREFIX ?? 'credity',
    }),
    BullModule.registerQueue({ name: 'emails' }),
  ],
  controllers: [AppController], // <— Controller registrieren
  providers: [EmailsProcessor], // <— Worker registrieren
})
export class AppModule {}
