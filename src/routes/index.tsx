import { Link, createFileRoute } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const etapes = [
  {
    titre: 'Tu listes ta journée',
    texte: 'Candidatures, CV, formation… tu notes ce que tu dois faire aujourd’hui.',
  },
  {
    titre: 'On crée ta routine',
    texte: 'FocusRoutine te propose une routine claire, avec des pauses.',
  },
  {
    titre: 'Tu lances le minuteur',
    texte: 'Tu avances tâche par tâche et tu coches au fur et à mesure.',
  },
]

const differences = [
  'FocusKit est fait pour tout le monde. FocusRoutine est fait pour la recherche du premier emploi.',
  'Des routines prêtes à l’emploi : candidatures, relances, préparation d’entretien.',
  'Un suivi simple de tes journées, pour garder le rythme semaine après semaine.',
]

const inclus = [
  'Routines illimitées',
  'Minuteur de concentration',
  'Suivi de tes journées',
  'Annulable à tout moment',
]

const questions = [
  {
    q: 'Est-ce que je peux annuler quand je veux ?',
    r: 'Oui, en un clic, sans frais.',
  },
  {
    q: 'C’est fait pour moi si je ne suis pas développeur ?',
    r: 'Oui, FocusRoutine marche pour tous les métiers.',
  },
  {
    q: 'Ça marche sur téléphone ?',
    r: 'Oui, directement dans ton navigateur, sans rien installer.',
  },
  {
    q: 'Mes données sont-elles protégées ?',
    r: 'Oui, ton compte est privé : toi seul vois tes routines.',
  },
]

function HomePage() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <a href="#" className="text-lg font-semibold">
            FocusRoutine
          </a>
          <Button asChild>
            <a href="#prix">Commencer</a>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Tiens ta journée, même sans patron derrière toi.
          </h1>
          <p className="mt-5 text-lg text-pretty text-muted-foreground">
            Pour les jeunes qui cherchent leur premier emploi depuis chez eux :
            une routine du jour générée en 1 clic, et un minuteur pour avancer
            tâche par tâche.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-6 text-base">
            <a href="#prix">Commencer</a>
          </Button>
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">
              Comment ça marche
            </h2>
            <ol className="mt-10 grid gap-4 sm:grid-cols-3">
              {etapes.map((etape, i) => (
                <li key={etape.titre}>
                  <Card className="h-full">
                    <CardHeader>
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                      <CardTitle className="mt-2">{etape.titre}</CardTitle>
                      <CardDescription>{etape.texte}</CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            Pourquoi pas FocusKit ?
          </h2>
          <ul className="mt-10 space-y-4">
            {differences.map((texte) => (
              <li key={texte} className="flex gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{texte}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="prix" className="scroll-mt-14 border-t bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">
              Un seul prix, tout compris
            </h2>
            <Card className="mx-auto mt-10 max-w-sm">
              <CardHeader>
                <CardTitle>FocusRoutine</CardTitle>
                <p className="mt-2">
                  <span className="text-4xl font-semibold">9,99 €</span>
                  <span className="text-muted-foreground"> / mois</span>
                </p>
                <CardDescription>Sans engagement.</CardDescription>
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
              </CardContent>
              <CardFooter>
                {/* Le paiement Stripe sera branché à l'étape 4 */}
                <Button size="lg" className="h-12 w-full text-base">
                  Commencer
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            Questions fréquentes
          </h2>
          <Accordion type="single" collapsible className="mt-10">
            {questions.map(({ q, r }) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-base">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {r}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FocusRoutine</p>
          <nav className="flex gap-6">
            <Link to="/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
            <Link to="/remboursement" className="hover:text-foreground">
              Conditions de remboursement
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
