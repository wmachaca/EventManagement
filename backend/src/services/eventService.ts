import type { ApplicationStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import type { CreateEventInput, UpdateEventInput, ApplicationDetails } from '../models/event';

const prisma = new PrismaClient();

export const createEvent = async (input: CreateEventInput) => {
  // Validate required creatorId
  if (!input.creatorId) {
    throw new Error('Creator ID is required');
  }

  return prisma.event.create({
    data: {
      name: input.name,
      description: input.description,
      location: input.location,
      startDate: new Date(input.startDate), // 🔁 updated from schedule
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      capacity: input.capacity,
      isVirtual: input.isVirtual,
      virtualLink: input.virtualLink,
      imageUrl: input.imageUrl,
      status: input.status || 'DRAFT', // Default to DRAFT if not provided
      creator: {
        connect: { id: input.creatorId }, // Properly connect the creator
      },
    },
    include: {
      creator: true, // Include creator in the response
    },
  });
};

export const updateEvent = async (id: number, input: UpdateEventInput) => {
  return prisma.event.update({
    where: { id },
    data: input,
  });
};

export const getEventById = async (id: number, includeDeleted = false) => {
  return prisma.event.findUnique({
    where: {
      id,
      isDeleted: includeDeleted ? undefined : false,
    },
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
  includeDeleted?: boolean; // New option
}) => {
  return prisma.event.findMany({
    where: {
      ...filter,
      isDeleted: filter.includeDeleted ? undefined : false, // Exclude deleted unless requested
    },
    include: {
      creator: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const deleteEvent = async (eventId: number, creatorId: number) => {
  // Verify the event exists and belongs to the creator
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent || existingEvent.creatorId !== creatorId) {
    throw new Error('Event not found or unauthorized');
  }

  // Perform soft delete
  return prisma.event.update({
    where: { id: eventId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: 'CANCELED', // Optionally cancel the event when deleting
    },
  });
};

export const restoreEvent = async (eventId: number, creatorId: number) => {
  // Verify the event exists and belongs to the creator
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent || existingEvent.creatorId !== creatorId) {
    throw new Error('Event not found or unauthorized');
  }

  // Restore the soft-deleted event
  return prisma.event.update({
    where: { id: eventId },
    data: {
      isDeleted: false,
      deletedAt: null,
      status: 'DRAFT', // Or whatever status makes sense for your app
    },
  });
};

export const applyToEvent = async (eventId: number, userId: number) => {
  return await prisma.$transaction(async tx => {
    // 1. Fetch event (include requiresApproval)
    const event = await tx.event.findUnique({
      where: { id: eventId, isDeleted: false },
      select: {
        id: true,
        status: true,
        capacity: true,
        requiresApproval: true,
        applications: {
          where: { userId },
          select: { status: true },
        },
        _count: {
          select: { attendees: true },
        },
      },
    });

    if (!event) throw new Error('Event not found or has been deleted');
    if (event.status !== 'PUBLISHED') throw new Error('Event is not open for registration');
    if (event.applications.length > 0) {
      throw new Error(
        `You already have a ${event.applications[0].status.toLowerCase()} application`,
      );
    }
    if (event._count.attendees >= event.capacity) throw new Error('Event is full');

    // 2. Create application (PENDING if requires approval, else APPROVED)
    return tx.eventApplication.create({
      data: {
        eventId,
        userId,
        status: event.requiresApproval ? 'PENDING' : 'APPROVED', // 👈 Dynamic status
      },
      include: {
        event: { select: { name: true, startDate: true } },
        user: { select: { name: true, email: true } },
      },
    });
  });
};

export const cancelRegistration = async (eventId: number, userId: number) => {
  return await prisma.$transaction(async tx => {
    // 1. Verify event exists
    const event = await tx.event.findUnique({
      where: { id: eventId, isDeleted: false },
    });

    if (!event) {
      throw new Error('Event not found or has been deleted');
    }

    // 2. Check if cancellation is allowed (based on event start date)
    const now = new Date();
    if (event.startDate <= now) {
      throw new Error('Cannot cancel registration after event has started');
    }

    // 3. Delete application and remove from attendees if approved
    const [application] = await Promise.all([
      tx.eventApplication.deleteMany({
        where: {
          eventId,
          userId,
          status: { in: ['PENDING', 'APPROVED'] },
        },
      }),
      tx.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            disconnect: { id: userId },
          },
        },
      }),
    ]);

    if (application.count === 0) {
      throw new Error('No active registration found to cancel');
    }

    return true;
  });
};

export const checkUserRegistration = async (
  eventId: number,
  userId: number,
): Promise<ApplicationDetails> => {
  const [event, application] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId, isDeleted: false },
      select: {
        id: true,
        name: true,
        startDate: true,
        capacity: true,
        _count: {
          select: { attendees: true },
        },
      },
    }),
    prisma.eventApplication.findFirst({
      where: { eventId, userId },
    }),
  ]);

  if (!event) {
    throw new Error('Event not found');
  }

  return {
    isRegistered:
      !!application ||
      (await prisma.event.count({
        where: {
          id: eventId,
          attendees: { some: { id: userId } },
        },
      })) > 0,
    applicationStatus: application?.status || null,
    eventDetails: {
      id: event.id,
      name: event.name,
      startDate: event.startDate,
      capacity: event.capacity,
      currentAttendees: event._count.attendees,
    },
  };
};

export const updateApplicationStatus = async (applicationId: number, status: ApplicationStatus) => {
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

export const getDeletedEventsByUserId = async (userId: number) => {
  return prisma.event.findMany({
    where: {
      creatorId: userId,
      deletedAt: {
        not: null,
      },
    },
    orderBy: {
      deletedAt: 'desc',
    },
  });
};
