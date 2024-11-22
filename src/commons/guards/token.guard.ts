import { TokenException } from '@commons/exceptions/token.exception';
import {
  CanActivate,
  ExecutionContext,
  Logger,
  mixin,
  Optional,
} from '@nestjs/common';
import { AuthModuleOptions, Type } from '@nestjs/passport';
import * as passport from 'passport';

const defaultOptions = {
  session: false,
  property: 'user',
};

function memoize(fn: any) {
  const cache = {};
  return (...args) => {
    const n = args[0] || 'default';
    if (n in cache) {
      return cache[n];
    } else {
      const result = fn(n === 'default' ? undefined : n);
      cache[n] = result;
      return result;
    }
  };
}

const createPassportContext =
  (request, response) => (type, options, callback: any) =>
    new Promise<void>((resolve, reject) =>
      passport.authenticate(type, options, (err, user, info, status) => {
        try {
          request.authInfo = info;
          return resolve(callback(err, user, info, status));
        } catch (err) {
          reject(err);
        }
      })(request, response, (err) => (err ? reject(err) : resolve())),
    );

export type IAuthGuard = CanActivate & {
  logIn<TRequest extends { logIn: any } = any>(
    request: TRequest,
  ): Promise<void>;
  handleRequest<TUser = any>(err, user, info, context, status?): TUser;
};

class BaseAuthGuard {
  protected type: string | string[] = 'jwt';

  constructor(@Optional() protected readonly options?: AuthModuleOptions) {
    this.options = this.options || {};
    if (!this.type && !this.options.defaultStrategy) {
      new Logger('AuthGuard').error(
        `In order to use "defaultStrategy", please, ensure to import PassportModule in each place where AuthGuard() is being used. Otherwise, passport won't work correctly.`,
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = { ...defaultOptions, ...this.options };
    const [request, response] = [
      this.getRequest(context),
      context.switchToHttp().getResponse(),
    ];
    const passportFn = createPassportContext(request, response);
    request[options.property || defaultOptions.property] = await passportFn(
      this.type || this.options.defaultStrategy,
      options,
      (err, user, info, status) =>
        this.handleRequest(err, user, info, context, status),
    );

    return true;
  }

  getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }

  async logIn<TRequest extends { logIn: any } = any>(
    request: TRequest,
  ): Promise<void> {
    const user = request[this.options.property || defaultOptions.property];
    await new Promise<void>((resolve, reject) =>
      request.logIn(user, (err) => (err ? reject(err) : resolve())),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err, user, info, context, status) {
    if (err || !user) {
      throw err || new TokenException(info.message || 'Invalid token!');
    }

    if (user.isBlocked) {
      throw new TokenException('Invalid user account, please contact support!');
    }

    return user;
  }
}

function createAuthGuard(type: string | string[] = 'jwt'): Type<CanActivate> {
  class MixinAuthGuard extends BaseAuthGuard implements CanActivate {
    protected type: string | string[] = type;
  }

  return mixin(MixinAuthGuard);
}

export const AuthGuard: (type?: string | string[]) => Type<IAuthGuard> =
  memoize(createAuthGuard);
