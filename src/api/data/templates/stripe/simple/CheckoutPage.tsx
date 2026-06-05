// @ts-nocheck
import { createCheckoutSession } from "../services/stripeService";

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

export default CheckoutPage;
