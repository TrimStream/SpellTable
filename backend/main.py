from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.scenarios import router as scenarios_router
from routers.board_states import router as board_states_router
from routers.builder import router as builder_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://trainingark.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(scenarios_router)
app.include_router(board_states_router)
app.include_router(builder_router)

@app.get("/")
async def root():
    return {"status": "online"}