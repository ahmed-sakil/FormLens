const { createClient } = window.supabase;
export const supabaseClient = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
