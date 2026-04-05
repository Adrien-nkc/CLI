export const blocks = [
  {
    name: "stripe",
    description: "Stripe payment integration",
    variants: {
      simple: {
        variables: ["STRIPE_SECRET_KEY", "VITE_PRICE_ID", "VITE_APP_URL"],
        dependencies: ["stripe", "express", "cors", "react-router-dom"],
        devDependencies: ["@types/express", "@types/cors"],
        files: {
          vite: [
            {
              name: "src/pages/CheckoutPage.tsx",
              content: `import { createCheckoutSession } from '../services/stripeService';

function CheckoutPage() {
  const handleCheckout = async () => {
    await createCheckoutSession(import.meta.env.VITE_PRICE_ID);
  };

  return (
    <div>
      <h1>Subscribe</h1>
      <button onClick={handleCheckout}>Subscribe</button>
    </div>
  );
}

export default CheckoutPage;`,
            },
            {
              name: "src/pages/Success.tsx",
              content: `import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCheckoutSession } from '../services/stripeService';

function Success() {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    getCheckoutSession(sessionId)
      .then((data) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to retrieve session');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Payment Successful! 🎉</h1>
      <p>Thank you for subscribing!</p>
      <p>Status: {session?.status}</p>
      <p>Email: {session?.customer_details?.email}</p>
    </div>
  );
}

export default Success;`,
            },
            {
              name: "backend/server.ts",
              content: `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './payment.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// Allow requests from your Vite frontend
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());

// Mount payment routes
app.use('/api/payment', paymentRoutes);

app.listen(PORT, () => {
  console.log('✓ Backend server running at http://localhost:' + PORT);
});

export default app;`,
            },
            {
              name: "backend/stripe.ts",
              content: `import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from your .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.trim() === '') {
  console.warn('⚠️  Warning: STRIPE_SECRET_KEY is not set.');
  console.warn('   Get it from: https://dashboard.stripe.com/apikeys');
  console.warn('   Set it in your .env file');
}

// Initialize Stripe with your secret key
const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export default stripe;`,
            },
            {
              name: "backend/payment.ts",
              content: `import express from 'express';
import stripe from './stripe.ts';

const router = express.Router();

// POST /api/payment/checkout-session
// Creates a Stripe hosted checkout session and returns the URL
// Body: { priceId, returnUrlBase }
// returnUrlBase: the frontend origin e.g. http://localhost:5173
router.post('/checkout-session', async (req, res) => {
  try {
    const { priceId, returnUrlBase } = req.body;

    // Basic validation
    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }
    if (!returnUrlBase) {
      return res.status(400).json({ error: 'returnUrlBase is required' });
    }

    // mode: 'subscription' for recurring payments (e.g. memberships, SaaS)
    // change to 'payment' for one-time payments
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: \`\${returnUrlBase}/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${returnUrlBase}/cancel\`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// GET /api/payment/checkout-session/:sessionId
// Retrieves session details after payment (used for order confirmation)
router.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
      { expand: ['payment_intent'] }
    );
    res.json({ session });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ error: 'Failed to retrieve checkout session' });
  }
});

export default router;`,
            },
            {
              name: "src/services/stripeService.ts",
              content: `// stripeService.ts
// Handles all frontend communication with the backend payment API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';

// Creates a checkout session and redirects the user to Stripe's hosted payment page
// priceId: the Stripe price ID for the plan (found in your Stripe dashboard)
// returnUrlBase: your frontend origin e.g. http://localhost:5173
export async function createCheckoutSession(priceId: string, returnUrlBase: string = import.meta.env.VITE_APP_URL ?? 'http://localhost:5173'): Promise<void> {
  try {
    const response = await fetch(\`\${API_BASE_URL}/payment/checkout-session\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, returnUrlBase }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();

    // Redirect user to Stripe's hosted checkout page
    window.location.href = url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Retrieves session details after payment for confirmation page
// sessionId: comes from the URL after Stripe redirects back (?session_id=xxx)
export async function getCheckoutSession(sessionId: string) {
  try {
    const response = await fetch(\`\${API_BASE_URL}/payment/checkout-session/\${sessionId}\`);

    if (!response.ok) {
      throw new Error('Failed to retrieve checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
}`,
            },
          ],
          nextjs: [],
          express: [],
          generic: [],
        },
        instructions: [
          "Create a free Stripe account at https://dashboard.stripe.com/register",
          "Get your API keys at https://dashboard.stripe.com/apikeys, you only need the Secret key",
          "In your project root, find the .env.example file Alin just created",
          "Rename .env.example to .env, this is where your secret keys live locally",
          "If you already have a .env file, just copy the contents of .env.example into it instead",
          "Open .env and paste your Stripe Secret key after STRIPE_SECRET_KEY=",
          "Start the backend server with: npm run backend",
          "Run your Vite frontend with: npm run dev",
          "Create a product and price in your Stripe dashboard at https://dashboard.stripe.com/products",
          "Copy the Price ID and use it as priceId when calling createCheckoutSession()",
          "Add the generated pages to your router: /checkout → src/pages/CheckoutPage.tsx, /success → src/pages/Success.tsx",
        ],
      },
      advanced: {
        variables: [
          "STRIPE_SECRET_KEY",
          "STRIPE_PUBLISHABLE_KEY",
          "STRIPE_WEBHOOK_SECRET",
        ],
        dependencies: ["stripe"],
        devDependencies: [],
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
    },
  },
];
