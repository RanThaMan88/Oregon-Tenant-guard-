/**
 * Supabase client configuration for Oregon Tenant Guard.
 * 
 * Instructions:
 * 1. Install Supabase library: npm install @supabase/supabase-js
 * 2. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 3. Replace imports with this client to store cases and subscriptions.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database Schema Recommendation (SQL):
 * 
 * create table profiles (
 *   id uuid references auth.users not null primary key,
 *   email text,
 *   full_name text,
 *   is_premium boolean default false,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * create table cases (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users,
 *   jurisdiction text,
 *   landlord_name text,
 *   tenant_name text,
 *   property_address text,
 *   audit_result jsonb,
 *   is_paid boolean default false,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 */
