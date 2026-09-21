import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const supabaseUrl = process.env.SUPABASE_URL || 'https://xrrfnothrmzjhzehchyt.supabase.co';
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_0H0n11UsDIA2USKIgmjYOg_pNtU5nQm';
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});


