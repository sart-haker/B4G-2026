# Build4Good '26 - Nurser

An AI-powered patient-side healthcare web app that streamlines communication with doctors and organizes appointments.

## Features

- **Doctor Seek** – Describe symptoms via text, photos, and video; answer smart AI-generated follow-up questions; receive a clean structured pre-appointment report and doctor suggestions.
- **Appointments** – Request appointments, view status, doctor's pre-appointment report view, and "Appointment Done" workflow.
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

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration file in the Supabase SQL editor:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Create two Storage buckets in Supabase:
   - `symptom-media` (public)
   - `medical-docs` (public)

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Fill in your Supabase URL and anon key
npm install
npm run dev
```

### 3. Backend

```bash
cd backend
cp .env.example .env
# Fill in your Supabase URL and service role key
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3001`.

## Database Schema

See [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) for the full schema.

Key tables:
- `profiles` – Extends Supabase Auth users with role (patient/doctor), bio, health info
- `symptom_reports` – Stores structured pre-appointment reports with photos/video URLs
- `appointments` – Tracks appointment lifecycle (requested → confirmed → done)
- `medical_records` – Prescription data and medical history per appointment
- `doctor_ratings` – Post-appointment doctor ratings
- `forum_posts` / `forum_comments` – Community forum content

## Doctor Type Suggestion

The app uses keyword-based rule matching to suggest the most appropriate type of doctor (e.g., Cardiologist, Dermatologist, Neurologist). This is designed to be swappable with an AI/LLM backend call.

