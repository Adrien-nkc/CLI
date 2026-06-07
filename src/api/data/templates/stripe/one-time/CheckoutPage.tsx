// @ts-nocheck
import { createCheckoutSession } from "../services/stripeService";

function CheckoutPage() {
  const handleCheckout = async () => {
    await createCheckoutSession(1000, "usd");
  };

  return (
    <div>
      <h1>Pay Now</h1>
      <button onClick={handleCheckout}>Pay $10.00</button>
    </div>
  );
}

export default CheckoutPage;
