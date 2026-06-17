from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import analyze, reports, trends
from services.database import init_db

app = FastAPI(title="ScamShield API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(trends.router, prefix="/api/trends", tags=["Trends"])

@app.get("/")
def root():
    return {"message": "ScamShield API running", "status": "healthy"}
