// @ts-nocheck

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

export async function createCheckoutSession(
  priceId: string,
  returnUrlBase: string = import.meta.env.VITE_APP_URL ??
    "http://localhost:5173",
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/payment/checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, returnUrlBase }),
  });
  if (!response.ok) throw new Error("Failed to create checkout session");
  const { url } = await response.json();
  window.location.href = url;
}

export async function getCheckoutSession(sessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/payment/checkout-session/${sessionId}`,
  );
  if (!response.ok) throw new Error("Failed to retrieve checkout session");
  return await response.json();
}
