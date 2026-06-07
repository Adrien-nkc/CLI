# What is Alin?

Alin is a CLI tool that allows you to turn a longe API integration into a single command. It is meant for developers who want to quickly add a new API integration to their project without going trough all of the documentation and setup.

# Use Alin

`npx alin-cli install stripe`

# What can Alin do compared to using AI tools?

Alin will not make you go back and forth between any AI. It is a simple integration tool that will help you add API integrations without burning unnecessary tokens.

Alin doesn't generate code, it installs it. No back and forth, no token burning, no verifying AI output. Just run `alin install [integration]` (do an effect that changes the word of the implementation in landing page) and get a working integration every time.

Deterministic beats generative when you just need it to work.

"It just works"

"For prototyping, hackathons, or getting started quickly, this is a massive time saver."

# How to run the server

`bun run server`

This will start a local server that will serve as your backend

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
