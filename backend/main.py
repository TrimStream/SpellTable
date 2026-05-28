from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import db
from routers.auth import router as auth_router
from routers.users import router as users_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://trainingark.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)

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

@app.get("/board-states/{board_state_id}")
async def get_board_state(board_state_id: str):
    board_state = await db.boardStates.find_one(
        {"id": board_state_id},
        {"_id": 0}
    )
    if board_state is None:
        raise HTTPException(status_code=404, detail="Board state not found")
    return board_state