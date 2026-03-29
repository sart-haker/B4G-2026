# Nurser-E (Build4Good '26)

An AI-powered healthcare app that serves as a one-stop shop for patients by streamlining communication with doctors, appointment scheduling, providing a reddit-style discussions forum etc.

## Features

- **Doctor Seek** – Describe symptoms via text, photos, and video; answer smart AI-generated follow-up questions; receive a clean structured pre-appointment report and doctor suggestions.
- **Appointments** – Request appointments, view status, doctors can view pre-appointment report beforehand.
- **Post-Appointment** – Upload prescription, auto-store structured medical history, rate your doctor.
- **Community Forum** – Healthcare-focused Reddit-style community with posts, comments, and upvotes.
- **Patient Profile** – Full medical history, past appointments, viewable by doctors.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS (Vite) |
| Backend | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL + Auth + Storage) |

## Project Structure

```
B4G-2026/
├── frontend/         # React + TypeScript + Tailwind app
├── backend/          # Node.js + Express API
└── supabase/
    └── migrations/   # Database schema SQL
```

## Getting Started

### 1. Frontend

```bash
cd frontend
cp .env.example .env.local
# Fill in your Supabase URL and anon key
npm install
npm run dev
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in your Supabase URL and service role key
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3001`.

## Database Schema

See [`supabase/migrations/002_current_schema.sql`](supabase/migrations/002_current_schema.sql) for the full schema.

Key tables:
- `patients` – Supabase Auth users signed up as patients, bio, health info etc.
- `doctors` – Users signed up as doctors, bio, speciality, etc.
- `appointment_data` – Stores all appointment related data, like structured pre-appointment reports with photos/video URLs, tracks appointment lifecycle, post-appointment reports, doctor's feedback etc.
- `forum_posts` / `forum_comments` – Community forum content

