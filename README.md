# EduNexus | Admission Management & CRM System

A full-stack, comprehensive web application designed for institutions to flawlessly manage admissions, configure nested academic hierarchies (Master Setup), allocate seats securely (preventing overbooking), and generate immutable sequential admission IDs.

## Enterprise Features
- **Premium User Experience:** A custom, fully responsive Landing page and an immersive Glassmorphic CRM UI powered by TailwindCSS v4.
- **Advanced Analytics Dashboard:** Real-time telemetry utilizing `Recharts` for interactive Category, Quota, Document, and Financial graphs.
- **Strict Quota Validation:** Seats strictly aligned with total intake capacities across dynamically configured parameters.
- **Race Condition Prevention:** Atomic seat counters updated algorithmically to guarantee zero overbooking during high-traffic allocations.
- **Unique Admission IDs:** Sequential, securely locked admission numbers generated dynamically.
- **Integrated Workflow:** Master Setup -> Applicant Registration -> Document Checking -> Seat Allocation -> Fee Confirmation.

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS v4 + React Query + Recharts
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
