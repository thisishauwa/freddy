# Deploying to Vercel

## Prerequisites

- A Vercel account
- A Google Gemini API key

## Deployment Steps

1. **Install Vercel CLI** (optional, for CLI deployment):

   ```bash
   npm install -g vercel
   ```

2. **Set up environment variable**:

   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `VITE_API_KEY` with your Gemini API key value
   - Make sure it's available for Production, Preview, and Development

3. **Deploy via Vercel Dashboard**:

   - Push your code to GitHub/GitLab/Bitbucket
   - Import the repository in Vercel
   - Vercel will auto-detect the Vite framework
   - Click "Deploy"

4. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project

## Local Development

1. Create a `.env.local` file:

   ```
   VITE_API_KEY=your_gemini_api_key_here
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Important Notes

- Never commit `.env.local` to version control
- The app uses localStorage for data persistence
- Make sure to set the `VITE_API_KEY` environment variable in Vercel
