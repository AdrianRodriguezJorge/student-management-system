# Academic Control System - Backend API

This is the backend server for the School Academic Control System, built with **FastAPI** and **SQLAlchemy** ORM, connected to a **PostgreSQL** database.

---

## 🛠️ Tech Stack & Libraries
* **FastAPI**: Modern, fast (high-performance), web framework for building APIs.
* **SQLAlchemy**: Relational Database ORM.
* **Pydantic**: Data validation and settings management using Python type annotations.
* **psycopg2-binary**: PostgreSQL database adapter for Python.
* **email-validator**: Formal syntax verification for student email registrations.

---

## 📂 Code Structure
* **`database.py`**: Initializes the SQLAlchemy engine, configures environment variables, and exposes the database session dependency (`get_db`).
* **`models.py`**: Declares database schemas as Python classes (`Estudiante`, `Asignatura`, `Nota`) mapping directly to PostgreSQL tables.
* **`schemas.py`**: Defines input validation schemas using Pydantic models (limits student age to 5-100, and grade values to 0.0-10.0).
* **`main.py`**: Contains the API application instance, configures CORS, and handles REST API routes.

---

## 📡 API Endpoints Summary

### Students (`/api/estudiantes`)
* `GET /api/estudiantes` - Retrieve all enrolled students along with their grades and averages.
* `POST /api/estudiantes` - Register a new student.
* `PUT /api/estudiantes/{id}` - Update student info (name, email, age).
* `DELETE /api/estudiantes/{id}` - Unenroll a student and cascade delete all their grades.

### Subjects (`/api/asignaturas`)
* `GET /api/asignaturas` - Retrieve all registered subjects.
* `POST /api/asignaturas` - Create a new subject.
* `PUT /api/asignaturas/{id}` - Update a subject's name or description.
* `DELETE /api/asignaturas/{id}` - Remove a subject. If grades exist, it returns `requiere_confirmacion: true`. Pass `?confirm=true` to force delete.

### Grades (`/api/estudiantes/{student_id}/notas`)
* `POST /api/estudiantes/{student_id}/notas` - Add or update a grade for a student in a specific subject.
* `DELETE /api/estudiantes/{student_id}/notas/{nota_id}` - Remove a grade record.

---

## ⚙️ How to Run
1. Configure your database credentials in `.env`.
2. Run the server using:
   ```bash
   .\.venv\Scripts\python.exe -m uvicorn main:app --reload
   ```
