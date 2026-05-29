from fastapi import APIRouter, HTTPException
from database import db

router = APIRouter(prefix="/board-states", tags=["board-states"])

@router.get("/{board_state_id}")
async def get_board_state(board_state_id: str):
    board_state = await db.boardStates.find_one(
        {"id": board_state_id},
        {"_id": 0}
    )
    if board_state is None:
        raise HTTPException(status_code=404, detail="Board state not found")
    return board_state