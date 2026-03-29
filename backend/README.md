# EduNexus CRM - Backend Micro-Services & API Server

Welcome to the backend infrastructure of the **EduNexus Admissions CRM**. This powerful API server is responsible for unified telemetry, relational data constraints, strict validations, and real-time transaction processing for seat allocations and payments.

## 🚀 Tech Stack Highlights
* **Core Runtime:** Node.js + Express
* **Database Driver:** Mongoose (MongoDB ORM) for schematized data models and rapid aggregations
* **Security & Auth:** JWT (JSON Web Tokens) with robust RBAC controls (Coming Soon)
* **Configuration:** Dotenv & Dotenvx
* **CORS:** Cross-Origin Resource Sharing enabled for frontend interconnectivity
* **Pagination & Search:** Server-side custom aggregation pipelines for large data tables

## 📦 Prerequisites
* **Node.js**: v18 or newer (LTS recommended)
* **MongoDB**: A running local or containerized MongoDB instance (e.g. `mongodb://127.0.0.1:27017/admissions_db`)
* **npm**: v9 or newer

## 🛠️ Installation & Setup Workflow
1. Navigate to the backend directory:
   ```bash
   cd c:\bank\admission-crm\backend
   ```
2. Install necessary node modules:
   ```bash
   npm install
   ```
3. Establish Environment Variables:
   Create a `.env` file in the root of the backend folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/admissions_db
   JWT_SECRET=your_super_secret_key_here
   ```

## ⚡ Running the API Server
**Development Environment (with file watch):**
We recommend using standard Node or nodemon for active development:
```bash
node server.js
# Or if installed globally:
nodemon server.js
```

**Production Environment:**
Ensure environment variables are injected natively. For stability, use PM2:
```bash
pm2 start server.js --name edunexus-api
```

## 📂 Project Structure Overview
```text
backend/
├── controllers/    # Request handling, data aggregation, and business logic
│   ├── admission.controller.js
│   ├── allocation.controller.js
│   ├── dashboard.controller.js
│   └── master.controller.js
├── models/         # Mongoose schema definitions and validation logic
│   ├── Applicant.js
│   ├── Admission.js
│   ├── Quota.js
│   └── ...
├── routes/         # Express endpoint definitions mapped to controllers
├── config/         # Database and third-party configuration wrappers
├── middleware/     # Auth, error handling, and request validation checks
├── server.js       # App initialization, mounting middleware and routers
└── package.json    # Backend dependencies
```
