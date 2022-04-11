export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  dbURL: process.env.DB_URL || 'mongodb://localhost:27017',
  demoPlaceId: process.env.DEMO_PLACE_ID || '6250f6bc84f3ac5974fb1cb8',
});
