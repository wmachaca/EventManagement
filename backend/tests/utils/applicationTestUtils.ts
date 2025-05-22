import { prisma } from '../setup';
import { generateApplicationData } from '../fixtures/applications';

export async function createTestApplication(
  userId: number,
  eventId: number,
  options: {
    status?: ApplicationStatus;
    reviewerId?: number;
  } = {},
) {
  return prisma.eventApplication.create({
    data: generateApplicationData(userId, eventId, {
      status: options.status,
      reviewerId: options.reviewerId,
    }),
  });
}

export async function createTestEventWithApplications() {
  // Create organizer who will review applications
  const organizer = await prisma.user.create({
    data: {
      name: 'Event Organizer',
      email: 'organizer@example.com',
      provider: 'credentials',
      auth: {
        create: {
          password: 'hashedpassword',
          salt: 'somesalt',
        },
      },
    },
  });

  // Create attendees
  const [attendee1, attendee2, attendee3] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Attendee 1',
        email: 'attendee1@example.com',
        provider: 'credentials',
        auth: {
          create: {
            password: 'hashedpassword',
            salt: 'somesalt',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: 'Attendee 2',
        email: 'attendee2@example.com',
        provider: 'credentials',
        auth: {
          create: {
            password: 'hashedpassword',
            salt: 'somesalt',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: 'Attendee 3',
        email: 'attendee3@example.com',
        provider: 'credentials',
        auth: {
          create: {
            password: 'hashedpassword',
            salt: 'somesalt',
          },
        },
      },
    }),
  ]);

  // Create test event
  const event = await prisma.event.create({
    data: {
      name: 'Test Event with Applications',
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      capacity: 3,
      requiresApproval: true,
      creatorId: organizer.id,
      status: 'PUBLISHED',
    },
  });

  // Create test applications with proper reviewer relationships
  const [pendingApp, approvedApp, rejectedApp] = await Promise.all([
    createTestApplication(attendee1.id, event.id, {
      status: 'PENDING',
    }),
    createTestApplication(attendee2.id, event.id, {
      status: 'APPROVED',
      reviewerId: organizer.id,
    }),
    createTestApplication(attendee3.id, event.id, {
      status: 'REJECTED',
      reviewerId: organizer.id,
    }),
  ]);

  return {
    organizer,
    attendees: [attendee1, attendee2, attendee3],
    event,
    applications: [pendingApp, approvedApp, rejectedApp],
  };
}
