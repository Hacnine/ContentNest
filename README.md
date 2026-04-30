# ContentNest

A headless CMS and blog platform built with a microservices architecture.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript (microservices)
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: MongoDB (per-service)
- **Cache**: Redis
- **Auth**: JWT + Google OAuth (Passport.js)
- **Storage**: Cloudinary / AWS S3
- **Orchestration**: Docker Compose

## Architecture

| Service | Port | Description |
|---|---|---|
| api-gateway | 3000 | Single entry point, JWT auth, rate limiting |
| auth-service | 3001 | Register, login, refresh tokens, Google OAuth |
| content-service | 3002 | Posts CRUD, categories, tags, scheduling |
| media-service | 3003 | File uploads (Cloudinary / S3) |
| search-service | 3004 | Full-text search + autocomplete |
| analytics-service | 3005 | Page view tracking + dashboard stats |
| scheduler-service | 3006 | Cron job for auto-publishing scheduled posts |
| frontend | 3010 | Next.js public blog + admin panel |

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+

### Setup

```bash
# Clone the repo
git clone https://github.com/Hacnine/ContentNest.git
cd ContentNest

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker-compose up --build
```

### Development (without Docker)

```bash
npm install           # install all workspace dependencies
npm run dev:frontend  # start Next.js frontend on :3010
```

## Project Structure

```
ContentNest/
├── packages/
│   └── shared/          # Shared TypeScript types & utilities
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── content-service/
│   ├── media-service/
│   ├── search-service/
│   ├── analytics-service/
│   └── scheduler-service/
├── frontend/            # Next.js 14 App Router
├── docker-compose.yml
└── .env.example
```

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## License

MIT
