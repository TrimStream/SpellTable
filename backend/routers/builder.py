from fastapi import APIRouter, HTTPException, Depends
from database import db
from dependencies import require_current_user
from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional
import uuid

router = APIRouter(prefix="/builder", tags=["builder"])


def new_scenario_id():
    return f"scenario-{uuid.uuid4().hex[:8]}"


# --- Draft CRUD ---

@router.post("/scenarios")
async def create_draft(user=Depends(require_current_user)):
    now = datetime.now(timezone.utc)
    scenario = {
        "id": new_scenario_id(),
        "title": "",
        "description": "",
        "difficulty": "beginner",
        "archetypes": [],
        "commanders": [],
        "tags": [],
        "status": "draft",
        "authorId": user["_id"],
        "authorUsername": user["username"],
        "reviewedBy": None,
        "createdAt": now,
        "startStepId": None,
        "steps": [],
        "players": []
    }
    result = await db.scenarios.insert_one(scenario)
    scenario["_id"] = str(result.inserted_id)
    scenario["authorId"] = str(scenario["authorId"])
    return scenario


@router.get("/scenarios")
async def get_my_scenarios(user=Depends(require_current_user)):
    cursor = db.scenarios.find(
        {"authorId": user["_id"]},
        {"_id": 0, "players": 0}
    )
    scenarios = await cursor.to_list(length=100)
    for s in scenarios:
        s["authorId"] = str(s["authorId"])
    return scenarios


@router.get("/scenarios/{scenario_id}")
async def get_draft(scenario_id: str, user=Depends(require_current_user)):
    scenario = await db.scenarios.find_one({"id": scenario_id})
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if scenario.get("status") != "draft" and str(scenario.get("authorId")) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    scenario["_id"] = str(scenario["_id"])
    scenario["authorId"] = str(scenario.get("authorId"))
    return scenario


@router.put("/scenarios/{scenario_id}")
async def update_draft(scenario_id: str, body: dict, user=Depends(require_current_user)):
    scenario = await db.scenarios.find_one({"id": scenario_id})
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if str(scenario.get("authorId")) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    if scenario.get("status") == "published":
        raise HTTPException(status_code=400, detail="Cannot edit a published scenario")

    # Strip fields the client should not overwrite
    body.pop("_id", None)
    body.pop("authorId", None)
    body.pop("authorUsername", None)
    body.pop("createdAt", None)
    body.pop("status", None)

    await db.scenarios.update_one(
        {"id": scenario_id},
        {"$set": body}
    )
    return {"status": "updated"}


@router.delete("/scenarios/{scenario_id}")
async def delete_draft(scenario_id: str, user=Depends(require_current_user)):
    scenario = await db.scenarios.find_one({"id": scenario_id})
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if str(scenario.get("authorId")) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    if scenario.get("status") == "published":
        raise HTTPException(status_code=400, detail="Cannot delete a published scenario")
    await db.scenarios.delete_one({"id": scenario_id})
    return {"status": "deleted"}


@router.post("/scenarios/{scenario_id}/submit")
async def submit_scenario(scenario_id: str, user=Depends(require_current_user)):
    scenario = await db.scenarios.find_one({"id": scenario_id})
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if str(scenario.get("authorId")) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    if scenario.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Only drafts can be submitted")
    await db.scenarios.update_one(
        {"id": scenario_id},
        {"$set": {"status": "pending"}}
    )
    return {"status": "submitted"}


# --- Board state snapshot (step 1 only) ---

@router.post("/board-states")
async def save_board_state(body: dict, user=Depends(require_current_user)):
    # Verify the scenario belongs to this user
    scenario_id = body.get("scenarioId")
    scenario = await db.scenarios.find_one({"id": scenario_id})
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if str(scenario.get("authorId")) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Upsert -- replace if it already exists for this step
    await db.boardStates.replace_one(
        {"id": body.get("id")},
        body,
        upsert=True
    )
    return {"status": "saved"}


# --- Board state diffs (all steps after step 1) ---

@router.post("/board-state-diffs")
async def save_board_state_diff(body: dict, user=Depends(require_current_user)):
    scenario_id = body.get("scenarioId")
    scenario = await db.scenarios.find_one({"id": scenario_id})
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if str(scenario.get("authorId")) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.boardStateDiffs.replace_one(
        {"id": body.get("id")},
        body,
        upsert=True
    )
    return {"status": "saved"}


# --- Compile board state snapshot from diff chain ---

@router.get("/compile/{scenario_id}/{step_id}")
async def compile_board_state(scenario_id: str, step_id: str):
    scenario = await db.scenarios.find_one({"id": scenario_id})
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")

    steps = scenario.get("steps", [])
    start_step_id = scenario.get("startStepId")

    # Walk step chain from start to target
    ordered_step_ids = []
    current_id = start_step_id
    while current_id:
        ordered_step_ids.append(current_id)
        if current_id == step_id:
            break
        step = next((s for s in steps if s["id"] == current_id), None)
        if step is None:
            raise HTTPException(status_code=400, detail=f"Step {current_id} not found in scenario")
        # Follow first nextStepId (linear chain for compilation)
        next_id = step.get("nextStepId")
        if not next_id:
            # Check choices for nextStepId
            dp = step.get("decisionPoint")
            if dp and dp.get("choices"):
                next_id = dp["choices"][0].get("nextStepId")
        current_id = next_id

    if step_id not in ordered_step_ids:
        raise HTTPException(status_code=400, detail="Target step not reachable from start")

    # Fetch base snapshot for first step
    first_step_id = ordered_step_ids[0]
    first_bs_id = next(
        (s.get("boardStateId") for s in steps if s["id"] == first_step_id),
        None
    )
    if first_bs_id is None:
        raise HTTPException(status_code=400, detail="No board state for first step")

    snapshot = await db.boardStates.find_one({"id": first_bs_id}, {"_id": 0})
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Base board state not found")

    # Apply diffs for each subsequent step
    for sid in ordered_step_ids[1:]:
        diff_id = f"{scenario_id}-{sid}"
        diff_doc = await db.boardStateDiffs.find_one({"id": diff_id}, {"_id": 0})
        if diff_doc is None:
            continue  # No diffs for this step, board state unchanged
        snapshot = apply_diffs(snapshot, diff_doc.get("diffs", []))

    snapshot["stepId"] = step_id
    return snapshot


def apply_diffs(snapshot: dict, diffs: list) -> dict:
    import copy
    s = copy.deepcopy(snapshot)

    for diff in diffs:
        t = diff["type"]

        if t == "set_life":
            player = _get_player(s, diff["player"])
            if player:
                player["life"] = diff["value"]

        elif t == "set_commander_tax":
            player = _get_player(s, diff["player"])
            if player:
                player["commanderTax"] = diff["value"]

        elif t == "tap_card":
            card = _find_card_in_player(s, diff["player"], diff["cardId"])
            if card:
                card["tapped"] = True

        elif t == "untap_card":
            card = _find_card_in_player(s, diff["player"], diff["cardId"])
            if card:
                card["tapped"] = False

        elif t == "move_card":
            from_player_id, from_zone = diff["from"].split(".")
            to_player_id, to_zone = diff["to"].split(".")
            from_player = _get_player(s, from_player_id)
            to_player = _get_player(s, to_player_id)
            if from_player and to_player:
                zone_cards = from_player["zones"][from_zone]["cards"]
                card = next((c for c in zone_cards if c["id"] == diff["cardId"]), None)
                if card:
                    from_player["zones"][from_zone]["cards"].remove(card)
                    to_player["zones"][to_zone]["cards"].append(card)

        elif t == "add_card":
            player = _get_player(s, diff["player"])
            if player:
                player["zones"][diff["zone"]]["cards"].append(diff["card"])

        elif t == "remove_card":
            player = _get_player(s, diff["player"])
            if player:
                zone_cards = player["zones"][diff["zone"]]["cards"]
                player["zones"][diff["zone"]]["cards"] = [
                    c for c in zone_cards if c["id"] != diff["cardId"]
                ]

        elif t == "set_card_count":
            player = _get_player(s, diff["player"])
            if player:
                player["zones"][diff["zone"]]["cardCount"] = diff["value"]

        elif t == "add_stack_item":
            s["stack"].append(diff["item"])

        elif t == "remove_stack_item":
            s["stack"] = [i for i in s["stack"] if i["id"] != diff["stackItemId"]]

        elif t == "clear_stack":
            s["stack"] = []

    return s


def _get_player(snapshot: dict, player_id: str):
    return next((p for p in snapshot["players"] if p["id"] == player_id), None)


def _find_card_in_player(snapshot: dict, player_id: str, card_id: str):
    player = _get_player(snapshot, player_id)
    if not player:
        return None
    for zone in player["zones"].values():
        for card in zone.get("cards", []):
            if card["id"] == card_id:
                return card
    return None