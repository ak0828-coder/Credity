import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

@Processor('emails')
export class EmailsProcessor extends WorkerHost {
  // nicht async -> sonst eslint "require-await"
  process(job: Job) {
    return Promise.resolve({ ok: true });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    // optionales Logging
    // console.log("Job completed", job.id);
  }
}
