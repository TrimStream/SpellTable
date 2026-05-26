from pydantic import BaseModel, EmailStr
from typing import Optional


# TODO: replace str with EmailStr for email fields once email-validator is added to requirements.txt
class RegisterRequest(BaseModel):
    email: str
    password: str
    username: str
    skill_level: Optional[str] = None
    archetype: Optional[str] = None
    scenarios_completed: Optional[list] = None


class LoginRequest(BaseModel):
    identifier: str
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    skill_level: Optional[str] = None
    archetype: Optional[str] = None
    verified: bool = False

class RefreshRequest(BaseModel):
    refresh_token: str