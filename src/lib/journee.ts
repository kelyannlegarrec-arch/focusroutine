import { supabase } from '@/lib/supabase'

export type Bloc = {
  id: string
  titre: string
  minutes: number
  pause: boolean
  fait: boolean
}

// La journée type d'une recherche de premier emploi
const routineType: Omit<Bloc, 'id' | 'fait'>[] = [
  { titre: 'Candidatures', minutes: 45, pause: false },
  { titre: 'Pause', minutes: 10, pause: true },
  { titre: 'Relances (emails, appels)', minutes: 25, pause: false },
  { titre: 'Pause', minutes: 5, pause: true },
  { titre: 'CV et LinkedIn', minutes: 25, pause: false },
  { titre: 'Pause', minutes: 10, pause: true },
  { titre: 'Formation', minutes: 45, pause: false },
]

export function genererRoutine(): Bloc[] {
  return routineType.map((bloc) => ({ ...bloc, id: crypto.randomUUID(), fait: false }))
}

export function nouveauBloc(titre: string, minutes: number): Bloc {
  return { id: crypto.randomUUID(), titre, minutes, pause: false, fait: false }
}

// Date du jour au format AAAA-MM-JJ, à l'heure du téléphone
export function dateDuJour(decalageJours = 0) {
  const d = new Date()
  d.setDate(d.getDate() + decalageJours)
  return d.toLocaleDateString('sv-SE')
}

// Une journée est « tenue » quand tous ses blocs de travail sont cochés
export function journeeTenue(blocs: Bloc[]) {
  const travail = blocs.filter((b) => !b.pause)
  return travail.length > 0 && travail.every((b) => b.fait)
}

export async function chargerJournee(): Promise<Bloc[] | null> {
  const { data } = await supabase
    .from('journees')
    .select('blocs')
    .eq('jour', dateDuJour())
    .maybeSingle()
  return (data?.blocs as Bloc[] | undefined) ?? null
}

export async function enregistrerJournee(userId: string, blocs: Bloc[]) {
  const { error } = await supabase.from('journees').upsert(
    { user_id: userId, jour: dateDuJour(), blocs, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,jour' },
  )
  return !error
}

// Nombre de journées tenues sur les 7 derniers jours (aujourd'hui compris)
export async function joursTenus7j() {
  const { data } = await supabase
    .from('journees')
    .select('blocs')
    .gte('jour', dateDuJour(-6))
  return (data ?? []).filter((j) => journeeTenue(j.blocs as Bloc[])).length
}
