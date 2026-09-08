# GatherPlatform Backend Architecture & API Documentation

Production-ready, modular TypeScript backend built for **GatherPlatform** (CodeAlpha Full Stack Development Internship - Task 2).

---

## 🛠 Tech Stack

- **Runtime & Language**: Node.js & TypeScript
- **Framework**: Express.js
- **ORM & Database**: Prisma ORM with PostgreSQL 18
- **Authentication**: JWT (JSON Web Tokens) & bcrypt password hashing
- **Validation**: Zod schema validation
- **Security**: Helmet headers, CORS, Express Rate Limiting

---

## 📁 Directory Structure

```
GatherPlatform/
├── prisma/
│   ├── schema.prisma       # Database models (User, Post, Like, Comment, Follow, Bookmark, Notification)
│   └── seed.ts             # Automated database seeding script
├── public/                 # Vanilla JS Frontend (CodeAlpha UI)
├── server/
│   └── src/
│       ├── config/         # System configurations
│       ├── controllers/    # Route handler logic (Auth, User, Post, Comment, Bookmark, Notification)
│       ├── lib/            # Prisma Client singleton instance
│       ├── middleware/     # Auth & Centralized error handling
│       ├── routes/         # Express router endpoints
│       ├── services/       # Core business logic layer
│       ├── types/          # Shared TypeScript interface declarations
│       ├── utils/          # JWT helpers
│       ├── validators/     # Zod input validation schemas
│       ├── app.ts          # Express application setup
│       └── server.ts       # Server entry point
├── package.json
├── tsconfig.json
└── .env
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **PostgreSQL**: v14+ (Verified on PostgreSQL 18)

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gather_db?schema=public"
JWT_SECRET="gather_jwt_secret_key_super_secure_2026_codealpha"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5000"
NODE_ENV="development"
```

### 3. Database Migration & Seeding
```bash
# Push schema to PostgreSQL database
npm run prisma:push

# Seed database with sample data
npm run seed
```

### 4. Running the Application
```bash
# Build TypeScript code
npm run build

# Start production server
npm run start

# Development mode with hot-reloading
npm run dev
```

---

## 🔑 Default Credentials (Seeded Data)

| Role | Username | Email | Password |
|------|----------|-------|----------|
| User | `siddiiq` | `siddiiq@gather.com` | `password123` |
| User | `ahmedy` | `ahmed@gather.com` | `password123` |
| User | `ayaan_m` | `ayaan@gather.com` | `password123` |
| User | `maryan_a` | `maryan@gather.com` | `password123` |

---

## 🌐 API Endpoint Summary

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate user & return JWT token
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Retrieve current authenticated user profile (Protected)

### 👤 User Management (`/api/users`)
- `GET /api/users/search?q=:query` - Search users by name or username (Protected)
- `GET /api/users/:username` - Get detailed user profile & social counts
- `GET /api/users/:username/posts?tab=posts|likes` - Get posts created or liked by user
- `PATCH /api/users/profile` - Update profile bio, location, avatar (Protected)
- `POST /api/users/:userId/follow` - Follow a user (Protected)
- `DELETE /api/users/:userId/follow` - Unfollow a user (Protected)

### 📝 Posts & Feed (`/api/posts`)
- `GET /api/posts/feed` - Get global social feed with like & comment counts
- `GET /api/posts/:id` - Get single post by ID with author details
- `POST /api/posts` - Create new post (Protected)
- `DELETE /api/posts/:id` - Delete owned post (Protected)
- `POST /api/posts/:id/like` - Like a post (Protected)
- `DELETE /api/posts/:id/like` - Unlike a post (Protected)
- `GET /api/posts/:id/comments` - Get comments for a post
- `POST /api/posts/:id/comments` - Add comment to post (Protected)

### 🔖 Bookmarks (`/api/bookmarks`)
- `GET /api/bookmarks` - Get saved posts for authenticated user (Protected)
- `POST /api/bookmarks/:postId` - Bookmark a post (Protected)
- `DELETE /api/bookmarks/:postId` - Remove post bookmark (Protected)

### 🔔 Notifications (`/api/notifications`)
- `GET /api/notifications` - Get user notifications (Protected)
- `PATCH /api/notifications/read-all` - Mark all notifications as read (Protected)
- `PATCH /api/notifications/:id/read` - Mark single notification as read (Protected)
