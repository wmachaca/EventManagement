import type { EventApplication } from '@prisma/client';
import { ApplicationStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

type EventApplicationCreateData = {
  eventId: number;
  userId: number;
  status: ApplicationStatus;
  appliedAt: Date;
  message?: string;
  reviewedAt?: Date | null;
  reviewedById?: number | null;
};

export const applicationFixtures = {
  validApplication: (reviewerId?: number): EventApplicationCreateData => ({
    eventId: 0, // Override when used
    userId: 0, // Override when used
    status: ApplicationStatus.PENDING,
    appliedAt: new Date(),
    message: faker.lorem.sentence(5),
    reviewedAt: null,
    reviewedById: reviewerId ?? null,
  }),

  approvedApplication: (reviewerId: number): Partial<EventApplicationCreateData> => ({
    status: ApplicationStatus.APPROVED,
    appliedAt: faker.date.past(),
    reviewedAt: new Date(),
    reviewedById: reviewerId,
    message: faker.lorem.sentence(5),
  }),

  rejectedApplication: (reviewerId: number): Partial<EventApplicationCreateData> => ({
    status: ApplicationStatus.REJECTED,
    appliedAt: faker.date.past(),
    reviewedAt: new Date(),
    reviewedById: reviewerId,
    message: faker.lorem.sentence(5),
  }),
};

/**
 * Generates application data with explicit reviewer handling
 */
export function generateApplicationData(
  userId: number,
  eventId: number,
  options: {
    status?: ApplicationStatus;
    reviewerId?: number;
    overrides?: Partial<EventApplicationCreateData>;
  } = {},
): EventApplicationCreateData {
  const { status = ApplicationStatus.PENDING, reviewerId, overrides = {} } = options;

  if (status !== ApplicationStatus.PENDING && !reviewerId) {
    throw new Error('reviewerId is required for non-PENDING statuses');
  }

  return {
    eventId,
    userId,
    status,
    appliedAt: new Date(),
    message: faker.lorem.sentence(),
    reviewedAt: status !== ApplicationStatus.PENDING ? new Date() : null,
    reviewedById: status !== ApplicationStatus.PENDING ? reviewerId! : null,
    ...overrides,
  };
}

/**
 * Generate multiple applications with proper reviewer relationships
 */
export function generateBulkApplications(
  count: number,
  userIds: number[],
  eventIds: number[],
  reviewers: number[],
  options: {
    statusPool?: ApplicationStatus[];
    defaultStatus?: ApplicationStatus;
  } = {},
): EventApplicationCreateData[] {
  const {
    statusPool = [
      ApplicationStatus.PENDING,
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED,
    ],
    defaultStatus = ApplicationStatus.PENDING,
  } = options;

  return Array.from({ length: count }, () => {
    const userId = faker.helpers.arrayElement(userIds);
    const eventId = faker.helpers.arrayElement(eventIds);
    const status = faker.helpers.arrayElement(statusPool);
    const reviewerId =
      status !== ApplicationStatus.PENDING ? faker.helpers.arrayElement(reviewers) : undefined;

    return generateApplicationData(userId, eventId, {
      status,
      reviewerId,
      overrides: {
        message: faker.lorem.sentence(),
      },
    });
  });
}
