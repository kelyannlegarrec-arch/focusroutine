import { supabase } from '@/lib/supabase'

// Lit le statut d'abonnement du client connecté dans sa fiche Supabase
export async function estAbonne() {
  const { data } = await supabase.from('profiles').select('subscription_status').single()
  return data?.subscription_status === 'active'
}
