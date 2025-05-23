import { prisma } from '../setup';
import { generateApplicationData } from '../fixtures/applications';
import type { ApplicationStatus } from '@prisma/client';

export async function createTestApplication(
  userId: number,
  eventId: number,
  options: {
    status?: ApplicationStatus;
    reviewerId?: number;
  } = {},
) {
  const data = generateApplicationData(userId, eventId, {
    status: options.status,
    reviewerId: options.reviewerId,
  });

  return prisma.eventApplication.create({
    data: {
      eventId: data.eventId,
      userId: data.userId,
      status: data.status,
      appliedAt: data.appliedAt,
      reviewedAt: data.reviewedAt,
      reviewedById: data.reviewedById,
    },
  });
}
