# TaskFlow — Production-Ready SaaS Project Management App

<div align="center">

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Project%20Management-6366f1?style=for-the-badge&logo=trello&logoColor=white)

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**A full-stack, production-grade SaaS Project Management platform inspired by Notion + Trello.**  
Built with real-world architecture — JWT auth, real-time collaboration, Stripe payments, role-based access, and cloud file uploads.

[Live Demo](#) · [API Docs](#api-endpoints) · [Report Bug](#) · [Request Feature](#)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Real-Time Features](#real-time-features)
- [Subscription Plans](#subscription-plans)
- [Screenshots](#screenshots)
- [Why This Project Stands Out](#why-this-project-stands-out)

---

## Overview

TaskFlow is a **production-ready SaaS application** that enables teams to manage projects, collaborate in real-time, and track tasks using Kanban boards. It features a complete authentication system with OTP email verification, JWT refresh token rotation, Google OAuth, Stripe payment integration, and WebSocket-powered live updates.

> This is not a tutorial project. Every feature is built to production standards — secure, scalable, and maintainable.

---

## Features

### Authentication & Security
- **Email + OTP Verification** — Register with email, verify via 6-digit OTP (Brevo SMTP)
- **JWT Access + Refresh Tokens** — 15-minute access tokens with 7-day refresh token rotation
- **Google OAuth 2.0** — One-click sign-in with Google
- **Forgot / Reset Password** — Secure token-based password reset via email
- **Rate Limiting** — Brute-force protection on all auth endpoints
- **Helmet + CORS** — Security headers and strict origin control

### Project Management
- Create, update, archive, and delete **Projects**
- Assign projects to **Teams** with visibility control (private / team / public)
- Project cover images uploaded to **Cloudinary**
- Cascading delete — deleting a project removes all boards, lists, and tasks

### Kanban Boards
- Multiple **Boards** per project
- Drag-and-drop **Lists** (columns) with position ordering
- **Tasks** with title, description, priority, due date, labels, checklist, assignees, attachments, and comments
- Task **move** across lists with automatic position reordering
- Archive boards and tasks without permanent deletion

### Team Collaboration
- Create **Teams** with owner, admin, member, viewer roles
- **In-app invite system** — invitations appear as notifications in the dashboard
- Accept or decline invitations directly from the Notifications page
- Remove members, update roles — full RBAC enforcement

### Real-Time (Socket.io)
- Live task creation, updates, moves, and deletions on shared boards
- Real-time **notifications** pushed instantly via WebSocket
- Typing indicators on task comments
- User presence — see who joined a board

### Notifications
- In-app notification center with unread count badge
- Mark individual or all notifications as read
- Delete individual or all notifications
- Real-time delivery via Socket.io

### Subscription & Payments (Stripe)
- **Free / Pro / Enterprise** plans
- Stripe Payment Intents — secure client-side card collection
- Payment verification on backend before activating subscription
- Full payment history stored per user
- Cancel subscription with grace period (access until billing period ends)

### File Uploads
- Avatar, project cover, task attachments — all via **Cloudinary**
- File type and size validation (10MB limit)
- Old avatar auto-deleted from Cloudinary on update

### UI / UX
- Fully responsive — mobile, tablet, desktop
- **Dark mode** with system preference detection
- Collapsible sidebar with recent projects
- Toast notifications for all actions
- Professional icons throughout (React Icons — no emojis)

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database + ODM |
| Socket.io | Real-time WebSocket communication |
| JWT (jsonwebtoken) | Access + Refresh token auth |
| bcryptjs | Password + OTP hashing |
| Stripe | Payment processing |
| Cloudinary + Multer | File storage |
| Nodemailer + Brevo | Transactional emails |
| Joi | Request validation |
| Helmet + CORS | Security middleware |
| express-rate-limit | Rate limiting |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Redux Toolkit | Global state management |
| React Router v7 | Client-side routing |
| Axios | HTTP client with interceptors |
| Socket.io Client | Real-time updates |
| Tailwind CSS | Utility-first styling |
| @dnd-kit | Drag and drop |
| React Hot Toast | Toast notifications |
| React Icons | Professional icon library |
| date-fns | Date formatting |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   ├── cloudinary.js      # Cloudinary config
│   │   │   └── stripe.js          # Stripe lazy init
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, OTP, Login, OAuth, Refresh
│   │   │   ├── userController.js       # Profile, Avatar update
│   │   │   ├── teamController.js       # Teams, Invitations, Roles
│   │   │   ├── projectController.js    # Projects CRUD
│   │   │   ├── boardController.js      # Boards CRUD
│   │   │   ├── listController.js       # Lists CRUD + reorder
│   │   │   ├── taskController.js       # Tasks CRUD + move + comments
│   │   │   ├── notificationController.js # Notifications + invite accept/reject
│   │   │   ├── subscriptionController.js # Stripe payments + plans
│   │   │   └── uploadController.js     # File upload
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT protect middleware
│   │   │   ├── rbac.js            # Role-based access control
│   │   │   ├── upload.js          # Multer + Cloudinary storage
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── models/
│   │   │   ├── User.js            # User schema + bcrypt hooks
│   │   │   ├── Team.js            # Team + member roles
│   │   │   ├── Invitation.js      # Team invitations with TTL
│   │   │   ├── Project.js         # Project schema
│   │   │   ├── Board.js           # Board schema
│   │   │   ├── List.js            # List/column schema
│   │   │   ├── Task.js            # Task + comments + checklist
│   │   │   ├── Notification.js    # In-app notifications
│   │   │   └── Subscription.js    # Stripe subscription + history
│   │   ├── routes/                # Express routers (one per resource)
│   │   ├── services/
│   │   │   ├── emailService.js    # Brevo SMTP email templates
│   │   │   └── notificationService.js # Create + emit notifications
│   │   ├── utils/
│   │   │   ├── AppError.js        # Custom operational error class
│   │   │   ├── jwt.js             # Token generation + verification
│   │   │   ├── otp.js             # OTP generate, hash, verify
│   │   │   └── response.js        # Standardized API responses
│   │   ├── validators/            # Joi validation schemas
│   │   ├── socket.js              # Socket.io event handlers
│   │   ├── app.js                 # Express app setup
│   │   └── server.js              # HTTP server + Socket.io init
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── store.js           # Redux store
    │   │   ├── storeRegistry.js   # Circular dep fix for axios
    │   │   └── slices/            # Redux slices (auth, projects, tasks, teams, notifications, boards)
    │   ├── components/
    │   │   ├── layout/            # AppLayout, Sidebar, Topbar
    │   │   ├── common/            # Avatar, Badge, Modal, Spinner, Alert, ProtectedRoute
    │   │   ├── board/             # ListColumn, TaskCard
    │   │   ├── task/              # TaskModal
    │   │   └── payment/           # PaymentMethodModal
    │   ├── pages/
    │   │   ├── LandingPage.jsx    # Marketing homepage
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx   # Multi-step: Register → OTP verify
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   ├── ProjectDetailPage.jsx
    │   │   ├── BoardPage.jsx      # Kanban board with DnD
    │   │   ├── TeamsPage.jsx
    │   │   ├── NotificationsPage.jsx
    │   │   ├── SubscriptionPage.jsx
    │   │   └── SettingsPage.jsx
    │   ├── services/
    │   │   ├── api.js             # Axios instance + auto token refresh
    │   │   ├── socket.js          # Socket.io client + event handlers
    │   │   └── authActions.js
    │   ├── hooks/                 # useAuth, useDarkMode
    │   └── utils/                 # helpers, formatters
    ├── .env.example
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Brevo account (free — for emails)
- Cloudinary account (free — for file uploads)
- Stripe account (test mode)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Brevo SMTP (https://app.brevo.com → SMTP & API)
BREVO_SENDER_EMAIL=your_verified_sender@email.com
BREVO_SMTP_LOGIN=your_brevo_smtp_login
BREVO_SMTP_PASS=your_brevo_smtp_password
BREVO_API_KEY=your_brevo_api_key

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Frontend URL
CLIENT_URL=http://localhost:3000

# OTP expiry in minutes
OTP_EXPIRES_IN=10
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ❌ |
| POST | `/send-otp` | Send OTP to email | ❌ |
| POST | `/verify-otp` | Verify OTP + get tokens | ❌ |
| POST | `/login` | Login with email + password | ❌ |
| POST | `/google-login` | Login with Google ID token | ❌ |
| POST | `/refresh-token` | Rotate access + refresh tokens | ❌ |
| POST | `/forgot-password` | Send password reset email | ❌ |
| POST | `/reset-password` | Reset password with token | ❌ |
| POST | `/logout` | Invalidate refresh token | ✅ |

### Users — `/api/users`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me` | Get current user profile | ✅ |
| PUT | `/update-profile` | Update name, password, avatar | ✅ |
| GET | `/:id` | Get user by ID | ✅ |

### Teams — `/api/teams`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create a team | ✅ |
| GET | `/my-teams` | Get all teams for current user | ✅ |
| GET | `/:teamId` | Get team by ID | ✅ |
| POST | `/invite` | Invite member (in-app notification) | ✅ |
| POST | `/accept-invite` | Accept invite via token | ✅ |
| POST | `/reject-invite` | Reject invite via token | ✅ |
| PUT | `/update-role/:teamId` | Update member role | ✅ |
| DELETE | `/remove-member/:teamId` | Remove a member | ✅ |

### Projects — `/api/projects`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create project | ✅ |
| GET | `/` | Get all user projects | ✅ |
| GET | `/:projectId` | Get project by ID | ✅ |
| PUT | `/update/:projectId` | Update project | ✅ |
| DELETE | `/delete/:projectId` | Delete project (cascades) | ✅ |

### Boards — `/api/boards`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create board | ✅ |
| GET | `/:projectId` | Get boards by project | ✅ |
| PUT | `/update/:boardId` | Update board | ✅ |
| DELETE | `/delete/:boardId` | Delete board + lists + tasks | ✅ |

### Lists — `/api/lists`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create list/column | ✅ |
| GET | `/board/:boardId` | Get lists by board | ✅ |
| PUT | `/update/:listId` | Update list | ✅ |
| DELETE | `/delete/:listId` | Delete list + tasks | ✅ |

### Tasks — `/api/tasks`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create task | ✅ |
| GET | `/:boardId` | Get tasks by board | ✅ |
| PUT | `/update/:taskId` | Update task | ✅ |
| DELETE | `/delete/:taskId` | Delete task | ✅ |
| PUT | `/move/:taskId` | Move task to another list | ✅ |
| POST | `/comment/:taskId` | Add comment + attachment | ✅ |

### Notifications — `/api/notifications`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all notifications (paginated) | ✅ |
| PUT | `/read/:id` | Mark notification as read | ✅ |
| DELETE | `/:id` | Delete single notification | ✅ |
| DELETE | `/delete/all` | Delete all notifications | ✅ |
| POST | `/:id/accept-invite` | Accept team invite from notification | ✅ |
| POST | `/:id/reject-invite` | Reject team invite from notification | ✅ |

### Subscription — `/api/subscription`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-payment-intent` | Create Stripe Payment Intent | ✅ |
| POST | `/verify-payment` | Verify payment + activate plan | ✅ |
| GET | `/status` | Get current subscription status | ✅ |
| POST | `/cancel` | Cancel subscription | ✅ |
| GET | `/history` | Get payment history | ✅ |

---

## Authentication Flow

```
Register → Send OTP → Verify OTP → Access Token (15m) + Refresh Token (7d)
                                          ↓
                              Auto-refresh via Axios interceptor
                                          ↓
                              Token expired → /refresh-token → New tokens
                                          ↓
                              Refresh expired → Logout → Login again
```

**Token Storage:** `localStorage` (accessToken + refreshToken)  
**Auto-refresh:** Axios response interceptor catches 401, queues failed requests, refreshes token, retries all queued requests automatically.

---

## Real-Time Features

All real-time events are powered by **Socket.io** with JWT authentication on the WebSocket handshake.

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:board` | Client → Server | Join a board room |
| `leave:board` | Client → Server | Leave a board room |
| `task:created` | Server → Client | New task added to board |
| `task:updated` | Server → Client | Task details changed |
| `task:deleted` | Server → Client | Task removed from board |
| `task:moved` | Server → Client | Task moved to another list |
| `task:commented` | Server → Client | New comment on task |
| `notification` | Server → Client | New in-app notification |
| `typing:start` | Client → Server | User started typing |
| `typing:stop` | Client → Server | User stopped typing |
| `user:joined` | Server → Client | User joined the board |
| `user:left` | Server → Client | User left the board |

---

## Subscription Plans

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Projects | 3 | 20 | Unlimited |
| Team Members | 5 | 50 | Unlimited |
| File Uploads | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ |
| Price | $0 | $9.99/mo | $29.99/mo |

**Payment Flow:**
1. Frontend calls `POST /api/subscription/create-payment-intent`
2. Stripe.js collects card details using `clientSecret`
3. On success, frontend calls `POST /api/subscription/verify-payment`
4. Backend verifies with Stripe API → activates subscription

---

## Why This Project Stands Out

| Aspect | What Was Done |
|--------|---------------|
| **Architecture** | Clean MVC separation — controllers, services, models, validators, middleware all decoupled |
| **Security** | JWT rotation, bcrypt hashing, Helmet headers, CORS whitelist, rate limiting, input validation |
| **Real-Time** | Socket.io with JWT auth middleware — not just basic events, full room management |
| **Error Handling** | Global error handler, custom `AppError` class, operational vs programmer errors separated |
| **Database** | Proper indexes, cascading deletes, TTL indexes on invitations, lean queries |
| **Payments** | Stripe Payment Intents (not legacy Charges), server-side verification before activation |
| **File Uploads** | Cloudinary with automatic old file cleanup, file type + size validation |
| **State Management** | Redux Toolkit with normalized state, optimistic updates, auto token refresh queue |
| **Code Quality** | No inline requires, no unused imports, consistent response format, DRY principles |

---

## Local Development Tips

```bash
# Kill port 5000 if already in use (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Run both servers simultaneously
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## License

MIT License — feel free to use this project for learning, portfolio, or as a base for your own SaaS.

---

<div align="center">

Built with passion by **Ashfaq Shaikh**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/yourusername)

⭐ **Star this repo if you found it helpful!**

</div>
