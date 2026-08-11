import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[Supabase Admin] Initialization warning: URL or Key is missing.');
}

export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);
