import { registerAs } from '@nestjs/config';

export default registerAs('auth0', () => ({
  issuerURL: 'https://lookmenu.us.auth0.com/',
  audience: 'https://lookmenu.app',
}));
