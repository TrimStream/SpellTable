from auth_password import verify_password, hash_password
from fastapi import APIRouter, Depends, HTTPException
from database import db
from dependencies import require_current_user
from bson import ObjectId
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/users", tags=["users"])


class ChoiceRecord(BaseModel):
    step_id: str
    choice_id: str
    label: str
    quality: str
    # 'best', 'ok', or 'blunder'


class ScenarioCompletionRequest(BaseModel):
    scenario_id: str
    choices: List[ChoiceRecord]


def completion_is_perfect(choices: list) -> bool:
    # A completion is perfect only if every choice was 'best'.
    return all(c.get("quality") == "best" for c in choices)


def completion_has_no_blunders(choices: list) -> bool:
    return all(c.get("quality") != "blunder" for c in choices)


@router.get("/me/dashboard")
async def get_dashboard(user=Depends(require_current_user)):
    scenarios_completed = user.get("scenariosCompleted", [])
    total = len(scenarios_completed)

    # ── Score calculation ──
    # Perfect: all choices were 'best' (counts as correct for legacy metric)
    # No blunders: acceptable line, counted as partial credit
    # Has blunders: incorrect
    perfect = sum(1 for s in scenarios_completed if completion_is_perfect(s.get("choices", [])))
    no_blunders = sum(1 for s in scenarios_completed if completion_has_no_blunders(s.get("choices", [])))

    # Accuracy based on no-blunder completions
    accuracy = round((no_blunders / total) * 100) if total > 0 else 0

    unique_scenarios = list({s["scenarioId"] for s in scenarios_completed})

    return {
        "total_attempted": total,
        "total_correct": perfect,
        "accuracy": accuracy,
        "scenarios_completed": scenarios_completed,
        "bookmarks": user.get("bookmarks", []),
        "skill_level": user.get("skillLevel"),
        "archetype": user.get("archetype"),
        "member_since": user.get("createdAt"),
        "unique_scenarios_count": len(unique_scenarios)
    }


@router.post("/me/scenarios")
async def record_scenario_completion(
    body: ScenarioCompletionRequest,
    user=Depends(require_current_user)
):
    user_id = user["_id"]
    now = datetime.now(timezone.utc)

    completion = {
        "scenarioId": body.scenario_id,
        "choices": [
            {
                "stepId": c.step_id,
                "choiceId": c.choice_id,
                "label": c.label,
                "quality": c.quality,
            }
            for c in body.choices
        ],
        "completedAt": now
    }

    await db.users.update_one(
        {"_id": user_id},
        {"$push": {"scenariosCompleted": completion}}
    )

    return {"status": "recorded"}


class BookmarkRequest(BaseModel):
    scenario_id: str


@router.post("/me/bookmarks")
async def add_bookmark(body: BookmarkRequest, user=Depends(require_current_user)):
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$addToSet": {"bookmarks": body.scenario_id}}
    )
    return {"status": "bookmarked"}


@router.delete("/me/bookmarks/{scenario_id}")
async def remove_bookmark(scenario_id: str, user=Depends(require_current_user)):
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$pull": {"bookmarks": scenario_id}}
    )
    return {"status": "removed"}


@router.get("/me/bookmarks")
async def get_bookmarks(user=Depends(require_current_user)):
    return {"bookmarks": user.get("bookmarks", [])}


class ChangeUsernameRequest(BaseModel):
    new_username: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.patch("/me/username")
async def change_username(body: ChangeUsernameRequest, user=Depends(require_current_user)):
    existing = await db.users.find_one({"username": body.new_username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"username": body.new_username}}
    )
    return {"username": body.new_username}


@router.patch("/me/password")
async def change_password(body: ChangePasswordRequest, user=Depends(require_current_user)):
    if not verify_password(body.current_password, user["passwordHash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"passwordHash": hash_password(body.new_password)}}
    )
    return {"status": "updated"}