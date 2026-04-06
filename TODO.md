## TODO: End-to-end validation of `alin install stripe`

### Goal

Simulate being a real client and validate the full Stripe simple variant works end to end on a fresh Vite + React project.

### Steps

1. Create a fresh Vite + React + TypeScript project
2. Run `alin install stripe` and select simple
3. Rename `.env.example` to `.env` and add a real Stripe test secret key
4. Create a test product and price in the Stripe dashboard
5. Wire up `createCheckoutSession()` in a simple button component
6. Start the backend Express server and the Vite dev server
7. Click the button and verify it redirects to Stripe's hosted checkout page
8. Complete a test payment using Stripe's test card `4242 4242 4242 4242`
9. Verify the success redirect works and `getCheckoutSession()` returns the right data

### Pass criteria

- No manual file editing required beyond adding the secret key
- Everything works out of the box

# What the CLI can do:

✅ Fetches blocks from the API
✅ Asks which variant the user wants (simple or advanced)
✅ Detects framework (Next.js, Vite, Express, generic)
✅ Passes framework to API to get the right files
✅ Detects package manager (npm, bun, pnpm, yarn)
✅ Checks if it's a Node project, sets one up if not
✅ Installs all dependencies and devDependencies automatically
✅ Skips packages already installed
✅ Creates folders automatically if they don't exist
✅ Generates all integration files in the right locations
✅ Handles .env.example conflicts with a prompt
✅ Skips existing files
✅ Shows next steps with clickable links after install

# Do the SDK but make a plan first
