// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hqxewdnygtlmglbhmpmn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeGV3ZG55Z3RsbWdsYmhtcG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjA4MjEsImV4cCI6MjA3MDk5NjgyMX0.gWvbVut8ucBoI8a2KK4Nlb1T-twVw82I6jOdAfffTZg'

export const supabase = createClient(supabaseUrl, supabaseKey)
