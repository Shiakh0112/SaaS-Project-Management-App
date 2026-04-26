# SaaS Project Management Backend

Production-ready backend for a SaaS Project Management Application (Notion + Trello inspired).

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT + Google OAuth
- **Real-time**: Socket.io
- **File Upload**: Cloudinary + Multer
- **Payment**: Razorpay
- **Email**: Nodemailer
- **Security**: Helmet, Rate Limiting, CORS

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Database, Cloudinary, Razorpay configs
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth, RBAC, Error handler, Upload
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Email, Notification services
│   ├── utils/            # JWT, OTP, Response helpers
│   ├── validators/       # Joi validation schemas
│   ├── app.js            # Express app setup
│   ├── server.js         # Server entry point
│   └── socket.js         # Socket.io handlers
├── .env.example          # Environment variables template
├── .gitignore
└── package.json
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

Fill in all required environment variables:

- **MongoDB**: Get connection string from MongoDB Atlas
- **JWT Secrets**: Generate random secure strings
- **Email (Gmail)**: Enable 2FA and create App Password
- **Google OAuth**: Get credentials from Google Cloud Console
- **Cloudinary**: Sign up at cloudinary.com
- **Razorpay**: Get keys from razorpay.com dashboard

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 4. Run Production Server

```bash
npm start
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| POST   | `/register`           | Register new user          |
| POST   | `/send-otp`           | Send OTP to email          |
| POST   | `/verify-otp`         | Verify OTP & activate      |
| POST   | `/login`              | Login with email/password  |
| POST   | `/google-login`       | Login with Google          |
| POST   | `/refresh-token`      | Refresh access token       |
| POST   | `/forgot-password`    | Request password reset     |
| POST   | `/reset-password`     | Reset password with token  |
| POST   | `/logout`             | Logout user                |

### User Routes (`/api/users`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | `/me`                 | Get current user           |
| PUT    | `/update-profile`     | Update profile & avatar    |
| GET    | `/:id`                | Get user by ID             |

### Team Routes (`/api/teams`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| POST   | `/create`             | Create new team            |
| GET    | `/my-teams`           | Get user's teams           |
| GET    | `/:teamId`            | Get team details           |
| POST   | `/invite`             | Invite member to team      |
| POST   | `/accept-invite`      | Accept team invitation     |
| POST   | `/reject-invite`      | Reject team invitation     |
| PUT    | `/update-role`        | Update member role         |
| DELETE | `/remove-member`      | Remove team member         |

### Project Routes (`/api/projects`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| POST   | `/create`             | Create new project         |
| GET    | `/`                   | Get all user projects      |
| GET    | `/:id`                | Get project by ID          |
| PUT    | `/update/:id`         | Update project             |
| DELETE | `/delete/:id`         | Delete project             |

### Board Routes (`/api/boards`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| POST   | `/create`             | Create new board           |
| GET    | `/:projectId`         | Get boards by project      |
| PUT    | `/update/:id`         | Update board               |
| DELETE | `/delete/:id`         | Delete board               |

### List Routes (`/api/lists`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| POST   | `/create`             | Create new list            |
| PUT    | `/update/:id`         | Update list                |
| DELETE | `/delete/:id`         | Delete list                |

### Task Routes (`/api/tasks`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| POST   | `/create`             | Create new task            |
| GET    | `/:boardId`           | Get tasks by board         |
| PUT    | `/update/:id`         | Update task                |
| DELETE | `/delete/:id`         | Delete task                |
| PUT    | `/move/:id`           | Move task to another list  |
| POST   | `/comment/:id`        | Add comment to task        |

### Notification Routes (`/api/notifications`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | `/`                   | Get user notifications     |
| PUT    | `/read/:id`           | Mark notification as read  |

### Subscription Routes (`/api/subscription`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| POST   | `/create-order`       | Create Razorpay order      |
| POST   | `/verify-payment`     | Verify payment & activate  |
| GET    | `/status`             | Get subscription status    |

### Upload Routes (`/api/upload`)

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| POST   | `/`                   | Upload file to Cloudinary  |

## 🔐 Authentication Flow

1. **Register** → User creates account
2. **Send OTP** → OTP sent to email (hashed in DB)
3. **Verify OTP** → User verifies email, account activated
4. **Login** → Returns access token (15min) + refresh token (7d)
5. **Refresh Token** → Get new access token when expired
6. **Google Login** → OAuth authentication

## 🔒 Security Features

- **JWT Authentication**: Access & refresh tokens
- **OTP Verification**: Email verification with hashed OTP
- **Rate Limiting**: Prevent brute force attacks
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Joi schemas
- **RBAC**: Role-based access control

## 🌐 Socket.io Events

### Client → Server

- `join:board` - Join board room
- `leave:board` - Leave board room
- `join:project` - Join project room
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator

### Server → Client

- `notification` - New notification
- `task:created` - Task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `task:moved` - Task moved
- `task:commented` - New comment
- `user:joined` - User joined board
- `user:left` - User left board
- `typing:start` - User typing
- `typing:stop` - User stopped typing

## 📦 Database Models

- **User**: Authentication, profile, subscription
- **Team**: Team management with members
- **Invitation**: Team invitations
- **Project**: Projects within teams
- **Board**: Kanban boards
- **List**: Columns in boards
- **Task**: Tasks with comments, attachments
- **Notification**: User notifications
- **Subscription**: Payment & subscription tracking

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use production MongoDB cluster
3. Configure production URLs
4. Set secure JWT secrets

### Recommended Platforms

- **Backend**: Railway, Render, AWS EC2, DigitalOcean
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary

### Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB indexes created
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] Error logging setup (e.g., Sentry)
- [ ] SSL/TLS enabled
- [ ] Backup strategy implemented

## 📝 API Testing

Use Postman or Thunder Client:

1. Register user
2. Send & verify OTP
3. Login to get tokens
4. Use Bearer token in Authorization header
5. Test all endpoints

## 🐛 Error Handling

All errors return consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

## 📄 License

MIT

## 👨‍💻 Author

SaaS PM Team
