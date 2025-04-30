from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from datetime import datetime, date
import csv
import os
from pathlib import Path

app = FastAPI()

# Database setup
DB_FILE = "performance.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                manager_id INTEGER,
                FOREIGN KEY (manager_id) REFERENCES users(id)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_cycles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                frequency TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'open'
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cycle_id INTEGER NOT NULL,
                employee_id INTEGER NOT NULL,
                kra TEXT NOT NULL,
                kpi TEXT NOT NULL,
                target TEXT NOT NULL,
                weight INTEGER NOT NULL,
                FOREIGN KEY (cycle_id) REFERENCES review_cycles(id),
                FOREIGN KEY (employee_id) REFERENCES users(id)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                goal_id INTEGER NOT NULL,
                employee_rating INTEGER,
                employee_comments TEXT,
                manager_rating INTEGER,
                manager_comments TEXT,
                submitted BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (goal_id) REFERENCES goals(id)
            )
        """)
        # Insert dummy admin
        cursor.execute("""
            INSERT OR IGNORE INTO users (email, password, role)
            VALUES (?, ?, ?)
        """, ("admin@example.com", "admin123", "admin"))
        conn.commit()

init_db()

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: int
    email: str
    role: str
    manager_id: Optional[int] = None

class ReviewCycleCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    frequency: str

class ReviewCycle(BaseModel):
    id: int
    name: str
    start_date: str
    end_date: str
    frequency: str
    status: str

class GoalCreate(BaseModel):
    cycle_id: int
    employee_id: int
    kra: str
    kpi: str
    target: str
    weight: int

class Goal(BaseModel):
    id: int
    cycle_id: int
    employee_id: int
    kra: str
    kpi: str
    target: str
    weight: int

class ReviewCreate(BaseModel):
    goal_id: int
    employee_rating: Optional[int] = None
    employee_comments: Optional[str] = None
    manager_rating: Optional[int] = None
    manager_comments: Optional[str] = None

class Review(BaseModel):
    id: int
    goal_id: int
    employee_rating: Optional[int]
    employee_comments: Optional[str]
    manager_rating: Optional[int]
    manager_comments: Optional[str]
    submitted: bool

# Endpoints
@app.post("/login", response_model=User)
async def login(request: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", 
                   (request.email, request.password))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"id": user["id"], "email": user["email"], "role": user["role"], 
            "manager_id": user["manager_id"]}

@app.post("/review-cycles", response_model=ReviewCycle)
async def create_review_cycle(cycle: ReviewCycleCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO review_cycles (name, start_date, end_date, frequency)
        VALUES (?, ?, ?, ?)
    """, (cycle.name, cycle.start_date.isoformat(), cycle.end_date.isoformat(), cycle.frequency))
    cycle_id = cursor.lastrowid
    db.commit()
    return {**cycle.dict(), "id": cycle_id, "status": "open"}

@app.post("/goals", response_model=Goal)
async def assign_goal(goal: GoalCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    # Validate total weight for employee in cycle
    cursor.execute("""
        SELECT SUM(weight) as total_weight FROM goals 
        WHERE cycle_id = ? AND employee_id = ?
    """, (goal.cycle_id, goal.employee_id))
    total_weight = cursor.fetchone()["total_weight"] or 0
    if total_weight + goal.weight > 100:
        raise HTTPException(status_code=400, detail="Total weight exceeds 100%")
    
    cursor.execute("""
        INSERT INTO goals (cycle_id, employee_id, kra, kpi, target, weight)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (goal.cycle_id, goal.employee_id, goal.kra, goal.kpi, goal.target, goal.weight))
    goal_id = cursor.lastrowid
    db.commit()
    
    # Create review entry
    cursor.execute("INSERT INTO reviews (goal_id) VALUES (?)", (goal_id,))
    db.commit()
    
    return {**goal.dict(), "id": goal_id}

@app.post("/reviews", response_model=Review)
async def submit_review(review: ReviewCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM reviews WHERE goal_id = ?", (review.goal_id,))
    existing = cursor.fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_fields = []
    update_values = []
    if review.employee_rating is not None:
        update_fields.append("employee_rating = ?")
        update_values.append(review.employee_rating)
    if review.employee_comments is not None:
        update_fields.append("employee_comments = ?")
        update_values.append(review.employee_comments)
    if review.manager_rating is not None:
        update_fields.append("manager_rating = ?")
        update_values.append(review.manager_rating)
    if review.manager_comments is not None:
        update_fields.append("manager_comments = ?")
        update_values.append(review.manager_comments)
    
    if update_fields:
        update_fields.append("submitted = ?")
        update_values.append(True)
        query = f"UPDATE reviews SET {', '.join(update_fields)} WHERE goal_id = ?"
        update_values.append(review.goal_id)
        cursor.execute(query, update_values)
        db.commit()
    
    cursor.execute("SELECT * FROM reviews WHERE goal_id = ?", (review.goal_id,))
    updated = cursor.fetchone()
    return {
        "id": updated["id"],
        "goal_id": updated["goal_id"],
        "employee_rating": updated["employee_rating"],
        "employee_comments": updated["employee_comments"],
        "manager_rating": updated["manager_rating"],
        "manager_comments": updated["manager_comments"],
        "submitted": bool(updated["submitted"])
    }

@app.post("/review-cycles/{cycle_id}/close")
async def close_cycle(cycle_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("UPDATE review_cycles SET status = 'closed' WHERE id = ?", (cycle_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Cycle not found")
    db.commit()
    return {"message": "Cycle closed successfully"}

@app.get("/review-cycles/{cycle_id}/export")
async def export_cycle_data(cycle_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT u.email, g.kra, g.kpi, g.target, g.weight, 
               r.employee_rating, r.employee_comments, 
               r.manager_rating, r.manager_comments
        FROM goals g
        JOIN reviews r ON g.id = r.goal_id
        JOIN users u ON g.employee_id = u.id
        WHERE g.cycle_id = ?
    """, (cycle_id,))
    data = cursor.fetchall()
    
    if not data:
        raise HTTPException(status_code=404, detail="No data found for cycle")
    
    output_file = f"cycle_{cycle_id}_export.csv"
    with open(output_file, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Employee Email", "KRA", "KPI", "Target", "Weight", 
                        "Employee Rating", "Employee Comments", 
                        "Manager Rating", "Manager Comments"])
        for row in data:
            writer.writerow([row["email"], row["kra"], row["kpi"], row["target"], 
                           row["weight"], row["employee_rating"], row["employee_comments"],
                           row["manager_rating"], row["manager_comments"]])
    
    return FileResponse(output_file, filename=f"cycle_{cycle_id}_export.csv")

# Utility endpoints
@app.get("/review-cycles", response_model=List[ReviewCycle])
async def get_cycles(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM review_cycles")
    cycles = cursor.fetchall()
    return [{"id": c["id"], "name": c["name"], "start_date": c["start_date"],
             "end_date": c["end_date"], "frequency": c["frequency"], 
             "status": c["status"]} for c in cycles]

@app.get("/goals", response_model=List[Goal])
async def get_goals(cycle_id: int, employee_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM goals WHERE cycle_id = ? AND employee_id = ?",
                   (cycle_id, employee_id))
    goals = cursor.fetchall()
    return [{"id": g["id"], "cycle_id": g["cycle_id"], "employee_id": g["employee_id"],
             "kra": g["kra"], "kpi": g["kpi"], "target": g["target"], 
             "weight": g["weight"]} for g in goals]

@app.get("/reviews", response_model=List[Review])
async def get_reviews(goal_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM reviews WHERE goal_id = ?", (goal_id,))
    reviews = cursor.fetchall()
    return [{"id": r["id"], "goal_id": r["goal_id"], 
             "employee_rating": r["employee_rating"], 
             "employee_comments": r["employee_comments"],
             "manager_rating": r["manager_rating"], 
             "manager_comments": r["manager_comments"],
             "submitted": bool(r["submitted"])} for r in reviews]