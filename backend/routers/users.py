from fastapi import APIRouter, Depends
from database import db
from dependencies import require_current_user
from bson import ObjectId
from datetime import datetime, timezone
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])


class ScenarioCompletionRequest(BaseModel):
    scenario_id: str
    correct: bool

@router.get("/me/dashboard")
async def get_dashboard(user=Depends(require_current_user)):
    scenarios_completed = user.get("scenariosCompleted", [])
    total = len(scenarios_completed)
    correct = sum(1 for s in scenarios_completed if s.get("correct"))
    accuracy = round((correct / total) * 100) if total > 0 else 0

    unique_scenarios = list({s["scenarioId"] for s in scenarios_completed})

    return {
        "total_attempted": total,
        "total_correct": correct,
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
        "correct": body.correct,
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