import { useState, type FormEvent } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Play, X } from 'lucide-react'
import { Minuteur } from '@/components/minuteur'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { estAbonne } from '@/lib/abonnement'
import {
  chargerJournee,
  enregistrerJournee,
  genererRoutine,
  joursTenus7j,
  nouveauBloc,
  type Bloc,
} from '@/lib/journee'
import { preparerSon } from '@/lib/son'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/app')({
  // Page réservée aux abonnés actifs
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) throw redirect({ to: '/connexion' })
    if (!(await estAbonne())) throw redirect({ to: '/abonnement' })
    return { user: data.session.user }
  },
  loader: async () => ({ blocs: await chargerJournee(), tenus: await joursTenus7j() }),
  component: AppPage,
})

const durees = [15, 25, 45]

function AppPage() {
  const { user } = Route.useRouteContext()
  const charge = Route.useLoaderData()
  const navigate = useNavigate()
  const [blocs, setBlocs] = useState<Bloc[] | null>(charge.blocs)
  const [tenus, setTenus] = useState(charge.tenus)
  const [enCours, setEnCours] = useState<string | null>(null)
  const [erreur, setErreur] = useState(false)
  const [titre, setTitre] = useState('')
  const [minutes, setMinutes] = useState(25)

  // Chaque changement est enregistré dans Supabase, puis le suivi est recalculé
  async function changer(nouveaux: Bloc[]) {
    setBlocs(nouveaux)
    const ok = await enregistrerJournee(user.id, nouveaux)
    setErreur(!ok)
    if (ok) setTenus(await joursTenus7j())
  }

  function cocher(id: string, fait: boolean) {
    if (blocs) void changer(blocs.map((b) => (b.id === id ? { ...b, fait } : b)))
  }

  function retirer(id: string) {
    if (blocs) void changer(blocs.filter((b) => b.id !== id))
  }

  function ajouter(e: FormEvent) {
    e.preventDefault()
    if (!blocs || !titre.trim()) return
    void changer([...blocs, nouveauBloc(titre.trim(), minutes)])
    setTitre('')
  }

  function demarrer(id: string) {
    preparerSon()
    setEnCours(id)
  }

  async function deconnexion() {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  const blocEnCours = blocs?.find((b) => b.id === enCours)
  const travail = blocs?.filter((b) => !b.pause) ?? []
  const faits = travail.filter((b) => b.fait).length
  const aujourdhui = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  function terminer(id: string) {
    setEnCours(null)
    cocher(id, true)
  }

  return (
    <div className="min-h-svh">
      {blocEnCours && (
        <Minuteur
          key={blocEnCours.id}
          bloc={blocEnCours}
          onTermine={() => terminer(blocEnCours.id)}
          onArreter={() => setEnCours(null)}
        />
      )}

      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-4 px-4">
          <span className="text-lg font-semibold">FocusRoutine</span>
          <Button variant="outline" onClick={deconnexion}>
            Se déconnecter
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Ma journée</h1>
          <p className="mt-1 text-muted-foreground first-letter:uppercase">{aujourdhui}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {tenus} {tenus > 1 ? 'jours tenus' : 'jour tenu'} sur les 7 derniers
            </CardTitle>
            <CardDescription>Une journée est tenue quand tous tes blocs de travail sont cochés.</CardDescription>
          </CardHeader>
          {blocs && travail.length > 0 && (
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Aujourd’hui : {faits} / {travail.length} blocs de travail
              </p>
              <Progress value={(faits / travail.length) * 100} className="h-2" />
            </CardContent>
          )}
        </Card>

        {erreur && (
          <p role="alert" className="text-sm text-destructive">
            Ta dernière modification n’a pas été enregistrée. Vérifie ta connexion.
          </p>
        )}

        {!blocs ? (
          <Card>
            <CardHeader>
              <CardTitle>Prêt pour aujourd’hui ?</CardTitle>
              <CardDescription>
                On te prépare une journée type de recherche d’emploi. Tu pourras l’ajuster.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="h-12 w-full text-base" onClick={() => changer(genererRoutine())}>
                Générer ma routine
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <ul className="divide-y rounded-xl border">
              {blocs.map((bloc) => (
                <li key={bloc.id} className="flex items-center gap-3 px-4 py-3">
                  <Checkbox
                    checked={bloc.fait}
                    onCheckedChange={(v) => cocher(bloc.id, v === true)}
                    aria-label={`Bloc ${bloc.titre} terminé`}
                    className="size-5"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`break-words ${bloc.pause ? 'text-muted-foreground' : ''} ${bloc.fait ? 'line-through opacity-60' : ''}`}
                    >
                      {bloc.titre}
                    </p>
                    <p className="text-sm text-muted-foreground">{bloc.minutes} min</p>
                  </div>
                  {!bloc.fait && (
                    <Button
                      size="icon-lg"
                      variant={bloc.pause ? 'outline' : 'default'}
                      onClick={() => demarrer(bloc.id)}
                      aria-label={`Démarrer ${bloc.titre}`}
                    >
                      <Play />
                    </Button>
                  )}
                  <Button
                    size="icon-lg"
                    variant="ghost"
                    onClick={() => retirer(bloc.id)}
                    aria-label={`Retirer ${bloc.titre}`}
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>

            <Card>
              <CardHeader>
                <CardTitle>Ajouter un bloc</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={ajouter} className="space-y-3">
                  <Input
                    placeholder="Ex. : Préparer un entretien"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    maxLength={60}
                    aria-label="Nom du bloc"
                    className="h-11 text-base"
                  />
                  <div className="flex gap-2">
                    {durees.map((d) => (
                      <Button
                        key={d}
                        type="button"
                        variant={minutes === d ? 'default' : 'outline'}
                        className="h-10 flex-1"
                        onClick={() => setMinutes(d)}
                      >
                        {d} min
                      </Button>
                    ))}
                  </div>
                  <Button type="submit" variant="outline" className="h-11 w-full" disabled={!titre.trim()}>
                    Ajouter
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
