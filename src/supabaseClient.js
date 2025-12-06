// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://yjkjfsnwvyeolruzshcf.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqa2pmc253dnllb2xydXpzaGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDU5MDYsImV4cCI6MjA4MDU4MTkwNn0.diYZBnySLVV02XFqGyH7woIz5LX2gifrWToyCDOLH4w"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)