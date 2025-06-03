import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xfxswxhpocifzqfxqehx.supabase.co'  
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHN3eGhwb2NpZnpxZnhxZWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDIxMjMsImV4cCI6MjA2Mzg3ODEyM30.Y3YFxIZmlpaRo7L54ydZ2bndbDT94a912Ci--OCXk1Y'     // ← Pega tu anon public key

export const supabase = createClient(supabaseUrl, supabaseKey)