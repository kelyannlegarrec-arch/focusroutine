import { useEffect, useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { estAbonne } from '@/lib/abonnement'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/abonnement')({
  validateSearch: (search: Record<string, unknown>): { paiement?: 'ok' } =>
    search.paiement === 'ok' ? { paiement: 'ok' } : {},
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) throw redirect({ to: '/connexion' })
    if (await estAbonne()) throw redirect({ to: '/app' })
  },
  component: AbonnementPage,
})

const inclus = [
  'Routines illimitées',
  'Minuteur de concentration',
  'Suivi de tes journées',
  'Annulable à tout moment',
]

function AbonnementPage() {
  const { paiement } = Route.useSearch()
  const navigate = useNavigate()
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  // Retour de Stripe : on attend que le webhook active l'abonnement
  useEffect(() => {
    if (paiement !== 'ok') return
    const timer = setInterval(async () => {
      if (await estAbonne()) navigate({ to: '/app' })
    }, 2000)
    return () => clearInterval(timer)
  }, [paiement, navigate])

  async function deconnexion() {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  async function commencer() {
    setErreur(null)
    setEnCours(true)
    const { data } = await supabase.auth.getSession()
    const reponse = await fetch('/api/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${data.session?.access_token}` },
    })
    const { url } = reponse.ok ? await reponse.json() : { url: null }
    if (url) return window.location.assign(url)
    setEnCours(false)
    setErreur('Impossible d’ouvrir le paiement. Réessaie dans un instant.')
  }

  if (paiement === 'ok') {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-semibold">Merci !</h1>
        <p className="text-muted-foreground">On active ton abonnement, ça prend quelques secondes…</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Dernière étape</CardTitle>
          <CardDescription>Active ton abonnement pour accéder à FocusRoutine.</CardDescription>
          <p className="mt-2">
            <span className="text-4xl font-semibold">9,99 €</span>
            <span className="text-muted-foreground"> / mois</span>
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {inclus.map((texte) => (
              <li key={texte} className="flex gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{texte}</span>
              </li>
            ))}
          </ul>
          {erreur && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {erreur}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button size="lg" className="h-12 w-full text-base" onClick={commencer} disabled={enCours}>
            {enCours ? 'Ouverture du paiement…' : 'Commencer'}
          </Button>
          <button
            type="button"
            onClick={deconnexion}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Se déconnecter
          </button>
        </CardFooter>
      </Card>
    </main>
  )
}
