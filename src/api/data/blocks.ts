export const blocks = [
  {
    name: "stripe",
    description: "Stripe payment integration",
    variables: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  },
  {
    name: "google-oauth",
    description: "Google OAuth 2.0 authentication",
    variables: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
];
