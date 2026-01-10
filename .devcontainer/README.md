# Development Container

This directory contains the development container configuration for the DoIOwnIt project.

## What's Included

The devcontainer provides:

- **Node.js 22** (with TypeScript support)
- **Automatic dependency installation** - `npm install` runs automatically when the container is created
- **Pre-configured VS Code extensions**:
  - ESLint for linting
  - Tailwind CSS IntelliSense
  - TypeScript support with better error messages
- **Auto-fix on save** - ESLint issues are automatically fixed when you save files
- **Port forwarding** - Port 3000 is automatically forwarded for the Next.js dev server

## How to Use

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop) on your machine
2. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) in VS Code
3. Open this repository in VS Code
4. When prompted, click "Reopen in Container" (or use Command Palette: `Dev Containers: Reopen in Container`)
5. Wait for the container to build and dependencies to install
6. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
7. Configure your OAuth credentials in `.env.local` (see main README.md for details)
8. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000

## Benefits

- **Consistent development environment** across all contributors
- **No need to install Node.js or npm** on your local machine
- **All dependencies are pre-installed** when the container starts
- **Linting and formatting work out of the box** with proper VS Code configuration
- **One command to get started** - just open in container and run `npm run dev`
