
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import pyodbc

from ..database import get_db_connection
from ..schemas import Token, LoginRequest
from ..security import (
    verify_password, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Authenticate user
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT id, name, email, hashed_password, role, profile_picture FROM users WHERE email = ?",
            (form_data.username,)
        )
        
        user_record = cursor.fetchone()
        
        if not user_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        user_id, name, email, hashed_password, role, profile_picture = user_record
        
        if not verify_password(form_data.password, hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id, "email": email, "role": role},
            expires_delta=access_token_expires,
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id,
            "name": name,
            "email": email,
            "role": role,
            "profile_picture": profile_picture
        }
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during authentication"
        )
    finally:
        cursor.close()
        conn.close()

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    # Simplified login endpoint for frontend usage
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT id, name, email, hashed_password, role, profile_picture FROM users WHERE email = ?",
            (login_data.email,)
        )
        
        user_record = cursor.fetchone()
        
        if not user_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
            
        user_id, name, email, hashed_password, role, profile_picture = user_record
        
        if not verify_password(login_data.password, hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
            
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id, "email": email, "role": role},
            expires_delta=access_token_expires,
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id,
            "name": name,
            "email": email,
            "role": role,
            "profile_picture": profile_picture
        }
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during authentication"
        )
    finally:
        cursor.close()
        conn.close()
