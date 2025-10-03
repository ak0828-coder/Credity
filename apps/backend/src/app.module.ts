import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import type { RedisOptions } from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailsProcessor } from './emails.processor';

const hasRedis = !!process.env.REDIS_URL;

function parseRedis(urlStr: string): RedisOptions {
  const u = new URL(urlStr);
  const opts: RedisOptions = {
    host: u.hostname,
    port: Number(u.port || '6379'),
    username: u.username || undefined,
    password: u.password || undefined,
  };
  if (u.protocol === 'rediss:') {
    // TLS f�r Upstash/Managed-Redis
    (opts as any).tls = {};
  }
  return opts;
}

const bullImports = hasRedis
  ? [
      BullModule.forRoot({
        connection: parseRedis(process.env.REDIS_URL as string),
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
