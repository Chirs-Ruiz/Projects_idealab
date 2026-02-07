# Idealab Print MVP

Production-focused MVP for a self-printing kiosk.

## Structure
- `web/` Next.js mobile web app.
- `backend/` NestJS API with Postgres + Redis connections.
- `kiosk/` Electron kiosk app.

## Quick start

### Backend (NestJS)
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

### Web
```bash
cd web
npm install
NEXT_PUBLIC_API_URL=http://localhost:4000 npm run dev
```

### Kiosk
```bash
cd kiosk
npm install
API_URL=http://localhost:4000 KIOSK_ID=kiosk-1 npm start
```
