
from fastapi import APIRouter, Depends, HTTPException, status
import uuid
import pyodbc
from datetime import date, datetime, timedelta
from typing import List

from ..database import get_db_connection
from ..security import get_current_user, TokenData
from ..schemas import ReviewCycleCreate, ReviewCycleResponse, ReviewWindowResponse

router = APIRouter()

def generate_review_windows(cycle_id, start_date, end_date, frequency):
    """Generate review windows based on cycle parameters"""
    windows = []
    
    if frequency == "quarterly":
        # Create four windows per year
        current_date = start_date
        window_count = 1
        
        while current_date < end_date:
            window_id = str(uuid.uuid4())
            window_end = min(current_date + timedelta(days=90), end_date)
            
            windows.append((
                window_id,
                cycle_id,
                f"Q{window_count}",
                current_date,
                window_end,
                "upcoming" if current_date > date.today() else "open"
            ))
            
            current_date = window_end + timedelta(days=1)
            window_count += 1
            if window_count > 4:
                window_count = 1
    
    elif frequency == "half-yearly":
        # Create two windows per year
        current_date = start_date
        window_count = 1
        
        while current_date < end_date:
            window_id = str(uuid.uuid4())
            window_end = min(current_date + timedelta(days=182), end_date)
            
            windows.append((
                window_id,
                cycle_id,
                f"H{window_count}",
                current_date,
                window_end,
                "upcoming" if current_date > date.today() else "open"
            ))
            
            current_date = window_end + timedelta(days=1)
            window_count = 2 if window_count == 1 else 1
            
    return windows

@router.post("/", response_model=ReviewCycleResponse, status_code=status.HTTP_201_CREATED)
async def create_review_cycle(
    cycle: ReviewCycleCreate,
    current_user: TokenData = Depends(get_current_user)
):
    # Only admin can create review cycles
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create review cycles"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Create cycle ID
        cycle_id = str(uuid.uuid4())
        
        # Insert cycle
        cursor.execute("""
            INSERT INTO review_cycles (id, name, start_date, end_date, frequency, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            cycle_id,
            cycle.name,
            cycle.start_date,
            cycle.end_date,
            cycle.frequency,
            "open",
            current_user.id
        ))
        
        # Generate review windows
        windows = generate_review_windows(
            cycle_id, 
            cycle.start_date, 
            cycle.end_date, 
            cycle.frequency
        )
        
        # Insert windows
        for window in windows:
            cursor.execute("""
                INSERT INTO review_windows (id, cycle_id, label, open_date, close_date, status)
                VALUES (?, ?, ?, ?, ?, ?)
            """, window)
        
        # Get the created cycle
        cursor.execute("""
            SELECT id, name, start_date, end_date, frequency, status, created_by, created_at 
            FROM review_cycles WHERE id = ?
        """, (cycle_id,))
        
        cycle_record = cursor.fetchone()
        conn.commit()
        
        if not cycle_record:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create review cycle"
            )
        
        return {
            "id": cycle_record[0],
            "name": cycle_record[1],
            "start_date": cycle_record[2],
            "end_date": cycle_record[3],
            "frequency": cycle_record[4],
            "status": cycle_record[5],
            "created_by": cycle_record[6],
            "created_at": cycle_record[7]
        }
    except Exception as e:
        conn.rollback()
        print(f"Error creating review cycle: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the review cycle"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[ReviewCycleResponse])
async def get_review_cycles(
    status: str = None,
    current_user: TokenData = Depends(get_current_user)
):
    # All authenticated users can view cycles
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
            SELECT id, name, start_date, end_date, frequency, status, created_by, created_at 
            FROM review_cycles
        """
        params = []
        
        if status:
            query += " WHERE status = ?"
            params.append(status)
        
        query += " ORDER BY start_date DESC"
        
        cursor.execute(query, params)
        
        cycles = []
        for row in cursor.fetchall():
            cycles.append({
                "id": row[0],
                "name": row[1],
                "start_date": row[2],
                "end_date": row[3],
                "frequency": row[4],
                "status": row[5],
                "created_by": row[6],
                "created_at": row[7]
            })
        
        return cycles
    except Exception as e:
        print(f"Error getting review cycles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving review cycles"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/{cycle_id}", response_model=ReviewCycleResponse)
async def get_review_cycle(
    cycle_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    # All authenticated users can view a cycle
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, name, start_date, end_date, frequency, status, created_by, created_at 
            FROM review_cycles WHERE id = ?
        """, (cycle_id,))
        
        cycle = cursor.fetchone()
        
        if not cycle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review cycle not found"
            )
        
        return {
            "id": cycle[0],
            "name": cycle[1],
            "start_date": cycle[2],
            "end_date": cycle[3],
            "frequency": cycle[4],
            "status": cycle[5],
            "created_by": cycle[6],
            "created_at": cycle[7]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting review cycle: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the review cycle"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/{cycle_id}/windows", response_model=List[ReviewWindowResponse])
async def get_review_windows(
    cycle_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    # All authenticated users can view windows for a cycle
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if cycle exists
        cursor.execute("SELECT id FROM review_cycles WHERE id = ?", (cycle_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review cycle not found"
            )
        
        cursor.execute("""
            SELECT id, cycle_id, label, open_date, close_date, status 
            FROM review_windows WHERE cycle_id = ?
            ORDER BY open_date ASC
        """, (cycle_id,))
        
        windows = []
        for row in cursor.fetchall():
            windows.append({
                "id": row[0],
                "cycle_id": row[1],
                "label": row[2],
                "open_date": row[3],
                "close_date": row[4],
                "status": row[5]
            })
        
        return windows
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting review windows: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving review windows"
        )
    finally:
        cursor.close()
        conn.close()

@router.post("/{cycle_id}/close", response_model=ReviewCycleResponse)
async def close_review_cycle(
    cycle_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    # Only admin can close a cycle
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to close review cycles"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get cycle
        cursor.execute("""
            SELECT id, status FROM review_cycles WHERE id = ?
        """, (cycle_id,))
        
        cycle = cursor.fetchone()
        
        if not cycle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review cycle not found"
            )
        
        if cycle[1] == "closed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Review cycle is already closed"
            )
        
        # Close cycle
        cursor.execute("""
            UPDATE review_cycles SET status = 'closed' WHERE id = ?
        """, (cycle_id,))
        
        # Close all windows
        cursor.execute("""
            UPDATE review_windows SET status = 'closed' WHERE cycle_id = ?
        """, (cycle_id,))
        
        # Get updated cycle
        cursor.execute("""
            SELECT id, name, start_date, end_date, frequency, status, created_by, created_at 
            FROM review_cycles WHERE id = ?
        """, (cycle_id,))
        
        updated_cycle = cursor.fetchone()
        conn.commit()
        
        return {
            "id": updated_cycle[0],
            "name": updated_cycle[1],
            "start_date": updated_cycle[2],
            "end_date": updated_cycle[3],
            "frequency": updated_cycle[4],
            "status": updated_cycle[5],
            "created_by": updated_cycle[6],
            "created_at": updated_cycle[7]
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(f"Error closing review cycle: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while closing the review cycle"
        )
    finally:
        cursor.close()
        conn.close()
