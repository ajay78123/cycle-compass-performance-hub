
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field, validator

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    name: str
    email: str
    role: str
    profile_picture: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = Field(..., pattern="^(admin|manager|employee)$")

class UserCreate(UserBase):
    password: str
    manager_id: Optional[str] = None
    profile_picture: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    manager_id: Optional[str] = None
    profile_picture: Optional[str] = None

class UserResponse(UserBase):
    id: str
    manager_id: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Cycle schemas
class ReviewCycleBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    frequency: str = Field(..., pattern="^(quarterly|half-yearly)$")

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class ReviewCycleCreate(ReviewCycleBase):
    pass

class ReviewCycleResponse(ReviewCycleBase):
    id: str
    status: str
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewWindowResponse(BaseModel):
    id: str
    cycle_id: str
    label: str
    open_date: date
    close_date: date
    status: str

    class Config:
        from_attributes = True

# KRA/KPI schemas
class KPIBase(BaseModel):
    description: str
    target: float
    unit: str
    weight: int = Field(..., ge=1, le=100)

class KPICreate(KPIBase):
    pass

class KPIResponse(KPIBase):
    id: str
    kra_id: str
    status: str
    feedback: Optional[str] = None

    class Config:
        from_attributes = True

class KRABase(BaseModel):
    name: str
    description: Optional[str] = None

class KRACreate(KRABase):
    employee_id: str
    cycle_id: str
    kpis: List[KPICreate]

    @validator('kpis')
    def kpis_weights_must_sum_to_100(cls, v):
        total_weight = sum(kpi.weight for kpi in v)
        if total_weight != 100:
            raise ValueError('KPI weights must sum to 100%')
        return v

class KRAResponse(KRABase):
    id: str
    employee_id: str
    cycle_id: str
    status: str
    feedback: Optional[str] = None
    kpis: List[KPIResponse] = []

    class Config:
        from_attributes = True

# Review schemas
class RatingBase(BaseModel):
    score: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class RatingCreate(RatingBase):
    kpi_id: str

class RatingResponse(RatingBase):
    id: str
    kpi_id: str
    rater_id: str
    rater_type: str
    window_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class SelfReviewCreate(BaseModel):
    window_id: str
    ratings: List[RatingCreate]

class ManagerReviewCreate(BaseModel):
    window_id: str
    employee_id: str
    ratings: List[RatingCreate]
