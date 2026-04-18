# pradus-and-voltus

## Run locally

### Backend (Flask API)

```powershell
cd backend
C:/Python314/python.exe -m flask --app wsgi:app run --host 127.0.0.1 --port 5000
```

Available endpoints:

- `GET /api/health`
- `GET /api/chat/voltus?message=...`
- `GET /api/chat/pradus?message=...`

### Frontend (Vite)

```powershell
cd frontend-web
npm start
```

The frontend proxies `/api` requests to `http://localhost:5000` in development.