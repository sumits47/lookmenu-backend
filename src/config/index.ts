import auth0 from './auth0';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  dbURL: process.env.DB_URL || 'mongodb://localhost:27017',
  auth0,
});
