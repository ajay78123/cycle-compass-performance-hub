
from fastapi import APIRouter, Depends, HTTPException, status
import uuid
import pyodbc
from typing import List

from ..database import get_db_connection
from ..security import get_current_user, TokenData
from ..schemas import SelfReviewCreate, ManagerReviewCreate, RatingResponse

router = APIRouter()

@router.post("/self", status_code=status.HTTP_201_CREATED, response_model=List[RatingResponse])
async def submit_self_review(
    review: SelfReviewCreate,
    current_user: TokenData = Depends(get_current_user)
):
    # Employees can submit self-reviews for their KPIs
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if window exists and is open
        cursor.execute("""
            SELECT id, status FROM review_windows WHERE id = ?
        """, (review.window_id,))
        
        window = cursor.fetchone()
        if not window:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review window not found"
            )
        
        if window[1] != "open":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Review window is not open"
            )
        
        # Validate KPI ownership
        for rating in review.ratings:
            cursor.execute("""
                SELECT k.employee_id FROM kpis p
                JOIN kras k ON p.kra_id = k.id
                WHERE p.id = ?
            """, (rating.kpi_id,))
            
            kpi_owner = cursor.fetchone()
            if not kpi_owner or kpi_owner[0] != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Not authorized to rate this KPI: {rating.kpi_id}"
                )
            
            # Check if already rated
            cursor.execute("""
                SELECT id FROM ratings 
                WHERE kpi_id = ? AND rater_id = ? AND window_id = ? AND rater_type = 'self'
            """, (rating.kpi_id, current_user.id, review.window_id))
            
            if cursor.fetchone():
                # Update existing rating
                cursor.execute("""
                    UPDATE ratings SET score = ?, comment = ?
                    WHERE kpi_id = ? AND rater_id = ? AND window_id = ? AND rater_type = 'self'
                """, (rating.score, rating.comment, rating.kpi_id, current_user.id, review.window_id))
            else:
                # Create new rating
                rating_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO ratings (id, kpi_id, rater_id, rater_type, score, comment, window_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    rating_id,
                    rating.kpi_id,
                    current_user.id,
                    "self",
                    rating.score,
                    rating.comment,
                    review.window_id
                ))
        
        # Get all created/updated ratings
        cursor.execute("""
            SELECT id, kpi_id, rater_id, rater_type, score, comment, window_id, created_at
            FROM ratings
            WHERE rater_id = ? AND window_id = ? AND rater_type = 'self'
        """, (current_user.id, review.window_id))
        
        ratings = []
        for row in cursor.fetchall():
            ratings.append({
                "id": row[0],
                "kpi_id": row[1],
                "rater_id": row[2],
                "rater_type": row[3],
                "score": row[4],
                "comment": row[5],
                "window_id": row[6],
                "created_at": row[7]
            })
        
        conn.commit()
        return ratings
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(f"Error submitting self-review: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while submitting the self-review"
        )
    finally:
        cursor.close()
        conn.close()

@router.post("/manager", status_code=status.HTTP_201_CREATED, response_model=List[RatingResponse])
async def submit_manager_review(
    review: ManagerReviewCreate,
    current_user: TokenData = Depends(get_current_user)
):
    # Managers can submit reviews for their direct reports
    # Admin can submit for any employee
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to submit manager reviews"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if window exists and is open
        cursor.execute("""
            SELECT id, status FROM review_windows WHERE id = ?
        """, (review.window_id,))
        
        window = cursor.fetchone()
        if not window:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review window not found"
            )
        
        if window[1] != "open":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Review window is not open"
            )
        
        # Check if manager is authorized to review this employee
        if current_user.role == "manager":
            cursor.execute("""
                SELECT id FROM users WHERE id = ? AND manager_id = ?
            """, (review.employee_id, current_user.id))
            
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to review this employee"
                )
        
        # Validate KPI ownership
        for rating in review.ratings:
            cursor.execute("""
                SELECT k.employee_id FROM kpis p
                JOIN kras k ON p.kra_id = k.id
                WHERE p.id = ?
            """, (rating.kpi_id,))
            
            kpi_owner = cursor.fetchone()
            if not kpi_owner or kpi_owner[0] != review.employee_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"This KPI does not belong to the specified employee: {rating.kpi_id}"
                )
            
            # Check if already rated
            cursor.execute("""
                SELECT id FROM ratings 
                WHERE kpi_id = ? AND rater_id = ? AND window_id = ? AND rater_type = 'manager'
            """, (rating.kpi_id, current_user.id, review.window_id))
            
            if cursor.fetchone():
                # Update existing rating
                cursor.execute("""
                    UPDATE ratings SET score = ?, comment = ?
                    WHERE kpi_id = ? AND rater_id = ? AND window_id = ? AND rater_type = 'manager'
                """, (rating.score, rating.comment, rating.kpi_id, current_user.id, review.window_id))
            else:
                # Create new rating
                rating_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO ratings (id, kpi_id, rater_id, rater_type, score, comment, window_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    rating_id,
                    rating.kpi_id,
                    current_user.id,
                    "manager",
                    rating.score,
                    rating.comment,
                    review.window_id
                ))
        
        # Get all created/updated ratings
        cursor.execute("""
            SELECT id, kpi_id, rater_id, rater_type, score, comment, window_id, created_at
            FROM ratings
            WHERE rater_id = ? AND window_id = ? AND rater_type = 'manager'
            AND kpi_id IN (
                SELECT p.id FROM kpis p
                JOIN kras k ON p.kra_id = k.id
                WHERE k.employee_id = ?
            )
        """, (current_user.id, review.window_id, review.employee_id))
        
        ratings = []
        for row in cursor.fetchall():
            ratings.append({
                "id": row[0],
                "kpi_id": row[1],
                "rater_id": row[2],
                "rater_type": row[3],
                "score": row[4],
                "comment": row[5],
                "window_id": row[6],
                "created_at": row[7]
            })
        
        conn.commit()
        return ratings
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(f"Error submitting manager review: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while submitting the manager review"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/employee/{employee_id}/window/{window_id}", response_model=List[RatingResponse])
async def get_employee_reviews(
    employee_id: str,
    window_id: str,
    rater_type: str = None,
    current_user: TokenData = Depends(get_current_user)
):
    # Employees can view their own reviews
    # Managers can view their direct reports' reviews
    # Admin can view any employee's reviews
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check permissions
        if current_user.role == "employee" and current_user.id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view these reviews"
            )
        
        if current_user.role == "manager":
            cursor.execute("""
                SELECT id FROM users WHERE id = ? AND manager_id = ?
            """, (employee_id, current_user.id))
            
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view these reviews"
                )
        
        # Build query
        query = """
            SELECT r.id, r.kpi_id, r.rater_id, r.rater_type, r.score, r.comment, r.window_id, r.created_at
            FROM ratings r
            JOIN kpis p ON r.kpi_id = p.id
            JOIN kras k ON p.kra_id = k.id
            WHERE k.employee_id = ? AND r.window_id = ?
        """
        params = [employee_id, window_id]
        
        if rater_type:
            query += " AND r.rater_type = ?"
            params.append(rater_type)
        
        cursor.execute(query, params)
        
        ratings = []
        for row in cursor.fetchall():
            ratings.append({
                "id": row[0],
                "kpi_id": row[1],
                "rater_id": row[2],
                "rater_type": row[3],
                "score": row[4],
                "comment": row[5],
                "window_id": row[6],
                "created_at": row[7]
            })
        
        return ratings
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting reviews: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving reviews"
        )
    finally:
        cursor.close()
        conn.close()
