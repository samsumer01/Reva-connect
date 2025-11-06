import { createClient } from '@supabase/supabase-js';

// --- BEGIN SETUP ---
// ACTION REQUIRED: Replace these placeholders with your actual Supabase credentials.
// You can find these in your Supabase project's dashboard under:
// Settings (the gear icon) > API > Project API Keys

// 1. Your Project URL
const supabaseUrl = 'https://viwkeeefhyzaiibugcyn.supabase.co'; // e.g., 'https://your-project-id.supabase.co'

// 2. Your 'anon' public key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpd2tlZWVmaHl6YWlpYnVnY3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjQwOTAsImV4cCI6MjA3ODAwMDA5MH0.XqxGqCUynBZom0y613R07SD96Ma0kz4PENkVqJmYC1Y';
// --- END SETUP ---

let supabase;
let supabaseError: string | null = null;

// Check if the placeholder values have been replaced.
if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE') || !supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE')) {
    supabaseError = "Supabase credentials are not set. Please open 'services/supabaseClient.ts' and replace the placeholder values with your actual Project URL and anon key from your Supabase dashboard.";
    supabase = null;
} else {
    // Initialize the Supabase client only if credentials are valid
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Export the client instance (which may be null) and the error message
export { supabase, supabaseError };
