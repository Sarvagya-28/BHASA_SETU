from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional
from datetime import datetime

sqlite_file_name = "bhashasetu.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=False, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

class CallSessionBase(SQLModel):
    detected_language: Optional[str] = None
    asr_confidence: Optional[float] = None
    transcript: Optional[str] = None
    normalized_summary: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    issue: Optional[str] = None
    people: Optional[str] = None
    time_info: Optional[str] = None
    sentiment_label: Optional[str] = None
    sentiment_score: Optional[float] = None
    urgency_label: Optional[str] = None
    urgency_score: Optional[float] = None
    urgency_keywords: Optional[str] = None
    overall_confidence: Optional[float] = None
    restatement_question: Optional[str] = None
    verification_result: Optional[str] = None # correct, partial, incorrect
    human_takeover: bool = False
    feedback_notes: Optional[str] = None

class CallSession(CallSessionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CallSessionCreate(CallSessionBase):
    pass

class CallSessionUpdate(SQLModel):
    detected_language: Optional[str] = None
    asr_confidence: Optional[float] = None
    transcript: Optional[str] = None
    normalized_summary: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    issue: Optional[str] = None
    people: Optional[str] = None
    time_info: Optional[str] = None
    sentiment_label: Optional[str] = None
    sentiment_score: Optional[float] = None
    urgency_label: Optional[str] = None
    urgency_score: Optional[float] = None
    urgency_keywords: Optional[str] = None
    overall_confidence: Optional[float] = None
    restatement_question: Optional[str] = None
    verification_result: Optional[str] = None
    human_takeover: Optional[bool] = None
    feedback_notes: Optional[str] = None
