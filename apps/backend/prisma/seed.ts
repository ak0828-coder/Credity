/* apps/backend/prisma/seed.ts */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Alle Inserts unter service-Rolle (um RLS zu passieren)
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `select set_config('app.role', 'service', true)`,
    );

    // Minimal-Profile
    const ana = await tx.profile.upsert({
      where: { userId: 'user_ana' },
      update: {},
      create: {
        userId: 'user_ana',
        email: 'ana@example.com',
        givenName: 'Ana',
        familyName: 'Example',
      },
    });

    const bob = await tx.profile.upsert({
      where: { userId: 'user_bob' },
      update: {},
      create: {
        userId: 'user_bob',
        email: 'bob@example.com',
        givenName: 'Bob',
        familyName: 'Example',
      },
    });

    // Ein Report für Ana
    await tx.report.create({
      data: {
        userId: ana.userId,
        score: 720,
        meta: { source: 'seed' },
      },
    });

    // Ein Consent für Ana
    await tx.consent.upsert({
      where: {
        userId_type_version: {
          userId: ana.userId,
          type: 'TERMS',
          version: 'v1',
        },
      },
      update: { status: true },
      create: {
        userId: ana.userId,
        type: 'TERMS',
        version: 'v1',
        status: true,
      },
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Seed done');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
