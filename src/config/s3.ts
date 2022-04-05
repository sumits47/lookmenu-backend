import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  endpoint: process.env.S3_ENDPOINT || 'https://sgp1.digitaloceanspaces.com',
  region: process.env.S3_REGION || 'sgp1',
  key: process.env.S3_KEY,
  secret: process.env.S3_SECRET,
}));
