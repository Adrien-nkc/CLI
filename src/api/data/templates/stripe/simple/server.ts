// @ts-nocheck

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoutes from "./payment.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json());
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => {
  console.log("✓ Backend server running at http://localhost:" + PORT);
});

export default app;
