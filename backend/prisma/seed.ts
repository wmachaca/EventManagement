import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const password1 = bcrypt.hashSync('test1passwrd', 10);
  const password2 = bcrypt.hashSync('test2passwrd', 10);

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: 'test1',
      email: 'test1@example.com',
      provider: 'credentials',
      auth: {
        create: {
          password: password1,
          salt: bcrypt.genSaltSync(10),
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'test2',
      email: 'test2@example.com',
      provider: 'credentials',
      auth: {
        create: {
          password: password2,
          salt: bcrypt.genSaltSync(10),
        },
      },
    },
  });

  // Create events for user1
  await prisma.event.createMany({
    data: [
      {
        name: 'SCOPE Nuclear Conference 2025',
        description: 'The second SAUDI international conference on nuclear power engineering',
        location: 'Dhahran, Saudi Arabia',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-03'),
        capacity: 500,
        isVirtual: false,
        creatorId: user1.id
      },
      {
        name: 'AATN Virtual Conference',
        description: 'Online nuclear conference',
        virtualLink: 'https://meetup.example.com',
        startDate: new Date('2025-12-15'),
        capacity: 200,
        isVirtual: true,
        creatorId: user1.id
      },
    ],
  });

  // Create events for user2
  await prisma.event.createMany({
    data: [
      {
        name: 'AI Workshop',
        description: 'Hands-on workshop on AI',
        location: 'New York',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-02'),
        capacity: 100,
        isVirtual: false,
        creatorId: user2.id
      },
      {
        name: 'Cloud Computing Webinar',
        description: 'Learn about cloud computing',
        virtualLink: 'https://webinar.example.com',
        startDate: new Date('2026-01-20'),
        capacity: 300,
        isVirtual: true,
        creatorId: user2.id
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
