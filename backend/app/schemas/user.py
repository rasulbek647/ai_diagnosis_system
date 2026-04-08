from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime


class AuthLoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthRegisterIn(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user: UserOut


class UserRoleUpdateIn(BaseModel):
    role: str
