import { EventStatus } from '@prisma/client';

const validEvents = [
  {
    name: 'Test Event',
    startDate: new Date(),
    capacity: 100,
    creatorId: 1,
    status: EventStatus.PUBLISHED, // 👈 use enum here
    requiresApproval: true,
  },
  // more events...
];

export default { validEvents };
