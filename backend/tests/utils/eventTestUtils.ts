import { prisma } from '../setup';
import { generateEventData } from '../fixtures/events';
import { User } from '@prisma/client';

export async function createTestEvent(userId: number, overrides?: any) {
  return prisma.event.create({
    data: generateEventData(userId, overrides),
  });
}

export async function createTestUserAndEvent() {
  const user = await prisma.user.create({
    data: {
      name: 'Event Creator',
      email: 'creator@example.com',
      provider: 'credentials',
      auth: {
        create: {
          password: 'hashedpassword',
          salt: 'somesalt',
        },
      },
    },
  });

  const event = await createTestEvent(user.id);

  return { user, event };
}
