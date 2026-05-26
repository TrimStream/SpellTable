from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import db
from routers.auth import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://trainingark.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
async def root():
    return {"status": "online"}

@app.get("/scenarios")
async def get_scenarios():
    cursor = db.scenarios.find(
        {"status": "published"},
        {"_id": 0, "players": 0}
    )
    scenarios = await cursor.to_list(length=100)
    return scenarios

@app.get("/scenarios/{scenario_id}")
async def get_scenario(scenario_id: str):
    scenario = await db.scenarios.find_one(
        {"id": scenario_id, "status": "published"},
        {"_id": 0}
    )
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario