from fastapi import APIRouter, HTTPException
from database import db

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

@router.get("")
async def get_scenarios():
    cursor = db.scenarios.find(
        {"status": "published"},
        {"_id": 0, "players": 0}
    )
    scenarios = await cursor.to_list(length=100)
    return scenarios

@router.get("/{scenario_id}")
async def get_scenario(scenario_id: str):
    scenario = await db.scenarios.find_one(
        {"id": scenario_id, "status": "published"},
        {"_id": 0}
    )
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario