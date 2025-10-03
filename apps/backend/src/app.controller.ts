import { Controller, Get, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

@Controller()
export class AppController {
  constructor(
    @Optional() @InjectQueue('emails') private readonly emailsQueue?: Queue,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/enqueue-test')
  async enqueueTest() {
    // Wenn keine Queue registriert ist (kein REDIS_URL), nicht h�ngen � sauber antworten.
    if (!this.emailsQueue) {
      return {
        ok: false,
        message: 'Queue ist deaktiviert (kein REDIS_URL gesetzt)',
      };
    }
    try {
      await this.emailsQueue.add(
        'test',
        { ts: Date.now() },
        { removeOnComplete: true },
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }
}
