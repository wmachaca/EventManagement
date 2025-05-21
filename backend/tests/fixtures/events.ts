import type { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

// Generate future dates
const futureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export function getSampleEventData(creatorId: number): Prisma.EventCreateInput[] {
  return [
    {
      name: 'Tech Conference 2025',
      description: 'Annual technology conference',
      location: 'San Francisco',
      startDate: futureDate(30),
      endDate: futureDate(32),
      capacity: 500,
      isVirtual: false,
      requiresApproval: true,
      status: 'PUBLISHED',
      creator: { connect: { id: creatorId } },
    },
    {
      name: 'Virtual Meetup',
      description: 'Online developer meetup',
      isVirtual: true,
      virtualLink: 'https://meetup.example.com',
      startDate: futureDate(15),
      capacity: 200,
      requiresApproval: false,
      status: 'PUBLISHED',
      creator: { connect: { id: creatorId } },
    },
    {
      name: 'Draft Workshop',
      description: 'Not yet published workshop',
      startDate: futureDate(60),
      capacity: 50,
      status: 'DRAFT',
      creator: { connect: { id: creatorId } },
    },
  ];
}

export const invalidEventData = {
  emptyName: {
    name: '',
    description: 'Invalid empty name',
    startDate: futureDate(10),
    capacity: 10,
  },
  pastDate: {
    name: 'Past Event',
    description: 'Event in the past',
    startDate: new Date('2020-01-01'),
    capacity: 10,
  },
  negativeCapacity: {
    name: 'Negative Capacity',
    description: 'Invalid capacity',
    startDate: futureDate(10),
    capacity: -10,
  },
};

export const updateEventData = {
  validUpdate: {
    name: 'Updated Event Name',
    description: 'Updated description',
    capacity: 100,
  },
  invalidUpdate: {
    name: '',
    capacity: -10,
  },
};

export function generateEventData(
  creatorId: number,
  overrides?: Partial<Prisma.EventCreateInput>,
): Prisma.EventCreateInput {
  return {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    startDate: futureDate(7),
    capacity: faker.number.int({ min: 10, max: 1000 }),
    isVirtual: false,
    requiresApproval: false,
    status: 'PUBLISHED',
    creator: { connect: { id: creatorId } },
    ...overrides,
  };
}
