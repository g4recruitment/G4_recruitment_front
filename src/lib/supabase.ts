
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Fail fast at startup instead of creating a broken client that
    // fails opaquely at runtime on the first auth/network call.
    throw new Error(
        'Missing Supabase environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. ' +
        'Check your .env.local (local) or deployment environment settings.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
