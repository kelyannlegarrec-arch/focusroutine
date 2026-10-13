// Crée une page de paiement Stripe pour le client connecté.
// Appelé par le bouton « Commencer » de la page /abonnement.
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  // Vérifie que les réglages Vercel sont présents (on n'affiche que les noms, jamais les valeurs)
  const manquantes = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PRICE_ID',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ].filter((nom) => !process.env[nom])
  if (manquantes.length) {
    console.error('Variables manquantes :', manquantes)
    return Response.json({ error: 'Configuration manquante', manquantes }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    // Utilise fetch : marche sur Vercel et derrière un proxy en local
    httpClient: Stripe.createFetchHttpClient(),
  })
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL as string,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
  )

  // On vérifie qui est le client grâce à son jeton de connexion Supabase
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return Response.json({ error: 'Non connecté' }, { status: 401 })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return Response.json({ error: 'Non connecté' }, { status: 401 })

  const origin = new URL(request.url).origin
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: data.user.id,
      customer_email: data.user.email,
      locale: 'fr',
      // Toujours afficher le prix en euros, quel que soit le pays du visiteur
      adaptive_pricing: { enabled: false },
      success_url: `${origin}/abonnement?paiement=ok`,
      cancel_url: `${origin}/abonnement`,
    })
  } catch (e) {
    // Le type d'erreur Stripe aide au diagnostic sans révéler de secret
    const type = e instanceof Stripe.errors.StripeError ? e.type : 'inconnue'
    console.error('Erreur Stripe :', e)
    return Response.json({ error: 'Erreur Stripe', type }, { status: 500 })
  }

  return Response.json({ url: session.url })
}
