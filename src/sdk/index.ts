// ─── Alin SDK ──────────────────────────────────────────────────────────────

interface AlinConfig {
  apiUrl: string;
}

// Global config store
let config: AlinConfig = {
  apiUrl: "http://localhost:3001",
};

// Set global config once in your app
export const alin = {
  config: (options: AlinConfig) => {
    config = { ...config, ...options };
  },
};

// Get config (used internally by SDK components)
export const getConfig = () => config;

export { stripe } from "./stripe.js";
export { StripeCheckoutButton } from "./components.js";
