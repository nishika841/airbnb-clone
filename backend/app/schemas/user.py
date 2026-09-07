from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None
    is_host: bool = False
    is_superhost: bool = False
    joined_date: Optional[str] = "Joined recently"

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
