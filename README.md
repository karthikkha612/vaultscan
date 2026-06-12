# VaultScan

A lightweight vulnerability scanner dashboard for hackathons and security assessments. Enter any website URL or GitHub repository link and receive a detailed security risk report with actionable recommendations.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- **URL Security Scanning** — Checks HTTP security headers (CSP, HSTS, X-Frame-Options, etc.) and tests for reflected XSS
- **GitHub Repository Scanning** — Detects exposed secrets and known vulnerable dependencies
- **Risk Scoring Engine** — Calculates an overall security score (0–100) with risk level classification
- **Scan History** — Stores past scans in browser localStorage for quick review
- **Responsive Bento UI** — Modern dark-themed dashboard optimized for mobile and desktop
- **Real-time Loading Animations** — Smooth scanning progress feedback

## Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Frontend | Next.js 14 (App Router) |
| Styling  | Tailwind CSS            |
| Backend  | Python FastAPI          |
| Storage  | Browser localStorage    |

## Project Structure

```
vaultscan/
├── frontend/          # Next.js application
├── backend/           # FastAPI server
├── .env.example       # Environment variable template
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Copy the environment file and configure:

```bash
cp ../.env.example ../.env
```

Edit `.env` and optionally set `GITHUB_TOKEN` for higher GitHub API rate limits.

### Frontend Setup

```bash
cd frontend
npm install
```

Create a local env file:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

## Environment Variables

| Variable              | Description                          | Required |
| --------------------- | ------------------------------------ | -------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL                 | Yes      |
| `GITHUB_TOKEN`        | GitHub personal access token         | No       |

## Running Locally

Start the backend (port 8000):

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend (port 3000):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Frontend — Vercel

1. Push the repository to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Set the root directory to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
5. Deploy

### Backend — Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `GITHUB_TOKEN` (optional)

## Screenshots

<!-- Add screenshots here after deployment -->
| Home | Results | History |
| ---- | ------- | ------- |
| _Screenshot placeholder_ | _Screenshot placeholder_ | _Screenshot placeholder_ |

## API Endpoints

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| GET    | `/api/health`      | Health check             |
| POST   | `/api/scan/url`    | Scan a website URL       |
| POST   | `/api/scan/github` | Scan a GitHub repository |

## License

MIT
