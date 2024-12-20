import { config } from '@libraries/helpers/config.helper';

export const jwt = {
  secret: config.get('JWT_SECRET'),
  signOptions: { expiresIn: config.get('JWT_TTL') },
};
