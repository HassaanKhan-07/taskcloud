# ☁️ TaskCloud — Full-Stack Cloud To-Do Application

A production-ready, multi-user task management application demonstrating real-world cloud computing concepts: cloud database, authentication-as-a-service, REST API design, and scalable deployment.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js, REST API |
| **Database** | MongoDB Atlas (cloud) |
| **Auth** | Firebase Authentication |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |

---

## 🗂️ Project Structure

```
todo-app/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection
│   ├── controllers/
│   │   └── taskController.js   # CRUD logic
│   ├── models/
│   │   └── Task.js             # Mongoose schema
│   ├── routes/
│   │   └── taskRoutes.js       # Express routes + validation
│   ├── server.js               # App entry point
│   ├── render.yaml             # Render deployment config
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── AuthForm.js      # Login / Signup UI
    │   │   ├── Header.js        # Navbar with logout + theme toggle
    │   │   ├── TaskList.js      # Main task view
    │   │   ├── TaskItem.js      # Individual task row
    │   │   ├── AddTask.js       # Task creation form
    │   │   ├── FilterBar.js     # All / Pending / Completed filter
    │   │   ├── StatsBar.js      # Progress bar + stats
    │   │   ├── LoadingSpinner.js
    │   │   └── EmptyState.js
    │   ├── context/
    │   │   ├── AuthContext.js   # Firebase auth state
    │   │   └── ThemeContext.js  # Dark mode state
    │   ├── hooks/
    │   │   └── useTasks.js      # Data fetching + mutations
    │   ├── utils/
    │   │   └── api.js           # Axios instance + taskAPI helpers
    │   ├── firebase.js          # Firebase initialization
    │   ├── App.js
    │   └── index.js
    ├── tailwind.config.js
    ├── vercel.json              # Vercel deployment config
    └── .env.example
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks/:userId` | Fetch all tasks for a user |
| `GET` | `/tasks/:userId?filter=pending` | Fetch filtered tasks |
| `POST` | `/tasks` | Create a new task |
| `PUT` | `/tasks/:id` | Update title / completed / priority |
| `DELETE` | `/tasks/:id` | Delete a task |
| `DELETE` | `/tasks/user/:userId` | Delete all tasks for a user |
| `GET` | `/health` | Health check |

### Request Bodies

**POST /tasks**
```json
{
  "title": "Buy groceries",
  "userId": "firebase-uid-here",
  "priority": "medium"
}
```

**PUT /tasks/:id**
```json
{
  "completed": true
}
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier works)
- Firebase project

### 1. Clone the repo
```bash
git clone https://github.com/your-username/taskcloud.git
cd taskcloud
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/todo-app?retryWrites=true&w=majority
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev   # uses nodemon for hot reload
```

Backend runs at: `http://localhost:5000`

### 3. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Go to **Authentication → Sign-in method → Email/Password** → Enable
4. Go to **Project Settings → Your Apps → Web App** → Register
5. Copy the config values

### 4. Set up the Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm start
```

Frontend runs at: `http://localhost:3000`

---

## ☁️ Deployment

### Backend → Render

1. Push your `backend/` folder to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Add environment variables in the Render dashboard:
   - `MONGODB_URI` → your Atlas connection string
   - `FRONTEND_URL` → your Vercel URL (add after deploying frontend)
   - `NODE_ENV` → `production`
6. Deploy → copy your Render URL (e.g. `https://taskcloud-api.onrender.com`)

### Frontend → Vercel

1. Push your `frontend/` folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Create React App** (auto-detected)
4. Add all `REACT_APP_*` environment variables from your `.env`
5. Set `REACT_APP_API_URL` → your Render backend URL
6. Deploy → your app is live!

### Post-deployment
- Update Render's `FRONTEND_URL` to your Vercel URL
- Update Firebase Console → Authentication → Authorized Domains → add your Vercel domain

---

## 🔐 Security Highlights

- **User isolation**: every API query filters by `userId` — users only see their own tasks
- **Input validation**: `express-validator` validates all incoming request bodies
- **CORS**: restricted to the frontend origin only in production
- **Environment variables**: no secrets in source code
- **Error handling**: all errors caught with try/catch, proper HTTP status codes returned
- **Firebase Auth**: industry-standard auth, passwords never touch your backend

---

## ⭐ Features

- ✅ Email/password signup & login (Firebase)
- ✅ Persistent session (stays logged in on refresh)
- ✅ Create, read, update, delete tasks
- ✅ Task priority levels (Low / Medium / High)
- ✅ Toggle task completion with optimistic UI
- ✅ Inline task editing
- ✅ Filter: All / Pending / Completed
- ✅ Progress bar & task statistics
- ✅ Dark mode toggle (persists to localStorage)
- ✅ Toast notifications for all actions
- ✅ Loading spinners
- ✅ Fully responsive mobile design
- ✅ Graceful error handling

---

## 🏗️ Architecture

```
Browser (React)
    │
    │  Firebase SDK (auth)
    ▼
Firebase Auth ──────────────────► JWT / UID
    │
    │  Axios HTTP requests
    ▼
Express API (Render)
    │
    │  userId filter on every query
    ▼
MongoDB Atlas ──────────────► Task documents
```

Each user's tasks are scoped by their Firebase `uid`, ensuring complete data isolation across all users.

---
