import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, getAuthToken, createTestUser } from '../../setup';
import { getSampleEventData, invalidEventData } from '../../fixtures/events';
import { User } from '@prisma/client';

function toISO(value: string | Date | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

describe('Event Creation API', () => {
  let authToken: string;
  let testUser: User;

  const postEvent = (data: any, token = authToken) =>
    request(app).post('/api/events').set('Authorization', `Bearer ${token}`).send(data);

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await createTestUser();
    authToken = await getAuthToken();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('should create a new event with valid data', async () => {
    const eventData = getSampleEventData(testUser.id)[0];

    const response = await postEvent({
      ...eventData,
      startDate: toISO(eventData.startDate),
      endDate: toISO(eventData.endDate),
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: eventData.name,
      description: eventData.description,
      creatorId: testUser.id,
    });

    const eventInDb = await prisma.event.findUnique({
      where: { id: response.body.id },
    });

    expect(eventInDb).not.toBeNull();
  });

  it('should create a virtual event with virtualLink', async () => {
    const eventData = getSampleEventData(testUser.id)[1];

    const response = await postEvent({
      ...eventData,
      startDate: toISO(eventData.startDate),
    });

    expect(response.status).toBe(201);
    expect(response.body.isVirtual).toBe(true);
    expect(response.body.virtualLink).toBe(eventData.virtualLink);
  });

  it('should fail with 400 for empty name', async () => {
    const response = await postEvent({
      ...invalidEventData.emptyName,
      startDate: invalidEventData.emptyName.startDate.toISOString(),
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Validation failed');
  });

  it('should fail with 400 for negative capacity', async () => {
    const response = await postEvent({
      ...invalidEventData.negativeCapacity,
      startDate: invalidEventData.negativeCapacity.startDate.toISOString(),
    });

    expect(response.status).toBe(400);
  });

  it('should fail with 400 when required fields are missing', async () => {
    const response = await postEvent({ description: 'Missing name and startDate' });
    expect(response.status).toBe(400);
  });

  it('should fail with 401 when not authenticated', async () => {
    const eventData = getSampleEventData(testUser.id)[0];

    const response = await request(app)
      .post('/api/events')
      .send({
        ...eventData,
        startDate: toISO(eventData.startDate),
      });

    expect(response.status).toBe(401);
  });
});
