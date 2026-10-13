import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/app')({
  // Page réservée : sans session, on renvoie vers la connexion
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) throw redirect({ to: '/connexion' })
    return { user: data.session.user }
  },
  component: AppPage,
})

function AppPage() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()

  async function deconnexion() {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <span className="text-lg font-semibold">FocusRoutine</span>
          <Button variant="outline" onClick={deconnexion}>
            Se déconnecter
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Ton espace</h1>
        <p className="mt-2 break-words text-muted-foreground">
          Connecté avec {user.email}
        </p>
      </main>
    </div>
  )
}
