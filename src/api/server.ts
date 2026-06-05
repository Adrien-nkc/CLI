import { Hono } from "hono";
import { blocks } from "./data/blocks";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "data", "templates");

function readTemplateFiles(files: { name: string; template: string }[]) {
  return files.map((file) => ({
    name: file.name,
    content: readFileSync(join(TEMPLATES_DIR, file.template), "utf-8"),
  }));
}

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
  const framework = c.req.query("framework");
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

    // If files is an object with framework keys, resolve the right one
    const rawFiles = Array.isArray(selectedVariant.files)
      ? selectedVariant.files
      : (selectedVariant.files[
          framework as keyof typeof selectedVariant.files
        ] ?? []);

    const files = readTemplateFiles(rawFiles);

    return c.json({
      block: { ...block, variant: { ...selectedVariant, files } },
    });
  }

  return c.json({ block });
});

export default app;
