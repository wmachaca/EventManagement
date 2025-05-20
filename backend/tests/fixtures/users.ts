export default {
  validUsers: [
    {
      name: 'Test User',
      email: 'test@example.com',
      provider: 'local',
      auth: {
        password: 'hashed_testpassword', // make sure this is hashed
        salt: 'somesalt',
      },
    },
  ],
};
