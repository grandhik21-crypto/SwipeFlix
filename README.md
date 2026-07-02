# 🎬 SwipeFlix

A Tinder-style movie recommendation web app built with React, Node.js, and SQLite.

## Features

- 🔄 Tinder-style swipe UI (Like / Dislike / Watched)
- 🎬 Real movie data from TMDB API
- 📊 Personalized recommendations based on your swipes
- ⚡ Simple MVP - no complex algorithms
- 📱 Mobile-first responsive design

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQLite
- **API**: TMDB (The Movie Database)

## Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/))

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Add your TMDB_API_KEY to .env
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Project Structure

```
swipeflix/
├── server/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # TMDB API integration
│   │   ├── db.js            # Database setup
│   │   └── index.js         # Server entry
│   └── package.json
└── client/
    ├── src/
    │   ├── components/      # React components
    │   ├── hooks/           # Custom hooks
    │   ├── pages/           # Page components
    │   └── App.jsx          # Main app
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login/signup with username

### Swipes
- `POST /api/swipes` - Record a swipe
- `GET /api/swipes/:userId` - Get user's swipe history

### Recommendations
- `GET /api/recommendations/:userId` - Get personalized recommendations

## Getting Started

1. Get a free TMDB API key from [themoviedb.org](https://www.themoviedb.org/)
2. Clone and setup both server and client
3. Start the server: `npm run dev` (in `/server`)
4. Start the frontend: `npm run dev` (in `/client`)
5. Open `http://localhost:3000` and start swiping!

## Next Steps

- Add actual movie data display in liked movies
- Improve recommendation algorithm
- Add watch history
- Deploy to Heroku/Vercel

## License

MIT
