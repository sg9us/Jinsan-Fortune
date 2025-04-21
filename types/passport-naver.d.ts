declare module 'passport-naver' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface Profile {
    id: string;
    displayName: string;
    emails?: { value: string }[];
    _json?: any;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any, info?: any) => void
      ) => void
    );
    name: string;
  }
}