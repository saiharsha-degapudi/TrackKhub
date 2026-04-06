# TracKorbit v1.0

A full-stack project management tool converted from a single HTML file into a FastAPI + React/Vite application.

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

The Vite dev server proxies `/api` requests to `http://localhost:8000`, so both services must be running.

## Demo Login

- Email: `alex@trackorbit.io`
- Password: `password`

## Features

- Projects with Kanban board, Backlog, Roadmap, and Reports tabs
- Hierarchical tickets: Feature → Initiative → Epic → Story → Task → Sub-task
- Global Roadmap with zoom levels (week/month/quarter/year)
- Dashboards with 8 report types and custom saved filters
- All Tickets view with search and multi-filter
- Web Connectors management
- Settings: Users, Roles & Groups, Permissions, Custom Fields, Workflows, Screens, App Settings
- Notifications bell with unread count
