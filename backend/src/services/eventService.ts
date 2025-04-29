import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { CreateEventInput, UpdateEventInput } from '../models/event';

const prisma = new PrismaClient();

export const createEvent = async (input: CreateEventInput) => {
  return prisma.event.create({
    data: {
      ...input,
      status: 'DRAFT', // Default status
    },
  });
};

export const updateEvent = async (id: number, input: UpdateEventInput) => {
  return prisma.event.update({
    where: { id },
    data: input,
  });
};

export const getEventById = async (id: number) => {
  return prisma.event.findUnique({
    where: { id },
    include: {
      creator: true,
      applications: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const listEvents = async (filter: {
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELED';
  creatorId?: number;
}) => {
  return prisma.event.findMany({
    where: filter,
    include: {
      creator: true,
    },
  });
};

export const deleteEvent = async (id: number) => {
  return prisma.event.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

export const applyToEvent = async (eventId: number, userId: number) => {
  return prisma.eventApplication.create({
    data: {
      eventId,
      userId,
      status: ApplicationStatus.PENDING,
    },
  });
};

export const updateApplicationStatus = async (
  applicationId: number,
  status: ApplicationStatus
) => {
  return prisma.eventApplication.update({
    where: { id: applicationId },
    data: { status },
  });
};

export const getEventApplications = async (eventId: number) => {
  return prisma.eventApplication.findMany({
    where: { eventId },
    include: {
      user: true,
    },
  });
};