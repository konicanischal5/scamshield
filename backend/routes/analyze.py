from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.claude_service import analyze_scam
from services.database import get_similar_reports, save_analysis

router = APIRouter()

class AnalyzeRequest(BaseModel):
    message: str

@router.post("/")
def analyze(request: AnalyzeRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(request.message) > 5000:
        raise HTTPException(status_code=400, detail="Message too long (max 5000 chars)")

    similar = get_similar_reports(request.message)
    similar_count = len(similar)

    result = analyze_scam(request.message, similar_count)
    result["past_reports"] = similar[:3]
    save_analysis(request.message, result)
    return result
