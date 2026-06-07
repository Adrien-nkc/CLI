export const stripeSimple = {
  variables: ["STRIPE_SECRET_KEY", "VITE_PRICE_ID", "VITE_APP_URL"],
  dependencies: ["stripe", "express", "cors", "react-router-dom"],
  devDependencies: ["@types/express", "@types/cors"],
  files: {
    vite: [
      {
        name: "src/pages/CheckoutPage.tsx",
        template: "stripe/simple/CheckoutPage.tsx",
      },
      { name: "src/pages/Success.tsx", template: "stripe/simple/Success.tsx" },
      { name: "backend/server.ts", template: "stripe/simple/server.ts" },
      { name: "backend/stripe.ts", template: "stripe/simple/stripe.ts" },
      { name: "backend/payment.ts", template: "stripe/simple/payment.ts" },
      {
        name: "src/services/stripeService.ts",
        template: "stripe/simple/stripeService.ts",
      },
      { name: "src/App.tsx", template: "stripe/simple/App.tsx" },
    ],
    nextjs: [],
    express: [],
    generic: [],
  },
  instructions: [
    "Start the backend server with: npm run backend",
    "Run your Vite frontend with: npm run dev",
    "If you haven't created a product in the Stripe dashboard you can go to https://dashboard.stripe.com/products",
  ],
};
