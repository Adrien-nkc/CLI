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
              template: "stripe/simple/CheckoutPage.tsx",
            },
            {
              name: "src/pages/Success.tsx",
              template: "stripe/simple/Success.tsx",
            },
            { name: "backend/server.ts", template: "stripe/simple/server.ts" },
            { name: "backend/stripe.ts", template: "stripe/simple/stripe.ts" },
            {
              name: "backend/payment.ts",
              template: "stripe/simple/payment.ts",
            },
            {
              name: "src/services/stripeService.ts",
              template: "stripe/simple/stripeService.ts",
            },
          ],
          nextjs: [],
          express: [],
          generic: [],
        },
        instructions: [
          "Start the backend server with: npm run backend",
          "Run your Vite frontend with: npm run dev",
          "Create a product and price in your Stripe dashboard at https://dashboard.stripe.com/products",
          "Copy the Price ID and use it as VITE_PRICE_ID in your .env file",
          "Add the generated pages to your router: /checkout → src/pages/CheckoutPage.tsx, /success → src/pages/Success.tsx",
        ],
      },
    },
  },
];
