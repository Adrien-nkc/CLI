export const blocks = [
  {
    name: "stripe",
    description: "Stripe payment integration",
    package: "stripe",
    variables: [
      "STRIPE_SECRET_KEY",
      "STRIPE_PUBLISHABLE_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ],
    files: [
      {
        name: "stripe.ts",
        content: `import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.trim() === '') {
  console.warn('⚠️  Warning: STRIPE_SECRET_KEY is not set.');
  console.warn('   Get it from: https://dashboard.stripe.com/apikeys');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});`,
      },
      {
        name: "checkout.ts",
        content: `import { stripe } from './stripe';

export async function createCheckoutSession(priceId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: \`\${process.env.NEXT_PUBLIC_URL}/success\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/cancel\`,
  });
  return session.url;
}`,
      },
      {
        name: "webhook.ts",
        content: `import { stripe } from './stripe';

export async function handleWebhook(body: string, signature: string) {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // TODO: fulfill the order
    console.log('Payment successful:', session.id);
  }
}`,
      },
    ],
    instructions: [
      "Create an account at stripe.com",
      "Go to Developers > API Keys and copy your Secret and Publishable keys",
      "Add your keys to .env",
      "Go to Developers > Webhooks and register your webhook URL",
      "Copy the Webhook Secret into .env as STRIPE_WEBHOOK_SECRET",
    ],
  },
];
