from fastapi import Depends, HTTPException, Header
from typing import Optional
from auth_jwt import decode_token
from database import db
from bson import ObjectId


async def get_current_user(authorization: Optional[str] = Header(None)):
    if authorization is None or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ")[1]
    payload = decode_token(token)

    if payload is None:
        return None

    if payload.get("type") != "access":
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return user


async def require_current_user(user=Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user