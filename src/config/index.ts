export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  dbURL: process.env.DB_URL || 'mongodb://localhost:27017',
});
