from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Optional
import os

from database import (
    create_db_and_tables, get_session, CallSession, CallSessionCreate, CallSessionUpdate
)
from ml_pipeline import (
    init_models, convert_to_wav, transcribe_audio, generate_interpretation
)

app = FastAPI(title="BhashaSetu 1092 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    init_models()

@app.post("/api/session", response_model=CallSession)
def create_session(session: Session = Depends(get_session)):
    db_session = CallSession()
    session.add(db_session)
    session.commit()
    session.refresh(db_session)
    return db_session

@app.post("/api/transcribe")
async def transcribe(
    session_id: int = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_session)
):
    db_session = db.get(CallSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    audio_bytes = await audio.read()
    wav_path = convert_to_wav(audio_bytes)
    
    try:
        results = transcribe_audio(wav_path)
    finally:
        if os.path.exists(wav_path):
            os.remove(wav_path)
            
    db_session.transcript = results["transcript"]
    db_session.detected_language = results["detected_language"]
    db_session.asr_confidence = results["asr_confidence"]
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    return results

@app.post("/api/interpret")
def interpret(
    session_id: int = Form(...),
    dialect_hint: Optional[str] = Form(None),
    agent_language: Optional[str] = Form("English"),
    db: Session = Depends(get_session)
):
    db_session = db.get(CallSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if not db_session.transcript:
        from ml_pipeline import settings
        if settings.mock_mode:
            db_session.transcript = "Mock transcript: Caller is reporting a broken street light."
            db_session.asr_confidence = 0.95
            db_session.detected_language = "English"
        else:
            raise HTTPException(status_code=400, detail="No transcript available to interpret")

    results = generate_interpretation(db_session.transcript, db_session.asr_confidence or 0.8)
    
    db_session.normalized_summary = results["normalized_summary"]
    db_session.category = results["category"]
    db_session.location = results["location"]
    db_session.issue = results["issue"]
    db_session.people = results["people"]
    db_session.time_info = results["time_info"]
    db_session.sentiment_label = results["sentiment"]["label"]
    db_session.sentiment_score = results["sentiment"]["score"]
    db_session.urgency_label = results["urgency"]["label"]
    db_session.urgency_score = results["urgency"]["score"]
    db_session.urgency_keywords = results["urgency"]["keywords"]
    db_session.overall_confidence = results["overall_confidence"]
    db_session.restatement_question = results["restatement_question"]
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    return results

@app.post("/api/verify")
def verify(
    session_id: int = Form(...),
    verification_result: str = Form(...),
    db: Session = Depends(get_session)
):
    db_session = db.get(CallSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    db_session.verification_result = verification_result
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return {"status": "ok", "verification_result": verification_result}

@app.post("/api/feedback")
def feedback(
    session_id: int = Form(...),
    category: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    issue: Optional[str] = Form(None),
    feedback_notes: Optional[str] = Form(None),
    human_takeover: bool = Form(True),
    db: Session = Depends(get_session)
):
    db_session = db.get(CallSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if category: db_session.category = category
    if location: db_session.location = location
    if issue: db_session.issue = issue
    if feedback_notes: db_session.feedback_notes = feedback_notes
    db_session.human_takeover = human_takeover
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.get("/api/sessions", response_model=List[CallSession])
def get_sessions(db: Session = Depends(get_session)):
    sessions = db.exec(select(CallSession).order_by(CallSession.id.desc())).all()
    return sessions

@app.get("/api/sessions/{session_id}", response_model=CallSession)
def get_session_by_id(session_id: int, db: Session = Depends(get_session)):
    db_session = db.get(CallSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db_session
