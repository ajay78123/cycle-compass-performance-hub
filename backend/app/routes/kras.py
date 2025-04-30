
from fastapi import APIRouter, Depends, HTTPException, status
import uuid
import pyodbc
from typing import List

from ..database import get_db_connection
from ..security import get_current_user, TokenData
from ..schemas import KRACreate, KRAResponse, KPIResponse

router = APIRouter()

@router.post("/", response_model=KRAResponse, status_code=status.HTTP_201_CREATED)
async def create_kra(
    kra: KRACreate,
    current_user: TokenData = Depends(get_current_user)
):
    # Managers can create KRAs for their direct reports
    # Employees can create their own KRAs
    # Admin can create for anyone
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check permissions
        if current_user.role == "employee" and current_user.id != kra.employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create KRAs for other employees"
            )
        
        if current_user.role == "manager":
            # Check if employee is a direct report
            cursor.execute(
                "SELECT id FROM users WHERE id = ? AND manager_id = ?", 
                (kra.employee_id, current_user.id)
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to create KRAs for this employee"
                )
        
        # Check if cycle exists and is open
        cursor.execute(
            "SELECT id, status FROM review_cycles WHERE id = ?", 
            (kra.cycle_id,)
        )
        cycle = cursor.fetchone()
        
        if not cycle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review cycle not found"
            )
        
        if cycle[1] != "open":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Review cycle is not open"
            )
        
        # Create KRA ID
        kra_id = str(uuid.uuid4())
        
        # Set initial status
        initial_status = "approved" if current_user.role in ["admin", "manager"] else "pending"
        
        # Insert KRA
        cursor.execute("""
            INSERT INTO kras (id, employee_id, cycle_id, name, description, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            kra_id,
            kra.employee_id,
            kra.cycle_id,
            kra.name,
            kra.description,
            initial_status
        ))
        
        # Insert KPIs
        kpi_records = []
        for kpi_data in kra.kpis:
            kpi_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO kpis (id, kra_id, description, target, unit, weight, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                kpi_id,
                kra_id,
                kpi_data.description,
                kpi_data.target,
                kpi_data.unit,
                kpi_data.weight,
                initial_status
            ))
            
            kpi_records.append({
                "id": kpi_id,
                "kra_id": kra_id,
                "description": kpi_data.description,
                "target": kpi_data.target,
                "unit": kpi_data.unit,
                "weight": kpi_data.weight,
                "status": initial_status,
                "feedback": None
            })
        
        conn.commit()
        
        # Return created KRA with KPIs
        return {
            "id": kra_id,
            "employee_id": kra.employee_id,
            "cycle_id": kra.cycle_id,
            "name": kra.name,
            "description": kra.description,
            "status": initial_status,
            "feedback": None,
            "kpis": kpi_records
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(f"Error creating KRA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the KRA"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[KRAResponse])
async def get_kras(
    employee_id: str = None,
    cycle_id: str = None,
    status: str = None,
    current_user: TokenData = Depends(get_current_user)
):
    # Employees can view their own KRAs
    # Managers can view their direct reports' KRAs
    # Admin can view all KRAs
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query_parts = ["SELECT id, employee_id, cycle_id, name, description, status, feedback FROM kras"]
        params = []
        where_clauses = []
        
        # Filter by employee
        if employee_id:
            where_clauses.append("employee_id = ?")
            params.append(employee_id)
        elif current_user.role == "employee":
            where_clauses.append("employee_id = ?")
            params.append(current_user.id)
        elif current_user.role == "manager":
            where_clauses.append("employee_id IN (SELECT id FROM users WHERE manager_id = ?)")
            params.append(current_user.id)
        
        # Filter by cycle
        if cycle_id:
            where_clauses.append("cycle_id = ?")
            params.append(cycle_id)
        
        # Filter by status
        if status:
            where_clauses.append("status = ?")
            params.append(status)
        
        # Build complete query
        if where_clauses:
            query_parts.append("WHERE " + " AND ".join(where_clauses))
        
        query = " ".join(query_parts)
        cursor.execute(query, params)
        
        kras = []
        for row in cursor.fetchall():
            kra_id = row[0]
            
            # Get KPIs for this KRA
            cursor.execute("""
                SELECT id, kra_id, description, target, unit, weight, status, feedback
                FROM kpis WHERE kra_id = ?
            """, (kra_id,))
            
            kpis = []
            for kpi_row in cursor.fetchall():
                kpis.append({
                    "id": kpi_row[0],
                    "kra_id": kpi_row[1],
                    "description": kpi_row[2],
                    "target": kpi_row[3],
                    "unit": kpi_row[4],
                    "weight": kpi_row[5],
                    "status": kpi_row[6],
                    "feedback": kpi_row[7]
                })
            
            kras.append({
                "id": row[0],
                "employee_id": row[1],
                "cycle_id": row[2],
                "name": row[3],
                "description": row[4],
                "status": row[5],
                "feedback": row[6],
                "kpis": kpis
            })
        
        return kras
    except Exception as e:
        print(f"Error getting KRAs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving KRAs"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/{kra_id}", response_model=KRAResponse)
async def get_kra(
    kra_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    # Employees can view their own KRAs
    # Managers can view their direct reports' KRAs
    # Admin can view all KRAs
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, employee_id, cycle_id, name, description, status, feedback
            FROM kras WHERE id = ?
        """, (kra_id,))
        
        kra = cursor.fetchone()
        
        if not kra:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="KRA not found"
            )
        
        # Check permissions
        employee_id = kra[1]
        if current_user.role == "employee" and current_user.id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this KRA"
            )
        
        if current_user.role == "manager":
            # Check if employee is a direct report
            cursor.execute(
                "SELECT id FROM users WHERE id = ? AND manager_id = ?", 
                (employee_id, current_user.id)
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this KRA"
                )
        
        # Get KPIs for this KRA
        cursor.execute("""
            SELECT id, kra_id, description, target, unit, weight, status, feedback
            FROM kpis WHERE kra_id = ?
        """, (kra_id,))
        
        kpis = []
        for kpi_row in cursor.fetchall():
            kpis.append({
                "id": kpi_row[0],
                "kra_id": kpi_row[1],
                "description": kpi_row[2],
                "target": kpi_row[3],
                "unit": kpi_row[4],
                "weight": kpi_row[5],
                "status": kpi_row[6],
                "feedback": kpi_row[7]
            })
        
        return {
            "id": kra[0],
            "employee_id": kra[1],
            "cycle_id": kra[2],
            "name": kra[3],
            "description": kra[4],
            "status": kra[5],
            "feedback": kra[6],
            "kpis": kpis
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting KRA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the KRA"
        )
    finally:
        cursor.close()
        conn.close()

@router.put("/{kra_id}/validate", response_model=KRAResponse)
async def validate_kra(
    kra_id: str,
    status: str,
    feedback: str = None,
    current_user: TokenData = Depends(get_current_user)
):
    # Only managers can validate KRAs for their direct reports
    # Admin can validate any KRA
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to validate KRAs"
        )
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'approved' or 'rejected'"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get KRA
        cursor.execute("""
            SELECT id, employee_id, cycle_id, name, description, status
            FROM kras WHERE id = ?
        """, (kra_id,))
        
        kra = cursor.fetchone()
        
        if not kra:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="KRA not found"
            )
        
        # Check permissions for manager
        employee_id = kra[1]
        if current_user.role == "manager":
            cursor.execute(
                "SELECT id FROM users WHERE id = ? AND manager_id = ?", 
                (employee_id, current_user.id)
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to validate this KRA"
                )
        
        # Update KRA status and feedback
        cursor.execute("""
            UPDATE kras SET status = ?, feedback = ? WHERE id = ?
        """, (status, feedback, kra_id))
        
        # Update KPIs status to match
        cursor.execute("""
            UPDATE kpis SET status = ? WHERE kra_id = ?
        """, (status, kra_id))
        
        # Get updated KRA with KPIs
        cursor.execute("""
            SELECT id, employee_id, cycle_id, name, description, status, feedback
            FROM kras WHERE id = ?
        """, (kra_id,))
        
        updated_kra = cursor.fetchone()
        
        # Get KPIs for this KRA
        cursor.execute("""
            SELECT id, kra_id, description, target, unit, weight, status, feedback
            FROM kpis WHERE kra_id = ?
        """, (kra_id,))
        
        kpis = []
        for kpi_row in cursor.fetchall():
            kpis.append({
                "id": kpi_row[0],
                "kra_id": kpi_row[1],
                "description": kpi_row[2],
                "target": kpi_row[3],
                "unit": kpi_row[4],
                "weight": kpi_row[5],
                "status": kpi_row[6],
                "feedback": kpi_row[7]
            })
        
        conn.commit()
        
        return {
            "id": updated_kra[0],
            "employee_id": updated_kra[1],
            "cycle_id": updated_kra[2],
            "name": updated_kra[3],
            "description": updated_kra[4],
            "status": updated_kra[5],
            "feedback": updated_kra[6],
            "kpis": kpis
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(f"Error validating KRA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while validating the KRA"
        )
    finally:
        cursor.close()
        conn.close()
