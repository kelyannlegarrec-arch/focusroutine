import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '@/components/legal-page'

export const Route = createFileRoute('/mentions-legales')({
  component: MentionsLegales,
})

function MentionsLegales() {
  return (
    <LegalPage titre="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>[Nom et prénom ou nom de l’entreprise — à compléter]</p>
      <p>[Statut : micro-entreprise, SAS… et numéro SIRET — à compléter]</p>
      <p>[Adresse — à compléter]</p>
      <p>[Email de contact — à compléter]</p>
      <h2>Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
    </LegalPage>
  )
}
