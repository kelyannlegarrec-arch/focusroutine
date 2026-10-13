import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '@/components/legal-page'

export const Route = createFileRoute('/remboursement')({
  component: Remboursement,
})

function Remboursement() {
  return (
    <LegalPage titre="Conditions de remboursement">
      <p>[Texte à valider avec toi avant la mise en ligne.]</p>
      <h2>Annulation</h2>
      <p>
        Tu peux annuler ton abonnement à tout moment. Il reste actif jusqu’à
        la fin du mois déjà payé, puis il s’arrête.
      </p>
      <h2>Remboursement</h2>
      <p>[Règle de remboursement — à compléter]</p>
      <h2>Contact</h2>
      <p>[Email de contact — à compléter]</p>
    </LegalPage>
  )
}
