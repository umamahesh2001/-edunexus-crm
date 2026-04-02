# EduNexus CRM - Frontend Architecture

Welcome to the frontend application of the **EduNexus Admissions CRM**. This client application provides institutional staff with a premium, high-performance interface for managing candidate registrations, seating allocations, verification lifecycles, and advanced data telemetry.

## 🚀 Tech Stack Highlights

- **Core:** React 19, Vite (for lighting-fast HMR and building)
- **Routing:** React Router v7 (see `src/App.jsx` for route structure)
- **Landing Page:** Custom, highly responsive entry page featuring a brand showcase, vector illustrations, and an **About Us** section.
- **State Management:** TanStack React Query (`@tanstack/react-query`) for unified server-state synchronization
- **Styling Framework:** Tailwind CSS v4 featuring fully customized, premium glassmorphism layouts
- **Data Visualization:** Recharts (Advanced custom SVG styling, Radial, Donut, and Bar charts)
- **Form Validation:** Zod (for strict client-side data schema parsing)
- **Icons:** Lucide React

## 📦 Prerequisites

- **Node.js**: v18 or newer
- **npm**: v9 or newer

## 🛠️ Installation & Setup Workflow

1. Navigate to the frontend directory:
   ```bash
   cd c:\bank\admission-crm\frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Establish Environment Variables:
   Create a `.env` file in the root of the frontend folder. Set the API base URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## ⚡ Running the Application

**Development Server (Local):**

```bash
npm run dev
```

**Development Server (Network Host):**
To access the app fully across your local network (e.g. testing on a mobile device):

```bash
npm run dev -- --host
```

**Production Build:**
To build the application for deployment into a `dist/` folder:

```bash
npm run build
```

## 📂 Project Structure Overview

```text
frontend/
├── src/
│   ├── api/          # Axios interceptors and standard configuration
│   ├── components/   # Application Shell, Sidebar, layout, shared widgets
│   ├── pages/        # Main route views (Dashboard, Allocation, Admission, etc)
│   ├── App.jsx       # Root router definitions and Auth boundaries
│   └── main.jsx      # React-DOM mount and QueryClientProvider
├── index.html        # App entry document
├── package.json      # Dependencies and scripts
├── vite.config.js    # Vite bundler configurations
└── postcss.config.js # CSS parsing pipeline
```

## Application Flow

- Landing (public) -> Login
- Authenticated App (`/app`): Dashboard (index)
- Admin-only: Master Setup (`/app/master`)
- Admin / Admission Officer: Applicants (`/app/applicants`)
- Admin / Admission Officer: Seat Allocation (`/app/allocation`)
- Admin / Admission Officer: Admission Confirmation (`/app/admission`)

Note: Routes are protected via `ProtectedRoute` in `src/components/ProtectedRoute.jsx` and role-based access is enforced at the route level.
