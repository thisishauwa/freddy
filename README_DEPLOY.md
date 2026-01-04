# Freddy Financial - Deployment Guide

## Quick Deploy to Vercel

### 1. Create GitHub Repository

```bash
# Repository is already initialized locally
# Now create a new repo on GitHub and push:

git remote add origin https://github.com/YOUR_USERNAME/freddy-financial.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite
5. **Add Environment Variable**:
   - Name: `VITE_API_KEY`
   - Value: Your Google Gemini API key
6. Click "Deploy"

That's it! Your app will be live in ~2 minutes.

## Features

✅ **Multi-Transaction Logging** - Log multiple expenses in one message
✅ **Auto Budget Creation** - Budgets are created automatically when needed
✅ **Smart Categorization** - AI maps vendors to appropriate categories
✅ **Transaction Management** - Delete transactions and budgets
✅ **Budget Renaming** - Edit category names anytime
✅ **Local Storage** - All data persists locally
✅ **Responsive Design** - Works on mobile and desktop
✅ **Onboarding** - One-time setup, then straight to dashboard

## Example Usage

**Multi-transaction logging:**

```
"I spent 4500 on tangerine, 2k on chocolate, 5k on my sister"
```

This will log:

- 4500 to Food (tangerine)
- 2000 to Food (chocolate)
- 5000 to Personal/Family (my sister)

## Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS
- Google Gemini AI
- Recharts
- Lucide Icons

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local`:

```
VITE_API_KEY=your_gemini_api_key_here
```
