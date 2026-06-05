// @ts-nocheck
import express from "express";
import stripe from "./stripe.ts";

const router = express.Router();

router.post("/checkout-session", async (req, res) => {
  try {
    const { priceId, returnUrlBase } = req.body;
    if (!priceId) return res.status(400).json({ error: "priceId is required" });
    if (!returnUrlBase)
      return res.status(400).json({ error: "returnUrlBase is required" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrlBase}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrlBase}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.get("/checkout-session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
      { expand: ["payment_intent"] },
    );
    res.json({ session });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve checkout session" });
  }
});

export default router;
