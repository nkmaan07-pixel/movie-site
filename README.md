# Top 100 Hollywood Movies — Premium (Vite + React + Tailwind)

## Features
- Full Top 100 static dataset
- Premium responsive UI with posters
- TMDb integration for poster images and extra details
- Ready for Vercel / Netlify deployment

## Setup (local)
1. Install: `npm install`
2. Add your TMDb API key to a `.env` file at project root:
   `VITE_TMDB_API_KEY=your_tmdb_api_key_here`
3. Start dev server: `npm run dev`

## Deployment (Vercel)
1. Push to GitHub or upload the project folder directly in Vercel.
2. Set environment variable `VITE_TMDB_API_KEY` in Vercel dashboard (Project → Settings → Environment Variables).
3. Deploy (Vercel will run `npm install` and `npm run build` automatically).

Note: If you don't set the API key, the app will still work but posters won't load from TMDb.
