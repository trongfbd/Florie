/**
 * Creates (or updates the password of) a single ADMIN user — for production,
 * where running the full seed.ts (which also creates demo products/orders)
 * would pollute real data. Idempotent via upsert on email.
 *
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... npx ts-node --transpile-only prisma/create-admin.ts
 */
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const PASSWORD_SALT_ROUNDS = 10;
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Admin';

  if (!email || !password) {
    console.error(
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variable.',
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: UserRole.ADMIN },
    create: { email, passwordHash, name, role: UserRole.ADMIN },
  });

  console.log(`ADMIN user ready: ${user.email} (${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
