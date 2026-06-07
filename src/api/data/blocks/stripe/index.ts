import { stripeSimple } from "./simple";
import { stripeOneTime } from "./one-time";

export const stripe = {
  name: "stripe",
  description: "Stripe payment integration",
  variants: {
    simple: stripeSimple,
    "one-time": stripeOneTime,
  },
};
