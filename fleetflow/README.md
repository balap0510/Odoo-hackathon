# FleetFlow - Modular Fleet & Logistics Management System

FleetFlow is a production-ready, scalable web platform that digitizes fleet and logistics operations, moving beyond manual logbooks into an intelligent rule-based backend.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, ShadCN, Zustand
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Docker, docker-compose ready

## Core System Modules
1. **Authentication & RBAC**: Role-based access for Fleet Managers, Dispatchers, and Analytics.
2. **Command Center**: Real-time KPI reporting.
3. **Vehicle Registry**: Complete CRUD with constraint validations.
4. **Driver Management**: Driver tracking and safety scoring.
5. **Trip Dispatcher**: Full lifecycle tracking of trips ensuring fleet compatibility.
6. **Maintenance & Logs**: Detailed service and expense tracking.
7. **Fuel & Cost Tracking**: Refuel expense tracking.
8. **Financial Analytics**: PDF & CSV export engine alongside live KPI calculations.

## Local Setup

**Environment Configurations:**

You will need two `.env` files.

1. `server/.env`
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fleetflow"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-key"
PORT=5000
```

2. `client/.env`
```env
VITE_API_URL="http://localhost:5000/api/v1"
```

**Running Locally:**

1. Install dependencies for server and run migrations:
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

2. Install dependencies for frontend and run dev server:
```bash
cd client
npm install
npm run dev
```

## Docker Environment
You can spin up the entire application using Docker Compose. Make sure your Docker daemon is running.

```bash
cd docker
docker-compose up --build
```
This will start:
- PostgreSQL on port 5432
- Node Backend on port 5000
- NGINX serving React Frontend on port 80

## API Documentation
The API adheres strictly to REST principles, available under `/api/v1/`. Includes robust input validation and rate-limiting to prevent brute force dispatch.
