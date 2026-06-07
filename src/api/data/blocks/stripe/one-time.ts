export const stripeOneTime = {
  variables: ["STRIPE_SECRET_KEY", "VITE_APP_URL"],
  dependencies: ["stripe", "express", "cors", "react-router-dom", "dotenv"],
  devDependencies: ["@types/express", "@types/cors"],
  files: {
    vite: [
      {
        name: "src/pages/CheckoutPage.tsx",
        template: "stripe/one-time/CheckoutPage.tsx",
      },
      {
        name: "src/pages/Success.tsx",
        template: "stripe/one-time/Success.tsx",
      },
      { name: "backend/server.ts", template: "stripe/one-time/server.ts" },
      { name: "backend/stripe.ts", template: "stripe/one-time/stripe.ts" },
      { name: "backend/payment.ts", template: "stripe/one-time/payment.ts" },
      {
        name: "src/services/stripeService.ts",
        template: "stripe/one-time/stripeService.ts",
      },
      { name: "src/App.tsx", template: "stripe/one-time/App.tsx" },
    ],
    nextjs: [],
    express: [],
    generic: [],
  },
  instructions: [
    "Start the backend server with: npm run backend",
    "Run your Vite frontend with: npm run dev",
    "Go to https://dashboard.stripe.com/apikeys to get your secret key",
    "Fill in the .env file with your STRIPE_SECRET_KEY",
  ],
};
