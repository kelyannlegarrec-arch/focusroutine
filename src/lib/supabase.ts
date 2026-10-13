import { createClient } from '@supabase/supabase-js'

// Ces deux valeurs sont publiques par conception (voir doc Supabase « API keys »).
// La sécurité des données vient des règles RLS dans la base.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
