import { ApplicationStatus } from '@prisma/client';

const validApplications = [
  {
    eventId: 1, // must match the ID of a seeded event
    userId: 1,  // must match the ID of a seeded user
    status: ApplicationStatus.PENDING,
    // appliedAt: new Date(), // optional, will default to now()
    // reviewedAt: null,      // optional
    // reviewedById: null     // optional
  },
  {
    eventId: 1,
    userId: 1,
    status: ApplicationStatus.APPROVED,
    reviewedAt: new Date(),
    reviewedById: 1,
  },
  // Add more if needed for edge cases
];

export default { validApplications };
