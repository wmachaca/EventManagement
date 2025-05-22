import { ApplicationStatus, EventApplication } from '@prisma/client';
import { faker } from '@faker-js/faker';

type PartialEventApp = Partial<Omit<EventApplication, 'id'>>;

export const applicationFixtures = {
  validApplication: (reviewerId?: number): PartialEventApp => ({
    status: ApplicationStatus.PENDING,
    appliedAt: new Date(),
    message: faker.lorem.sentence(5),
    ...(reviewerId && { reviewedById: reviewerId })
  }),

  approvedApplication: (reviewerId: number): PartialEventApp => ({
    status: ApplicationStatus.APPROVED,
    appliedAt: faker.date.past(),
    reviewedAt: new Date(),
    reviewedById: reviewerId,
    message: faker.lorem.sentence(5)
  }),

  rejectedApplication: (reviewerId: number): PartialEventApp => ({
    status: ApplicationStatus.REJECTED,
    appliedAt: faker.date.past(),
    reviewedAt: new Date(),
    reviewedById: reviewerId,
    message: faker.lorem.sentence(5)
  })
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
    overrides?: Partial<PartialEventApp>;
  } = {}
): PartialEventApp {
  const { status = ApplicationStatus.PENDING, reviewerId, overrides = {} } = options;
  
  const base: PartialEventApp = {
    eventId,
    userId,
    status,
    appliedAt: new Date(),
    message: faker.lorem.sentence(),
    ...overrides
  };

  if (status !== ApplicationStatus.PENDING) {
    if (!reviewerId) {
      throw new Error('reviewerId is required for non-PENDING statuses');
    }
    base.reviewedAt = new Date();
    base.reviewedById = reviewerId;
  }

  return base;
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
  } = {}
): PartialEventApp[] {
  const {
    statusPool = [ApplicationStatus.PENDING, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
    defaultStatus = ApplicationStatus.PENDING
  } = options;

  return Array.from({ length: count }, () => {
    const userId = faker.helpers.arrayElement(userIds);
    const eventId = faker.helpers.arrayElement(eventIds);
    const status = faker.helpers.arrayElement(statusPool);
    const reviewerId = status !== ApplicationStatus.PENDING 
      ? faker.helpers.arrayElement(reviewers) 
      : undefined;

    return generateApplicationData(userId, eventId, {
      status,
      reviewerId,
      overrides: {
        message: faker.lorem.sentence()
      }
    });
  });
}