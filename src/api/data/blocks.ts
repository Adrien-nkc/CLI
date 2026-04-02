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
      "Create a free Stripe account at https://dashboard.stripe.com/register",
      "Get your API keys at https://dashboard.stripe.com/apikeys, you need the Secret and Publishable keys",
      "In your project root, find the .env.example file Alin just created",
      "Rename .env.example to .env, this is where your secret keys live locally",
      "If you already have a .env file, just copy the contents of .env.example into it instead",
      "Open .env and paste your Stripe keys next to the matching variable names",
      "Register your webhook URL at https://dashboard.stripe.com/webhooks",
      "Copy the Webhook Secret and paste it into .env after STRIPE_WEBHOOK_SECRET=",
    ],
  },
];
