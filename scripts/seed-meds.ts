import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findFirst({
    where: { clerkId: 'user_3ANnvdCBwyq73cda2TgBqj5oKMu' },
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const m1 = await prisma.medication.create({
    data: {
      userId: user.id,
      name: 'Alvedon',
      dosage: '500 mg',
      instructions: 'Ta vid behov eller enligt ordination.',
      times: ['08:00', '20:00'],
      isActive: true,
    },
  });

  const m2 = await prisma.medication.create({
    data: {
      userId: user.id,
      name: 'Blodtrycksmedicin',
      dosage: '1 tablett',
      instructions: 'Tas på morgonen.',
      times: ['08:00'],
      isActive: true,
    },
  });

  console.log('Created:', m1.name, m2.name);
}

main().finally(() => prisma.$disconnect());
