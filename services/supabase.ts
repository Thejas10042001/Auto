
import { createClient } from '@supabase/supabase-js';

/**
 * COGNITIVE SALES AI - SUPABASE SERVICE
 * 
 * CRITICAL CONFIGURATION FOR GOOGLE OAUTH:
 * 1. Go to: https://console.cloud.google.com/apis/credentials
 * 2. Select your OAuth 2.0 Client ID.
 * 3. Add this EXACT URL to "Authorized redirect URIs":
 *    https://psywkhxrbgiriwzvcdpd.supabase.co/auth/v1/callback
 * 
 * 4. Go to Supabase Dashboard > Auth > URL Configuration:
 *    - Site URL: https://latency-ten.vercel.app/
 *    - Redirect URLs: https://latency-ten.vercel.app/**
 */

const SUPABASE_PROJECT_URL = "https://psywkhxrbgiriwzvcdpd.supabase.co";

const env = (window as any).process?.env || {};
const supabaseUrl = env.SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY || '';

const isKeyConfigured = supabaseAnonKey && 
                        supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' && 
                        supabaseAnonKey !== 'placeholder-key-missing' &&
                        supabaseAnonKey !== '';

export const supabase = createClient(
  supabaseUrl, 
  isKeyConfigured ? supabaseAnonKey : 'placeholder-key-missing'
);

export const signInWithGoogle = async () => {
  if (!isKeyConfigured) {
    return { error: { message: "Supabase configuration incomplete. Check index.html environment variables." } };
  }
  
  // Explicitly set the production redirect URL as requested by the user
  const redirectTo = 'https://latency-ten.vercel.app/';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  });

  if (error) {
    console.error('Handshake Error:', error);
    return { error };
  }
  return { data };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign out failed:', error.message);
};
