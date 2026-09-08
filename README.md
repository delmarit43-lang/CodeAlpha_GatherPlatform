# CodeAlpha_GatherPlatform — Full-Stack Social Media Platform

A production-ready, modular full-stack social media platform developed for:

**CodeAlpha Full Stack Development Internship, Task 2**

---

## 🌟 Project Overview

**Gather Platform** (`CodeAlpha_GatherPlatform`) is a modern, community-focused social network designed around genuine human connection, local communities, technology projects, and thoughtful discussions.

The system features a **Vanilla JS (ES Modules) Frontend** backed by a **Modular TypeScript, Express.js, Prisma ORM, and PostgreSQL 18 Backend**.

---

## 🛠️ Technology Stack

### Backend Architecture
- **Language & Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **ORM**: Prisma ORM v5
- **Database**: PostgreSQL 18
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` password hashing
- **Input Validation**: Zod schema validation
- **Security**: Helmet HTTP headers, CORS, Express Rate Limiting

### Frontend Architecture
- **HTML5** & **Vanilla CSS** (Custom Design Tokens, Warm Editorial Theme)
- **Vanilla JavaScript** (ES Modules, Fetch API, Optimistic UI Updates)
- **Lucide Icons**

---

## 📁 Repository Architecture

```text
CodeAlpha_GatherPlatform/
├── prisma/
│   ├── schema.prisma       # Database models (User, Post, Like, Comment, Follow, Bookmark, Notification)
│   └── seed.ts             # Automated Prisma seeding script
├── public/                 # Vanilla JS Frontend (CodeAlpha UI)
├── server/
│   └── src/
│       ├── controllers/    # Route handlers (Auth, User, Post, Comment, Bookmark, Notification)
│       ├── lib/            # Prisma Client singleton
│       ├── middleware/     # Auth & Error Handling middleware
│       ├── routes/         # Express API routes
│       ├── services/       # Core business logic layer
│       ├── types/          # Shared TypeScript interfaces
│       ├── utils/          # JWT helpers
│       ├── validators/     # Zod input validation schemas
│       ├── app.ts          # Express application setup
│       └── server.ts       # Server entry point
├── BACKEND_README.md
├── README.md
├── tsconfig.json
├── package.json
└── .env
```

---

## 🚀 Installation & Setup Instructions

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **PostgreSQL**: v14+ (Tested on PostgreSQL 18)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/YourUsername/CodeAlpha_GatherPlatform.git
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

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to PostgreSQL database
npm run prisma:push

# Seed database with initial users and social data
npm run seed
```

### 5. Build & Start the Server
```bash
# Build TypeScript
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

---

## 👤 Author Information

- **Project**: CodeAlpha Full Stack Development Internship — Task 2
- **Repository Name**: `CodeAlpha_GatherPlatform`
- **Developer**: Siddiiq Cawil (CodeAlpha Full Stack Development Intern)
