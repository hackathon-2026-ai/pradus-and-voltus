# Pradus & Voltus

UI view

AI-powered hackathon project for interactive energy insights:
- **Prąduś**: consumer-facing assistant
- **Voltuś**: analyst/copilot assistant

<img width="1914" height="960" alt="UI_web_1" src="https://github.com/user-attachments/assets/e215969c-ba76-4321-9217-9d82877ea761" />

<img width="1920" height="953" alt="UI_web_2" src="https://github.com/user-attachments/assets/fc539006-fde1-4501-94c8-534bfe7392ba" />

<img width="1920" height="957" alt="UI_web_3" src="https://github.com/user-attachments/assets/18e7e1af-6c30-4b2c-9795-7f90629b98eb" />



The repository contains a Flask backend, a React web app, and an Expo mobile app.

## Project structure

```text
.
├── backend/                 # Flask API + AI orchestration + DB models
├── frontend-web/            # React + Vite web dashboard (Leaflet map)
├── frontend-mobile/mobile/  # Expo React Native mobile app
├── Demo-Dataset/            # Demo input data for AI flows
└── compose.yaml             # Backend + Postgres via Docker Compose
```

## Core features

- Interactive Poland energy map (provinces/counties/facilities)
- AI chat flows for Prąduś and Voltuś
- Demo datasets for market prices, production, and mock behavior
- Web and mobile frontends sharing similar domain concepts

## Tech stack

- **Backend:** Python, Flask, Flask-SQLAlchemy, Gunicorn
- **Web:** React, TypeScript, Vite, Leaflet
- **Mobile:** React Native (Expo), TypeScript
- **Data/infra:** PostgreSQL, Docker Compose
- **AI integrations:** Ollama (default backend flow), optional Groq helper module

## Prerequisites

Choose either Docker-based backend or local backend setup.

### General
- Node.js 20+ and npm
- Python 3.12+

### If running backend locally (without Docker)
- PostgreSQL (or adjust `DATABASE_URL`)
- Ollama running locally on `http://localhost:11434` with a compatible model

## Quick start

### 1) Run backend + database with Docker Compose

```bash
cd /home/runner/work/pradus-and-voltus/pradus-and-voltus
cp backend/.env.example backend/.env
docker compose up --build
```

Backend will be available at `http://localhost:5000`.

### 2) Run web frontend

```bash
cd /home/runner/work/pradus-and-voltus/pradus-and-voltus/frontend-web
npm ci
npm start
```

Web app runs on Vite dev server and proxies `/api` to `http://localhost:5000`.

### 3) Run mobile app (optional)

```bash
cd /home/runner/work/pradus-and-voltus/pradus-and-voltus/frontend-mobile/mobile
npm ci
npm start
```

Then open with Expo Go / emulator.

## Local backend (without Docker)

```bash
cd /home/runner/work/pradus-and-voltus/pradus-and-voltus/backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m flask --app wsgi:app run --host 127.0.0.1 --port 5000
```

## Environment variables (backend)

Current `backend/.env.example` values:

- `FLASK_DEBUG=1`
- `DATABASE_URL=postgresql://user:password@db:5432/app_db`
- `SECRET_KEY=change-me`

> If you use Groq-related scripts, also set `GROQ_API_KEY`.
>
> For the default Docker Compose Postgres setup, use:
> `DATABASE_URL=postgresql://postgres:postgres@db:5432/app_db`

## API overview

- `GET /api/health` — health check
- `GET|POST /api/chat/pradus` — Prąduś assistant
- `GET|POST /api/chat/voltus` — Voltuś assistant
- `GET /api/users` — seeded users (requires DB)

Example:

```bash
curl "http://localhost:5000/api/chat/pradus?message=When%20should%20I%20charge%20my%20EV%3F"
```

## Useful commands

### Web app

```bash
cd /home/runner/work/pradus-and-voltus/pradus-and-voltus/frontend-web
npm run lint
npm run build
```

### Mobile app

UI view

<img width="946" height="2048" alt="UI_app_1" src="https://github.com/user-attachments/assets/33afa490-8e52-4838-a53d-5c776ad50325" />

<img width="946" height="2048" alt="UI_app_2" src="https://github.com/user-attachments/assets/ed84ae7c-3803-4005-a2ff-57e80a62e398" />

<img width="946" height="2048" alt="UI_app_3" src="https://github.com/user-attachments/assets/32a19a96-4184-44e3-bb46-cc6b367f871a" />


```bash
cd /home/runner/work/pradus-and-voltus/pradus-and-voltus/frontend-mobile/mobile
npm run android
npm run ios
npm run web
```

## Demo data

The AI flows read sample files from `Demo-Dataset/`, including:
- RCE Excel data
- ENTSO-E production CSV
- mock behavior/OZE datasets under `Demo-Dataset/Mock_Data`

## License

This project is licensed under the terms in [`LICENSE`](./LICENSE).
