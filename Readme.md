# 🧠 DevBoard – Project Management API

DevBoard is a full-featured backend API for managing users, projects, tasks, roles, and notes — built using **Node.js**, **Express**, and **MongoDB** with secure **JWT authentication** and **role-based access control**.

---

## 🚀 Features

- 🔐 JWT-based authentication with secure cookie support
- ✅ Input validation using **Zod**
- 🛡️ API rate limiting and API keys
- 📂 File uploads with **Multer** + **Cloudinary**
- ✉️ Email support using **Mailtrap** 
- 🗃️ Clean and scalable project/task/note modules
- 📃 Pagination middleware for efficient data fetching
- 👥 Role-based access control with project membership
- 🌍 RESTful API design

---

## 🧾 Project Structure

Backend/
│
├── node_modules/ # Installed packages
├── public/temp/ # Temp uploads
├── src/
│ ├── controllers/ # Route logic
│ ├── db/ # DB connection
│ ├── middlewares/ # Custom middlewares (auth, paginate, multer)
│ ├── models/ # Mongoose models
│ ├── routes/ # Express route handlers
│ ├── Utils/ # Utilities (API response, error, mail, cloudinary)
│ ├── Validators/ # Zod validators
│ ├── app.js # App configuration
│ └── index.js # Server entry point
│
├── .env # Your secrets (not committed)
├── .env.sample # Sample env for collaborators
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

yaml
Copy
Edit


---

## 🔧 Getting Started

### 📦 Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Mail service (Mailtrap or Resend)

### 📥 Installation

```bash
# 1. Clone the repo
git clone https://github.com/adii4040/DevBoard-Project-Management-API

# 2. Navigate into project
cd Backend

# 3. Install dependencies
npm install

# 4. Setup environment
cp .env.sample .env
# fill required env values

📄 Environment Variables
Here's a sample .env.sample:

PORT = 8000
MONGODB_URL=YOUR_MONGODB_URL
CORS_ORIGIN = *
BASE_URL=YOUR_BASE_URL

ACCESS_TOKEN_SECRET_KEY=YOUR_ACCESS_TOKEN_SECRET_KEY
REFRESH_TOKEN_SECRET_KEY=YOUR_REFRESH_TOKEN_SECRET_KEY

# Mailtrap
MAILTRAP_SMTP_HOST=YOUR_MAILTRAP_SMTP_HOST
MAILTRAP_SMTP_PORT=YOUR_MAILTRAP_SMTP_PORT
MAILTRAP_SMTP_USER=YOUR_MAILTRAP_SMTP_USER
MAILTRAP_SMTP_PASS=YOUR_MAILTRAP_SMTP_PASS


# Cloudinary
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET


# 5. Start the development server
npm run dev
```

📮 API Endpoints Overview

| Method | Endpoint                                  | Description              |
| ------ | ----------------------------------------- | ------------------------ |
| POST   | `/api/v1/user/register`                   | Register a new user      |
| POST   | `/api/v1/user/login`                      | User login               |
| POST   | `/api/v1/project`                         | Create a project (admin) |
| GET    | `/api/v1/project/:id`                     | Get project by ID        |
| GET    | `/api/v1/project/:id/task?page=1&limit=5` | Paginated task list      |
| POST   | `/api/v1/project/:id/task/create-task`    | Add new task to project  |
| GET    | `/api/v1/notes/:taskId`                   | Get notes for a task     |






