from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.database import save_report, get_all_reports, upvote_report

router = APIRouter()

class ReportRequest(BaseModel):
    message_text: str
    scam_type: str
    danger_level: str
    phone_number: Optional[str] = ""
    reported_by: Optional[str] = "Anonymous"
    state: Optional[str] = "Unknown"

@router.post("/")
def submit_report(report: ReportRequest):
    save_report(
        report.message_text,
        report.scam_type,
        report.danger_level,
        report.phone_number,
        report.reported_by,
        report.state
    )
    return {"message": "Report submitted. Thank you for protecting the community!"}

@router.get("/")
def get_reports():
    return get_all_reports(limit=50)

@router.post("/{report_id}/upvote")
def upvote(report_id: int):
    upvote_report(report_id)
    return {"message": "Upvoted"}
