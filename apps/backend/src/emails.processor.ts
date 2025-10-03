import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

@Processor('emails')
export class EmailsProcessor extends WorkerHost {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  process(job: Job) {
    // (sp�ter echte Arbeit; aktuell nur "Stub")
    return Promise.resolve({ ok: true });
  }

  @OnWorkerEvent('completed')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCompleted(job: Job) {
    // optionales Logging
  }
}
