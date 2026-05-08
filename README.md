# 🚀 ProjectPilot: Advanced Team Task Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748)](https://www.prisma.io/)

**ProjectPilot** is a robust, full-stack task management ecosystem designed for high-performance teams. It provides a seamless interface for project coordination, task tracking, and team collaboration, backed by a resilient, production-ready backend architecture.

---

## 🏗️ System Architecture

ProjectPilot follows a decoupled **Client-Server Architecture** optimized for scalability and rapid deployment.

### 1. Frontend (The Command Center)
Built with **React 18** and **Vite**, the frontend is a high-speed Single Page Application (SPA).
- **State Management**: React Hooks & Context API.
- **Styling**: Atomic CSS via **Tailwind CSS** for a premium, responsive UI.
- **Data Visualization**: Real-time analytics using **Recharts**.
- **Forms & Validation**: Controlled inputs with **React Hook Form** and **Zod** schema validation.

### 2. Backend (The Engine Room)
A sophisticated **Express.js** server implementing a **Deferred Loading Pattern**.
- **Resilient Startup**: Initializes a minimal health-check server immediately to satisfy cloud provider (e.g., Railway) health checks, then asynchronously loads heavy middleware and database connections.
- **API Layer**: RESTful endpoints with centralized error handling and JWT-based security.
- **ORM Layer**: **Prisma** ensures type-safe database interactions and automated migrations.

### 3. Data Layer (The Vault)
- **Database**: **PostgreSQL** for relational data integrity.
- **Schema**: Highly normalized relational model (Users, Projects, Tasks, ProjectMembers).

---

## ✨ Key Features

- 🔐 **Secure Authentication**: JWT-based login/signup with bcrypt password hashing.
- 📊 **Dynamic Dashboard**: Visual overview of task statuses and project progress.
- 📂 **Project Lifecycle**: Full CRUD operations for projects with creator-based permissions.
- 📝 **Granular Task Management**: Assign tasks, set priorities (Low/Medium/High), and track deadlines.
- 👥 **Team Collaboration**: Add/remove members to specific projects with role-based visibility.
- 🛡️ **Production Ready**: Integrated Security (Helmet, CORS), structured logging (Morgan), and graceful shutdown handlers.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Lucide React, Axios, React Router |
| **Backend** | Node.js, Express, Prisma ORM, JWT, Zod, Morgan |
| **Database** | PostgreSQL |
| **DevOps** | Railway-optimized Startup, Environment-based Config |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Instance
- npm or yarn

### 1. Repository Setup
```bash
git clone https://github.com/your-username/Team_Task_Manager.git
cd Team_Task_Manager
```

### 2. Backend Configuration
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET
```

#### Database Initialization
```bash
npx prisma generate
npx prisma db push
```

#### Start Backend
```bash
# Development (with watch mode)
npm run dev

# Production
npm start
```

### 3. Frontend Configuration
```bash
cd ../frontend
npm install

# Start development server
npm run dev
```

---

## 📂 Project Structure

```text
Team_Task_Manager/
├── backend/                # Express Server
│   ├── config/             # DB & App configurations
│   ├── controllers/        # Request handlers (Logic)
│   ├── middleware/         # Auth, Error handling, Logging
│   ├── prisma/             # Schema & Migrations
│   ├── routes/             # API Endpoints
│   ├── utils/              # Helper functions
│   ├── app.js              # Express app definition
│   └── server.js           # Entry point (Lifecycle management)
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # View components
│   │   └── utils/          # API & Helper utils
│   └── vite.config.js      # Vite configuration
└── README.md
```

---

## 🛡️ Security & Performance
- **Helmet**: Secures Express apps by setting various HTTP headers.
- **CORS**: Configured for restricted origin access.
- **Zod**: Runtime type checking for API requests.
- **Deferred Loading**: Guarantees high availability during cold starts.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
