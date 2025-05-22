let organizerToken: string;
let attendeeToken: string;
let nonAttendeeToken: string;
let testData: any;

async function login(email: string, password = 'password') {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.data?.token;
}

async function createUnregisteredUser() {
  const user = await prisma.user.create({
    data: {
      name: 'Unregistered User',
      email: 'unregistered@example.com',
      provider: 'credentials',
      auth: { create: { password: 'hashedpassword', salt: 'somesalt' } }
    }
  });
  const token = await login(user.email);
  return token;
}

beforeAll(async () => {
  await cleanDatabase();
  testData = await createTestEventWithApplications();

  [organizerToken, attendeeToken, nonAttendeeToken] = await Promise.all([
    login('organizer@example.com'),
    login('attendee1@example.com'),
    login('attendee2@example.com'),
  ]);
});

afterAll(cleanDatabase);

describe('GET /api/events/:eventId/registration', () => {
  it('returns correct registration info for pending applicants', async () => {
    await request(app)
      .get(`/api/events/${testData.event.id}/registration`)
      .set('Authorization', `Bearer ${attendeeToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual({ isRegistered: true, status: 'PENDING' });
      });
  });

  it('returns correct info for approved applicants', async () => {
    await request(app)
      .get(`/api/events/${testData.event.id}/registration`)
      .set('Authorization', `Bearer ${nonAttendeeToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual({ isRegistered: true, status: 'APPROVED' });
      });
  });

  it('returns not registered for new user', async () => {
    const newToken = await createUnregisteredUser();
    await request(app)
      .get(`/api/events/${testData.event.id}/registration`)
      .set('Authorization', `Bearer ${newToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual({ isRegistered: false, status: null });
      });
  });

  it('returns 404 for non-existent event', async () => {
    await request(app)
      .get(`/api/events/99999/registration`)
      .set('Authorization', `Bearer ${attendeeToken}`)
      .expect(404);
  });

  it('returns 401 if not authenticated', async () => {
    await request(app)
      .get(`/api/events/${testData.event.id}/registration`)
      .expect(401);
  });
});
