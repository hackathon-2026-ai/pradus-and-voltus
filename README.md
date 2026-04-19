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

### General
- Node.js 20+ and npm
- Python 3.12+

### If running backend locally (without Docker)
- Ollama running locally on `http://localhost:11434` with a compatible model

## Quick start

### 1) Run backend + database with Docker Compose



## How to run the backend

```bash
cd backend
pip install -r requirements.txt
fastapi run api.py --port 5000
```

Make sure `backend/.env` contains:
```
GROQ_API_KEY=your_key_here
```

> Vite proxies `/api` requests to `localhost:5000` automatically.


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


### Mobile app

UI view

<img width="946" height="2048" alt="UI_app_1" src="https://github.com/user-attachments/assets/33afa490-8e52-4838-a53d-5c776ad50325" />

<img width="946" height="2048" alt="UI_app_2" src="https://github.com/user-attachments/assets/ed84ae7c-3803-4005-a2ff-57e80a62e398" />

<img width="946" height="2048" alt="UI_app_3" src="https://github.com/user-attachments/assets/32a19a96-4184-44e3-bb46-cc6b367f871a" />


## How to run the mobile backend

```bash
cd backend
pip install -r requirements.txt
uvicorn api:app --host 0.0.0.0 --reload --port 8000
```

> Requires [Ollama](https://ollama.com/) running locally with the `gemma4:e2b` model:
> ```bash
> ollama pull gemma4:e2b
> ollama serve
> ```

## License

This project is licensed under the terms in [`LICENSE`](./LICENSE).
