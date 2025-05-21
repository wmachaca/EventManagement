// tests/fixtures/events.ts
import { Prisma } from '@prisma/client';

const sampleEventData: Prisma.EventCreateInput[] = [
  {
    name: 'Tech Conference 2025',
    description: 'Annual technology conference',
    location: 'San Francisco',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2025-06-17'),
    capacity: 500,
    isVirtual: false,
    requiresApproval: true,
    status: 'PUBLISHED',
    creator: { connect: { id: 1 } },
  },
  {
    name: 'Virtual Meetup',
    description: 'Online developer meetup',
    isVirtual: true,
    virtualLink: 'https://meetup.example.com',
    startDate: new Date('2025-07-01'),
    capacity: 200,
    requiresApproval: false,
    status: 'PUBLISHED',
    creator: { connect: { id: 1 } },
  },
];

export default { validEvents: sampleEventData };
