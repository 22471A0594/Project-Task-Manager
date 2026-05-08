# Project-Task-Manager

A full-stack Team Task Manager application built with React + Vite (frontend) and Node.js + Express + Prisma + PostgreSQL (backend).

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT (JSON Web Tokens)

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Update with your database credentials
npx prisma migrate dev
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- User authentication (signup/login)
- Project management (CRUD)
- Task management with status tracking
- Team member management
- Dashboard with statistics
