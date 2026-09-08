# CodeAlpha_GatherPlatform — Full-Stack Social Media Platform

### 📋 Internship Metadata & Student Details
- **Name**: Siddiiq Cawil Cabdilaahi
- **Internship ID**: CA/DF1/259789
- **Program**: Full Stack Development Internship
- **Organization**: CodeAlpha
- **Task**: Task 2
- **Project**: Gather Platform
- **Duration**: September 1, 2026 to September 30, 2026
- **Repository**: CodeAlpha_GatherPlatform

---

## 🌟 Project Overview

**Gather Platform** (`CodeAlpha_GatherPlatform`) is a modern, community-focused social network designed around genuine human connection, local communities, technology projects, and thoughtful discussions.

The system is organized into a clean **Separated Modular Architecture**:
- 🎨 **`frontend/`**: Vanilla JS (ES Modules) single-page components, CSS design tokens, HTML pages.
- ⚡ **`backend/`**: Modular TypeScript, Express.js REST API, Prisma ORM, and PostgreSQL 18.

---

## 🛠️ Technology Stack

### 🔹 Backend (`/backend`)
- **Language & Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **ORM**: Prisma ORM v5
- **Database**: PostgreSQL 18
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` password hashing
- **Input Validation**: Zod schema validation
- **Security**: Helmet HTTP headers, CORS, Express Rate Limiting

### 🔹 Frontend (`/frontend`)
- **HTML5** & **Vanilla CSS** (Custom Design Tokens, Warm Editorial Theme)
- **Vanilla JavaScript** (ES Modules, Fetch API, Optimistic UI Updates)
- **Lucide Icons**

---

## 📁 Repository Directory Structure

```text
CodeAlpha_GatherPlatform/
├── frontend/               # Vanilla JS Frontend UI
│   ├── index.html
│   ├── home.html
│   ├── login.html
│   ├── register.html
│   ├── explore.html
│   ├── profile.html
│   ├── notifications.html
│   ├── bookmarks.html
│   ├── settings.html
│   ├── post.html
│   └── src/
│       ├── css/            # Custom CSS styling modules
│       └── js/             # JS Components, Pages, and API utilities
├── backend/                # TypeScript Express & Prisma Backend
│   ├── prisma/             # Schema definitions and seed scripts
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/         # System configurations
│       ├── controllers/    # Route Controllers
│       ├── lib/            # Prisma Singleton Client
│       ├── middleware/     # Auth & Error Handler Middleware
│       ├── routes/         # Express API Router
│       ├── services/       # Core Business Logic Layer
│       ├── types/          # TypeScript Interfaces
│       ├── utils/          # JWT utilities
│       ├── validators/     # Zod Validation Schemas
│       ├── app.ts          # Express app configuration
│       └── server.ts       # Server entry point
├── BACKEND_README.md       # Full API Documentation & DB Setup
├── tsconfig.json           # Root TypeScript configuration
├── package.json            # Project dependencies & npm scripts
├── .gitignore              # Ignored files (.env, node_modules, dist)
└── README.md               # Main project documentation
```

---

## 🚀 Installation & Setup Instructions

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **PostgreSQL**: v14+ (Tested on PostgreSQL 18)

### 2. Clone & Install Dependencies
```bash
git clone git@github.com:delmarit43-lang/CodeAlpha_GatherPlatform.git
cd CodeAlpha_GatherPlatform
npm install
```

### 3. Environment Setup (`.env`)
Create a `.env` file in the root folder:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gather_db?schema=public"
JWT_SECRET="gather_jwt_secret_key_super_secure_2026_codealpha"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5000"
NODE_ENV="development"
```

> 🔒 **Security Note**: `.env` is explicitly included in `.gitignore` and is **never** tracked or committed to GitHub.

### 4. Database Push & Seeding
```bash
# Push Prisma schema to PostgreSQL database
npm run prisma:push

# Seed database with initial users and social data
npm run seed
```

### 5. Build & Start Server
```bash
# Build TypeScript backend
npm run build

# Start production server
npm run start
```

Access the application in your browser at:  
👉 **`http://localhost:5000/home.html`**

---

## 👤 Default Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| User | `siddiiq@gather.com` | `password123` |
| User | `ahmed@gather.com` | `password123` |
| User | `ayaan@gather.com` | `password123` |
| User | `maryan@gather.com` | `password123` |
