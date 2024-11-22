import { config } from '@libraries/helpers/config.helper';
import { HandlebarsAdapter } from '@nest-modules/mailer';

export const mail = {
  transport: {
    host: config.get('SMTP_HOST'),
    port: config.get('SMTP_PORT'),
    secure: false,
    auth: {
      user: config.get('MAIL_USERNAME'),
      pass: config.get('MAIL_PASSWORD'),
    },
  },
  defaults: {
    from: config.get('MAIL_FROM'),
  },
  template: {
    dir: config.getRootPath() + '/templates/mails',
    adapter: new HandlebarsAdapter(),
    options: {
      strict: false,
    },
  },
};
