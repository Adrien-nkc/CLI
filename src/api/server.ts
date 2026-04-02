import { Hono } from "hono";
import { blocks } from "./data/blocks";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/blocks", (c) => {
  return c.json({ blocks });
});

app.get("/blocks/:name", (c) => {
  const name = c.req.param("name");
  const variant = c.req.query("variant");
  const block = blocks.find((b) => b.name === name);

  if (!block) {
    return c.json({ error: "Block not found" }, 404);
  }

  if (variant) {
    const selectedVariant =
      block.variants[variant as keyof typeof block.variants];
    if (!selectedVariant) {
      return c.json({ error: `Variant "${variant}" not found` }, 404);
    }
    return c.json({ block: { ...block, variant: selectedVariant } });
  }

  return c.json({ block });
});

export default app;
