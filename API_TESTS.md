# API Test Guide

---

## AUTH

---

### Register
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "Ali Ahmed",
  "email": "ali@gmail.com",
  "password": "Test@1234"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to email."
}
```

---

### Send OTP
```
POST /api/auth/send-otp
```
**Body:**
```json
{
  "email": "ali@gmail.com"
}
```
**Result:**
```json
{
  "success": true,
  "message": "OTP sent successfully."
}
```

---

### Verify OTP
```
POST /api/auth/verify-otp
```
**Body:**
```json
{
  "email": "ali@gmail.com",
  "otp": "123456"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

---

### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "ali@gmail.com",
  "password": "Test@1234"
}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "_id": "user_id_here",
      "name": "Ali Ahmed",
      "email": "ali@gmail.com"
    }
  }
}
```
> ⚠️ accessToken ko copy karke TOKEN variable mein paste karo

---

### Refresh Token
```
POST /api/auth/refresh-token
```
**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ..."
  }
}
```

---

### Forgot Password
```
POST /api/auth/forgot-password
```
**Body:**
```json
{
  "email": "ali@gmail.com"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Password reset link sent to email."
}
```

---

### Reset Password
```
POST /api/auth/reset-password
```
**Body:**
```json
{
  "token": "email_se_mila_token",
  "password": "NewPass@1234"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

---

### Logout
```
POST /api/auth/logout
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

## USER

---

### Get My Profile
```
GET /api/users/me
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Ali Ahmed",
    "email": "ali@gmail.com",
    "avatar": "url_here"
  }
}
```

---

### Update Profile
```
PUT /api/users/update-profile
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body (form-data):**
```
name  →  Ali Updated
avatar  →  (image file select karo)
```
**Result:**
```json
{
  "success": true,
  "message": "Profile updated successfully."
}
```

---

### Get User By ID
```
GET /api/users/:userId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Ali Ahmed",
    "email": "ali@gmail.com"
  }
}
```

---

## TEAM

---

### Create Team
```
POST /api/teams/create
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "name": "Dev Team",
  "description": "Meri team"
}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "_id": "team_id",
    "name": "Dev Team"
  }
}
```

---

### Get My Teams
```
GET /api/teams/my-teams
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": [
    { "_id": "team_id", "name": "Dev Team" }
  ]
}
```

---

### Get Team By ID
```
GET /api/teams/:teamId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "_id": "team_id",
    "name": "Dev Team",
    "members": []
  }
}
```

---

### Invite Member
```
POST /api/teams/invite
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "teamId": "team_id",
  "email": "member@gmail.com",
  "role": "member"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Invitation sent to member@gmail.com"
}
```

---

### Accept Invite
```
POST /api/teams/accept-invite
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "token": "email_se_mila_invite_token"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Invitation accepted."
}
```

---

### Reject Invite
```
POST /api/teams/reject-invite
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "token": "email_se_mila_invite_token"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Invitation rejected."
}
```

---

### Update Member Role
```
PUT /api/teams/update-role
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "teamId": "team_id",
  "userId": "user_id",
  "role": "admin"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Role updated successfully."
}
```

---

### Remove Member
```
DELETE /api/teams/remove-member
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "teamId": "team_id",
  "userId": "user_id"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Member removed successfully."
}
```

---

## PROJECT

---

### Create Project
```
POST /api/projects/create
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "name": "Mera Pehla Project",
  "description": "Test project",
  "teamId": "team_id"
}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "_id": "project_id",
    "name": "Mera Pehla Project"
  }
}
```

---

### Get All Projects
```
GET /api/projects
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": [
    { "_id": "project_id", "name": "Mera Pehla Project" }
  ]
}
```

---

### Get Project By ID
```
GET /api/projects/:projectId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "_id": "project_id",
    "name": "Mera Pehla Project",
    "description": "Test project"
  }
}
```

---

### Update Project
```
PUT /api/projects/update/:projectId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body (form-data):**
```
name  →  Updated Project
description  →  Updated description
cover  →  (image file select karo)
```
**Result:**
```json
{
  "success": true,
  "message": "Project updated successfully."
}
```

---

### Delete Project
```
DELETE /api/projects/delete/:projectId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "message": "Project deleted successfully."
}
```

---

## BOARD

---

### Create Board
```
POST /api/boards/create
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "name": "Sprint 1",
  "projectId": "project_id"
}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "_id": "board_id",
    "name": "Sprint 1"
  }
}
```

---

### Get Boards By Project
```
GET /api/boards/:projectId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": [
    { "_id": "board_id", "name": "Sprint 1" }
  ]
}
```

---

### Update Board
```
PUT /api/boards/update/:boardId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "name": "Sprint 1 - Updated"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Board updated successfully."
}
```

---

### Delete Board
```
DELETE /api/boards/delete/:boardId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "message": "Board deleted successfully."
}
```

---

## LIST

---

### Create List
```
POST /api/lists/create
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "name": "To Do",
  "boardId": "board_id"
}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "_id": "list_id",
    "name": "To Do"
  }
}
```

---

### Update List
```
PUT /api/lists/update/:listId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "name": "In Progress"
}
```
**Result:**
```json
{
  "success": true,
  "message": "List updated successfully."
}
```

---

### Delete List
```
DELETE /api/lists/delete/:listId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "message": "List deleted successfully."
}
```

---

## TASK

---

### Create Task
```
POST /api/tasks/create
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "title": "Login Page Banana Hai",
  "description": "JWT ke saath",
  "boardId": "board_id",
  "listId": "list_id",
  "priority": "high",
  "dueDate": "2025-12-31",
  "assignees": ["user_id"]
}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "_id": "task_id",
    "title": "Login Page Banana Hai"
  }
}
```

---

### Get Tasks By Board
```
GET /api/tasks/:boardId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": [
    { "_id": "task_id", "title": "Login Page Banana Hai", "priority": "high" }
  ]
}
```

---

### Update Task
```
PUT /api/tasks/update/:taskId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body (form-data):**
```
title  →  Login Page - Done
priority  →  low
cover  →  (image file select karo)
```
**Result:**
```json
{
  "success": true,
  "message": "Task updated successfully."
}
```

---

### Move Task
```
PUT /api/tasks/move/:taskId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "listId": "list_id",
  "position": 0
}
```
**Result:**
```json
{
  "success": true,
  "message": "Task moved successfully."
}
```

---

### Add Comment
```
POST /api/tasks/comment/:taskId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body (form-data):**
```
text  →  Yeh task complete ho gaya!
attachment  →  (optional file)
```
**Result:**
```json
{
  "success": true,
  "message": "Comment added successfully."
}
```

---

### Delete Task
```
DELETE /api/tasks/delete/:taskId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "message": "Task deleted successfully."
}
```

---

## NOTIFICATION

---

### Get All Notifications
```
GET /api/notifications
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": [
    { "_id": "notif_id", "message": "Ali ne task assign kiya", "read": false }
  ]
}
```

---

### Mark As Read
```
PUT /api/notifications/read/:notifId
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "message": "Notification marked as read."
}
```

---

## SUBSCRIPTION

---

### Get Status
```
GET /api/subscription/status
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "plan": "free",
    "expiresAt": null
  }
}
```

---

### Create Order
```
POST /api/subscription/create-order
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "plan": "pro"
}
```
**Result:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxx",
    "amount": 99900
  }
}
```

---

### Verify Payment
```
POST /api/subscription/verify-payment
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```
**Result:**
```json
{
  "success": true,
  "message": "Payment verified. Pro plan activated."
}
```

---

## FILE UPLOAD

---

### Upload File
```
POST /api/upload
```
**Header:**
```
Authorization: Bearer {{TOKEN}}
```
**Body (form-data):**
```
file  →  (koi bhi file select karo)
```
**Result:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/your-file-url"
  }
}
```

---

## SERVER CHECK

---

### Health Check
```
GET /health
```
**Result:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```
