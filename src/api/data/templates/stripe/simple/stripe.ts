// @ts-nocheck

import Stripe from "stripe";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.trim() === "") {
  console.warn("⚠️  Warning: STRIPE_SECRET_KEY is not set.");
  console.warn("   Get it from: https://dashboard.stripe.com/apikeys");
}

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export default stripe;
