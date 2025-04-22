
import { createClient } from '@supabase/supabase-js';
import { log } from '../vite';

// Get Supabase URL and API key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

// Log warning if credentials are missing
if (!supabaseUrl || !supabaseKey) {
  log('Supabase URL or API key not provided. Some features will be disabled.', 'supabase');
}

// Initialize Supabase client with error handling
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// User type definition
export interface SupabaseUser {
  id: string;
  provider: string;
  provider_id: string;
  nickname: string;
  email: string | null;
  created_at: string;
  last_login_at: string;
}

// User service with error handling
export const userService = {
  async getUserByProviderId(provider: string, providerId: string): Promise<SupabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('provider', provider)
        .eq('provider_id', providerId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          log(`User lookup error: ${error.message}`, 'supabase');
        }
        return null;
      }
      
      return data as SupabaseUser;
    } catch (err) {
      log(`Unexpected error in getUserByProviderId: ${err}`, 'supabase');
      return null;
    }
  },
  
  async createUser(userData: {
    provider: string;
    provider_id: string;
    nickname: string;
    email: string | null;
  }): Promise<SupabaseUser | null> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            provider: userData.provider,
            provider_id: userData.provider_id,
            nickname: userData.nickname,
            email: userData.email,
            created_at: now,
            last_login_at: now
          }
        ])
        .select()
        .single();
      
      if (error) {
        log(`User creation error: ${error.message}`, 'supabase');
        return null;
      }
      
      return data as SupabaseUser;
    } catch (err) {
      log(`Unexpected error in createUser: ${err}`, 'supabase');
      return null;
    }
  },
  
  async updateLastLoginTime(userId: string): Promise<SupabaseUser | null> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('users')
        .update({
          last_login_at: now
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        log(`Login time update error: ${error.message}`, 'supabase');
        return null;
      }
      
      return data as SupabaseUser;
    } catch (err) {
      log(`Unexpected error in updateLastLoginTime: ${err}`, 'supabase');
      return null;
    }
  },
  
  async getUserById(userId: string): Promise<SupabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        log(`User lookup error: ${error.message}`, 'supabase');
        return null;
      }
      
      return data as SupabaseUser;
    } catch (err) {
      log(`Unexpected error in getUserById: ${err}`, 'supabase');
      return null;
    }
  }
};
