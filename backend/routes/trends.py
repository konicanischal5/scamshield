from fastapi import APIRouter
from services.database import get_stats, get_leaderboard

router = APIRouter()

@router.get("/stats")
def get_trends():
    return get_stats()

@router.get("/leaderboard")
def leaderboard():
    return get_leaderboard()
