# How to run the server

`bun run server`

# Run a test in watch mode

`bun run test`

# Run a test

`bun run test:run`

# How to build and install the package globally

`bun run build`
`npm install -g . --force`

## You can also run bun run r (reinstall), which is a command I created in package.json to run those two with only one command

# How to push and pull changes

`git pull` or `git pull origin main` # grab latest changes

`git add .` # stage everything
`git commit -m "commit"` # save a snapshot
`git push origin main ` # send to GitHub

# If you want to clone the repo:

`git clone https://github.com/Adrien-nkc/CLI`

then `cd CLI` and `bun install`

# How to run tests

`npx vitest run`

# How to run tests in watch mode (live reload)

`npx vitest watch`

# How to install globally

`npm i -g . --force` use --force if it already exists

# How to uninstall globally

`npm uninstall -g alin` the reason why the npm knows that the package is called "alin" is because the package.json has the name field set to "alin"

# TODO

1. JavaScript fundamentals first
   You're writing TypeScript but there are JS concepts underneath you haven't hit yet — promises, async/await, fetch. You'll need these the moment Alin talks to a backend API.
2. Finish Alin's core
   Put real boilerplate code inside the generated files. When someone runs alin install stripe the created stripe.ts should have actual working code, not a comment. This will teach you file manipulation and string templating.
3. Build the backend
   A simple REST API that stores integration templates. This is when Alin becomes a real product — templates live on your server, not hardcoded in the CLI. This teaches you servers, APIs and databases.
