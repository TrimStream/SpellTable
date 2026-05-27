from fastapi import APIRouter, HTTPException, Depends
from database import db
from auth_schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse, RefreshRequest
from auth_password import hash_password, verify_password
from auth_jwt import create_access_token, create_refresh_token, decode_token
from datetime import datetime, timezone
from dependencies import require_current_user
from bson import ObjectId
from email_service import send_verification_email, generate_verification_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest):
    # check if email already exists
    existing = await db.users.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # check if username already exists
    existing_username = await db.users.find_one({"username": body.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    # build the user document
    now = datetime.now(timezone.utc)
    user = {
        "email": body.email,
        "username": body.username,
        "passwordHash": hash_password(body.password),
        "provider": "local",
        "providerId": None,
        "skillLevel": body.skill_level,
        "archetype": body.archetype,
        "scenariosCompleted": body.scenarios_completed or [],
        "bookmarks": [],
        "friends": [],
        "connectedAccounts": {
            "topdeck": None,
            "moxfield": None,
            "discord": None
        },
        "createdAt": now,
        "verified": True,
        "verificationToken": None,
    }

    result = await db.users.insert_one(user)
    user_id = str(result.inserted_id)

    # TODO: Uncomment when custom domain is added to Resend
    # Resend free tier only sends to verified email addresses (your own Resend account email)
    # Once a custom domain is configured, change from address to noreply@yourdomain.com
    # base_url = "https://trainingark.vercel.app"
    # await send_verification_email(
    #     user["email"],
    #     user["username"],
    #     user["verificationToken"],
    #     base_url
    # )

    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = await db.users.find_one({
        "$or": [
            {"email": body.identifier},
            {"username": body.identifier}
        ]
    })

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(body.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id}) if body.remember_me else None

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.get("/me", response_model=UserResponse)
async def me(user=Depends(require_current_user)):
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        username=user["username"],
        skill_level=user.get("skillLevel"),
        archetype=user.get("archetype"),
        verified=user.get("verified", False)
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest):
    payload = decode_token(body.refresh_token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token({"sub": user_id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=None
    )

@router.get("/verify-email")
async def verify_email(token: str):
    user = await db.users.find_one({"verificationToken": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"verified": True, "verificationToken": None}}
    )
    return {"status": "verified"}

# TODO: Uncomment when custom domain is added to Resend
# @router.post("/resend-verification")
# async def resend_verification(user=Depends(require_current_user)):
#     if user.get("verified"):
#         return {"status": "already verified"}
#     token = generate_verification_token()
#     await db.users.update_one(
#         {"_id": user["_id"]},
#         {"$set": {"verificationToken": token}}
#     )
#     base_url = "https://trainingark.vercel.app"
#     await send_verification_email(user["email"], user["username"], token, base_url)
#     return {"status": "sent"}