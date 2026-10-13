import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-3xl font-semibold">FocusRoutine</h1>
      <p className="text-muted-foreground">
        Le projet est prêt. La page d'accueil arrive à l'étape 2.
      </p>
      <Button>Commencer</Button>
    </main>
  )
}
