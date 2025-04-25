# Installation Guide for Grandma's Television

This guide will help you properly set up and run Grandma's Television on your local machine.

## Prerequisites

- Node.js v18.0.0 or higher (recommended: Node.js 18 LTS)
- npm v8.0.0 or higher

## Installation Steps

1. **Clean installation**

   For a fresh installation, remove any existing `node_modules` folder and `package-lock.json` file:

   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

   This should start the Vite development server, typically on http://localhost:5173

## Troubleshooting

If you encounter the error `SyntaxError: Cannot use import statement outside a module`, try these solutions:

1. **Ensure correct Node.js version**

   ```bash
   node -v
   ```

   Make sure you're using Node.js v18.0.0 or higher. If not, update Node.js using nvm or download the latest version from the official website.

2. **Try installing with the --legacy-peer-deps flag**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Check for conflicting global dependencies**

   If you have global installations of packages like Vite, they might conflict with the local installation:

   ```bash
   npm list -g --depth=0
   ```

   Consider temporarily disabling global packages when running this project.

## Build for Production

When you're ready to deploy the application:

```bash
npm run build
```

This will generate optimized files in the `dist` directory that you can deploy to any static web hosting service.

## Deploying to Vercel

This application is optimized for deployment on Vercel:

### Using the Vercel Dashboard

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Go to [vercel.com](https://vercel.com) and create a new project
3. Import your repository
4. Vercel will automatically detect the Vite configuration
5. Click "Deploy"

### Using Vercel CLI

To deploy directly from your local machine:

1. Install the Vercel CLI globally
   ```bash
   npm install -g vercel
   ```

2. Log in to your Vercel account
   ```bash
   vercel login
   ```

3. Deploy the application
   ```bash
   vercel
   ```

4. Follow the prompts. For most options, you can accept the defaults.

The application includes a `vercel.json` configuration file that handles SPA routing and asset caching automatically.