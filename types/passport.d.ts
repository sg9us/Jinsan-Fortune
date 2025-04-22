import { SupabaseUser } from '../server/services/supabase';

declare module 'passport' {
  interface PassportStatic {
    serializeUser<TID = string>(fn: (user: SupabaseUser, done: (err: any, id?: TID) => void) => void): void;
    deserializeUser<TID = string, TUser = false | SupabaseUser | null | undefined>(fn: (id: TID, done: (err: any, user?: TUser) => void) => void): void;
  }
}