import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://cdwtsrzshpotkfbyyyjk.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd3RzcnpzaHBvdGtmYnl5eWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjQxNzMsImV4cCI6MjA2NDA0MDE3M30.n6qYEgtmWapgLOyuLva_o6-mBXnxkxIdbVFxxlSEcR4"

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)