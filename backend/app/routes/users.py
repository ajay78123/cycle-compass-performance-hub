
from fastapi import APIRouter, Depends, HTTPException, status
import uuid
import pyodbc
from typing import List

from ..database import get_db_connection
from ..security import get_current_user, get_password_hash, TokenData
from ..schemas import UserCreate, UserResponse, UserUpdate

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    current_user: TokenData = Depends(get_current_user)
):
    # Only admin can create users
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create users"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if email already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Create new user ID
        user_id = str(uuid.uuid4())
        
        # Insert user
        cursor.execute("""
            INSERT INTO users (id, name, email, hashed_password, role, manager_id, profile_picture)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            user.name,
            user.email,
            hashed_password,
            user.role,
            user.manager_id,
            user.profile_picture
        ))
        
        # Get the created user
        cursor.execute("""
            SELECT id, name, email, role, manager_id, profile_picture, created_at 
            FROM users WHERE id = ?
        """, (user_id,))
        
        user_record = cursor.fetchone()
        conn.commit()
        
        if not user_record:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        return {
            "id": user_record[0],
            "name": user_record[1],
            "email": user_record[2],
            "role": user_record[3],
            "manager_id": user_record[4],
            "profile_picture": user_record[5],
            "created_at": user_record[6]
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the user"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[UserResponse])
async def get_users(
    role: str = None,
    current_user: TokenData = Depends(get_current_user)
):
    # Only admin can view all users
    # Managers can view their direct reports
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view users"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if current_user.role == "admin":
            if role:
                cursor.execute("""
                    SELECT id, name, email, role, manager_id, profile_picture, created_at 
                    FROM users WHERE role = ?
                """, (role,))
            else:
                cursor.execute("""
                    SELECT id, name, email, role, manager_id, profile_picture, created_at 
                    FROM users
                """)
        else:  # Manager - only direct reports
            if role and role != "employee":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Managers can only view their direct employee reports"
                )
            
            cursor.execute("""
                SELECT id, name, email, role, manager_id, profile_picture, created_at 
                FROM users WHERE manager_id = ?
            """, (current_user.id,))
        
        users = []
        for row in cursor.fetchall():
            users.append({
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "role": row[3],
                "manager_id": row[4],
                "profile_picture": row[5],
                "created_at": row[6]
            })
        
        return users
    except Exception as e:
        print(f"Error getting users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving users"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/employees", response_model=List[UserResponse])
async def get_employees(
    current_user: TokenData = Depends(get_current_user)
):
    # Get employees - for managers to assign goals
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view employees"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if current_user.role == "admin":
            cursor.execute("""
                SELECT id, name, email, role, manager_id, profile_picture, created_at 
                FROM users WHERE role = 'employee'
            """)
        else:  # Manager - only direct reports
            cursor.execute("""
                SELECT id, name, email, role, manager_id, profile_picture, created_at 
                FROM users WHERE manager_id = ? AND role = 'employee'
            """, (current_user.id,))
        
        employees = []
        for row in cursor.fetchall():
            employees.append({
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "role": row[3],
                "manager_id": row[4],
                "profile_picture": row[5],
                "created_at": row[6]
            })
        
        return employees
    except Exception as e:
        print(f"Error getting employees: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving employees"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    # Users can view their own profile
    # Managers can view their direct reports
    # Admin can view anyone
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check permissions
        if current_user.role == "employee" and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this user"
            )
            
        if current_user.role == "manager" and current_user.id != user_id:
            # Check if requested user is a direct report
            cursor.execute(
                "SELECT id FROM users WHERE id = ? AND manager_id = ?", 
                (user_id, current_user.id)
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this user"
                )
        
        # Get user
        cursor.execute("""
            SELECT id, name, email, role, manager_id, profile_picture, created_at 
            FROM users WHERE id = ?
        """, (user_id,))
        
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3],
            "manager_id": user[4],
            "profile_picture": user[5],
            "created_at": user[6]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the user"
        )
    finally:
        cursor.close()
        conn.close()

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    # Users can update their own non-critical info
    # Admin can update any user
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    try:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Build update query
        update_fields = []
        params = []
        
        if user_update.name:
            update_fields.append("name = ?")
            params.append(user_update.name)
            
        if user_update.email:
            # Check if email is already taken by another user
            cursor.execute("SELECT id FROM users WHERE email = ? AND id <> ?", 
                          (user_update.email, user_id))
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered to another user"
                )
            update_fields.append("email = ?")
            params.append(user_update.email)
            
        if user_update.manager_id and current_user.role == "admin":
            # Only admin can change manager
            update_fields.append("manager_id = ?")
            params.append(user_update.manager_id)
            
        if user_update.profile_picture:
            update_fields.append("profile_picture = ?")
            params.append(user_update.profile_picture)
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Execute update
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
        params.append(user_id)
        cursor.execute(query, params)
        
        # Get updated user
        cursor.execute("""
            SELECT id, name, email, role, manager_id, profile_picture, created_at 
            FROM users WHERE id = ?
        """, (user_id,))
        
        user = cursor.fetchone()
        conn.commit()
        
        return {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3],
            "manager_id": user[4],
            "profile_picture": user[5],
            "created_at": user[6]
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(f"Error updating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the user"
        )
    finally:
        cursor.close()
        conn.close()
