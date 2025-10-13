import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * No-op RLS Helper:
   * Erlaubt Aufrufe wie prisma.withRls({ userId, role }, tx => ...)
   * ohne Buildfehler. Wenn du später echte RLS-Kontext-Variablen brauchst,
   * setze sie hier (z. B. per this.$executeRaw auf pg Vars).
   */
  async withRls<T>(
    ctx: any,
    cb: (tx: PrismaClient) => Promise<T> | T,
  ): Promise<T> {
    // ctx wird aktuell ignoriert (no-op)
    return await Promise.resolve(cb(this));
  }
}
