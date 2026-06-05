# School Academic Control System (Fullstack)

This project is a fullstack educational application for managing **Students, Subjects, and Grades**. It connects a modern web interface built in **Next.js** with a REST API in **FastAPI** backed by a relational **PostgreSQL** database.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 15, React, Tailwind CSS (Pastel light green color palette), TypeScript.
* **Backend**: Python 3.12, FastAPI, SQLAlchemy (ORM), Pydantic (Schema validation).
* **Database**: PostgreSQL.

---

## 🗄️ Project Structure

```text
fast_api_next/
├── backend/                  # Server-side code & REST API
│   ├── .env                  # Environment variables & DB credentials (Git ignored)
│   ├── database.py           # SQLAlchemy database session & engine
│   ├── models.py             # Database ORM models
│   ├── schemas.py            # Pydantic schemas & validations
│   └── main.py               # API endpoints & server setup
├── frontend/                 # Client-side web application (Next.js)
│   ├── app/
│   │   ├── page.tsx          # Main Dashboard for Students & Subjects
│   │   └── globals.css       # Global styling configuration
│   └── package.json
└── .gitignore                # Git ignore rules
```

---

## 🚀 Setup & Execution Guide

### 1. Prerequisites
* **PostgreSQL** installed and running on port `5432`.
* **Node.js** (v18 or higher) installed.
* **Python** (v3.10 or higher) installed.

### 2. Configure the Database
1. Create an empty database in your PostgreSQL instance (e.g., using pgAdmin or psql console) named `estudiantes_db`.
2. Go to the `backend/` directory and open the `.env` file.
3. Configure your connection credentials:
   ```env
   DB_USER=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=estudiantes_db
   ```

### 3. Run the Backend (FastAPI)
From a terminal inside the `/backend` directory:
```powershell
# Start Uvicorn using the virtual environment interpreter
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```
*The backend will automatically generate the database tables and relationships upon successful connection.*
* API Base URL: `http://127.0.0.1:8000`
* Interactive Documentation (Swagger UI): `http://127.0.0.1:8000/docs`

### 4. Run the Frontend (Next.js)
From a separate terminal window inside the `/frontend` directory:
```powershell
# Install dependencies (only required the first time)
npm install

# Start the local development server
npm run dev
```
* Client Application URL: `http://localhost:3000`

---

## 💡 Core Concepts Implemented

1. **Relational Integrity**:
   * Grades/Marks belong to both a Student and a Subject.
   * Deleting a student cascades and removes all their academic records.
   * Attempting to delete a subject with active records will trigger a safety block. The backend will request an explicit confirmation query parameter (`?confirm=true`) to prevent accidental data loss. The frontend captures this and prompts the user.
2. **Data Validation**:
   * Student age is restricted between 5 and 100 years.
   * Email is formally validated using Pydantic's `EmailStr`.
   * Grades/Marks are restricted to floating-point numbers between 0.0 and 10.0.
3. **Reactive UI State**:
   * The client dynamically calculates and colors the student's overall GPA (weighted average grade).
   * Active subjects are dynamically fetched and updated in the grade assignment dropdown panel.
