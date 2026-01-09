# ⚙️ Setup & Installation Guide

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Git

---

## Backend Setup

```bash
git clone <repo-url>
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_api_key
```

Start server:
```bash
npm start
```

---

## Frontend Setup

```bash
cd frontend
# serve index.html using any static server
```

Or open directly in browser (for demo).

---

## Deployment

### Backend
- Render / Railway / Fly.io
- Set environment variables in dashboard

### Frontend
- Netlify / Vercel / GitHub Pages

---

## Common Issues
- Map not loading → check internet & tile access
- News not loading → RSS proxy limits
- Auth issues → verify JWT_SECRET

---

## Recommended Enhancements
- Enable HTTPS
- Add rate limiting
- Enable logging (Winston)

