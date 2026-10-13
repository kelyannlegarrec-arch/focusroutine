import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export function LegalPage({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link to="/" className="text-sm text-primary hover:underline">
        ← Retour à l’accueil
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">{titre}</h1>
      <div className="mt-8 space-y-4 text-pretty [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold">
        {children}
      </div>
    </main>
  )
}
