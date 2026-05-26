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