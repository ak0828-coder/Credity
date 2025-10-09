import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

type RlsRole = 'user' | 'service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  // Kein async-Callback -> vermeidet @typescript-eslint/no-misused-promises
  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      void app.close();
    });
  }

  /**
   * Führt DB-Operationen mit gesetztem RLS-Kontext aus.
   * Beispiel:
   *   await prisma.withRls({ userId, role: 'user' }, tx => tx.profile.findMany())
   */
  async withRls<T>(
    ctx: { userId?: string; role?: RlsRole } = {},
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const userId = ctx.userId ?? '';
    const role = ctx.role ?? 'user';
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `select set_config('app.user_id', $1, true)`,
        userId,
      );
      await tx.$executeRawUnsafe(
        `select set_config('app.role', $1, true)`,
        role,
      );
      return fn(tx);
    });
  }
}
