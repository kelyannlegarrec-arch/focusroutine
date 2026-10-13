import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

type Mode = 'inscription' | 'connexion'

const textes = {
  inscription: {
    titre: 'Crée ton compte',
    description: 'Un email et un mot de passe, c’est tout.',
    bouton: 'Créer mon compte',
    lien: 'Déjà un compte ? Se connecter',
    vers: '/connexion',
  },
  connexion: {
    titre: 'Connexion',
    description: 'Content de te revoir.',
    bouton: 'Se connecter',
    lien: 'Pas encore de compte ? S’inscrire',
    vers: '/inscription',
  },
} as const

// Traduit les erreurs Supabase les plus courantes en français simple
function messageErreur(message: string) {
  if (message.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.'
  if (message.includes('already registered')) return 'Un compte existe déjà avec cet email.'
  if (message.includes('Password should be')) return 'Le mot de passe doit faire au moins 6 caractères.'
  if (message.includes('Email not confirmed')) return 'Confirme d’abord ton email (regarde ta boîte de réception).'
  return 'Une erreur est survenue. Réessaie dans un instant.'
}

export function AuthForm({ mode }: { mode: Mode }) {
  const t = textes[mode]
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    setInfo(null)
    setEnCours(true)

    const { data, error } =
      mode === 'inscription'
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/app` },
          })
        : await supabase.auth.signInWithPassword({ email, password })

    setEnCours(false)
    if (error) return setErreur(messageErreur(error.message))
    if (!data.session) {
      return setInfo('Compte créé ! Clique sur le lien reçu par email pour l’activer.')
    }
    navigate({ to: '/app' })
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link to="/" className="mb-2 font-semibold">
            FocusRoutine
          </Link>
          <CardTitle className="text-xl">{t.titre}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'inscription' ? 'new-password' : 'current-password'}
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 text-base"
              />
            </div>
            {erreur && (
              <p role="alert" className="text-sm text-destructive">
                {erreur}
              </p>
            )}
            {info && <p className="text-sm text-primary">{info}</p>}
          </CardContent>
          <CardFooter className="mt-6 flex-col gap-4">
            <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={enCours}>
              {enCours ? 'Patiente…' : t.bouton}
            </Button>
            <Link to={t.vers} className="text-sm text-muted-foreground hover:text-foreground">
              {t.lien}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
