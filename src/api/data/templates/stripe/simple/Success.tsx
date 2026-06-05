// @ts-nocheck
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCheckoutSession } from "../services/stripeService";

function Success() {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }
    getCheckoutSession(sessionId)
      .then((data) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to retrieve session");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Payment Successful! 🎉</h1>
      <p>Thank you for subscribing!</p>
      <p>Status: {session?.status}</p>
      <p>Email: {session?.customer_details?.email}</p>
    </div>
  );
}

export default Success;
