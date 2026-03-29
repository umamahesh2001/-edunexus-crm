# Admission Management & CRM System

A full-stack application for colleges to manage admissions, configure programs and quotas, allocate seats (preventing overbooking), and generate immutable admission numbers.

## Features
- **Strict Quota Validation:** Quota seats strictly aligned with total intake.
- **Race Condition Prevention:** Seat counters atomically updated to prevent overbooking.
- **Unique Admission IDs:** Sequential admission numbers generated dynamically.
- **Workflow:** Master Setup -> Applicant Registration -> Seat Allocation -> Admission Confirmation.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + React Query
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)

## Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB locally or Atlas connection URI.

### 2. Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example`
4. Run `node seed.js` to seed sample academic structure.
5. `npm run dev`

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` containing `VITE_API_URL=http://localhost:5000/api`
4. Run `npm run dev`

## Architecture Highlights
- Admission atomic allocation is handled in `backend/controllers/admission.controller.js` using Mongoose `$inc` and querying with condition on `filledSeats`.
- Admission confirmation generates an immutable number like `GLOB/2026/UG/B.TE/KCET/0001` using a sequential Counter collection.
