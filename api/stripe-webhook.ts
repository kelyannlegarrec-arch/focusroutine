// Reçoit les messages de Stripe (paiement réussi, abonnement annulé…)
// et met à jour le statut d'abonnement du client dans Supabase.
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Lit un réglage Vercel en retirant les espaces et retours à la ligne invisibles
const env = (nom: string) => (process.env[nom] ?? '').trim()

export async function POST(request: Request) {
  const stripe = new Stripe(env('STRIPE_SECRET_KEY'), {
    // Utilise fetch : marche sur Vercel et derrière un proxy en local
    httpClient: Stripe.createFetchHttpClient(),
  })
  // Clé secrète Supabase : elle seule peut modifier les fiches clients
  const supabase = createClient(
    env('VITE_SUPABASE_URL'),
    env('SUPABASE_SECRET_KEY'),
  )

  // On vérifie que le message vient vraiment de Stripe (signature)
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env('STRIPE_WEBHOOK_SECRET'),
    )
  } catch {
    return new Response('Signature invalide', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    if (session.client_reference_id && session.subscription) {
      // On relit l'abonnement chez Stripe pour avoir son statut à jour
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: session.customer as string,
          subscription_status: subscription.status,
        })
        .eq('id', session.client_reference_id)
      if (error) return new Response('Erreur base de données', { status: 500 })
    }
  }

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    // Les messages peuvent arriver dans le désordre : on relit le statut actuel
    const subscription = await stripe.subscriptions.retrieve(event.data.object.id)
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: subscription.status })
      .eq('stripe_customer_id', subscription.customer as string)
    if (error) return new Response('Erreur base de données', { status: 500 })
  }

  return new Response('ok')
}
