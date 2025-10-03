import { Controller, Get } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller()
export class AppController {
  constructor(@InjectQueue('emails') private readonly emails: Queue) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/enqueue-test')
  async enqueue() {
    await this.emails.add(
      'sendWelcome',
      { userId: '123' },
      { attempts: 3, removeOnComplete: true },
    );
    return { queued: true };
  }
}
