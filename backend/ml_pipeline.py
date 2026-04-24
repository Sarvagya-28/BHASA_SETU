import os
import tempfile
import ffmpeg
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    mock_mode: bool = os.getenv("MOCK_MODE", "true").lower() == "true"

settings = Settings()

# Global Model References
whisper_model = None
sentiment_analyzer = None

def init_models():
    """Load models if we are not in mock mode."""
    global whisper_model, sentiment_analyzer
    if settings.mock_mode:
        print("MOCK_MODE is enabled. Skipping heavy model loading.")
        return

    print("Loading Faster-Whisper (Small, Int8)...")
    from faster_whisper import WhisperModel
    # Int8 on CPU is generally fast and safe for Apple Silicon / Intel Macs
    whisper_model = WhisperModel("small", device="cpu", compute_type="int8")

    print("Loading Sentiment Analyzer...")
    try:
        from transformers import pipeline
        sentiment_analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-xlm-roberta-base-sentiment", device=-1)
    except Exception as e:
        print(f"Could not load sentiment analyzer: {e}. Will fallback to heuristics.")

def convert_to_wav(audio_bytes: bytes) -> str:
    """Uses ffmpeg to convert any uploaded audio to 16kHz mono WAV for whisper."""
    fd, temp_in = tempfile.mkstemp(suffix=".tmp")
    with os.fdopen(fd, 'wb') as f:
        f.write(audio_bytes)
    
    fd_out, temp_out = tempfile.mkstemp(suffix=".wav")
    os.close(fd_out) # We just need the path

    try:
        (
            ffmpeg
            .input(temp_in)
            .output(temp_out, format='wav', acodec='pcm_s16le', ac=1, ar='16000')
            .overwrite_output()
            .run(quiet=True)
        )
    except ffmpeg.Error as e:
        os.remove(temp_in)
        os.remove(temp_out)
        raise RuntimeError(f"FFmpeg error: {e.stderr}")
    
    os.remove(temp_in)
    return temp_out

def transcribe_audio(audio_path: str) -> dict:
    if settings.mock_mode:
        # Provide deterministic output
        return {
            "transcript": "Hello, I am calling because my street light is broken and it is very dark here. Please fix it immediately.",
            "detected_language": "English",
            "asr_confidence": 0.95
        }
    
    segments, info = whisper_model.transcribe(audio_path, beam_size=5)
    transcript = " ".join([segment.text for segment in segments])
    
    return {
        "transcript": transcript.strip(),
        "detected_language": info.language,
        "asr_confidence": info.language_probability
    }

def analyze_sentiment(text: str) -> dict:
    if settings.mock_mode or not sentiment_analyzer:
        # Heuristic fallback
        text_lower = text.lower()
        if any(w in text_lower for w in ["urgent", "immediately", "help", "broken", "angry"]):
            return {"label": "Negative/Distressed", "score": 0.85}
        return {"label": "Neutral", "score": 0.90}

    results = sentiment_analyzer(text)
    # Mapping XLM-R labels
    label_map = {
        "negative": "Distressed/Negative",
        "neutral": "Calm/Neutral",
        "positive": "Calm/Positive"
    }
    raw_label = results[0]['label']
    return {
        "label": label_map.get(raw_label, raw_label),
        "score": results[0]['score']
    }

def calculate_urgency(text: str, sentiment_label: str) -> dict:
    urgency_keywords = ["urgent", "immediately", "help", "fast", "emergency", "abused", "harassment"]
    text_lower = text.lower()
    
    found_keywords = [kw for kw in urgency_keywords if kw in text_lower]
    
    if len(found_keywords) > 0 or "Distressed" in sentiment_label:
        return {
            "label": "High",
            "score": 0.9,
            "keywords": ", ".join(found_keywords) if found_keywords else "distress inferred"
        }
    return {
        "label": "Low",
        "score": 0.2,
        "keywords": ""
    }

def generate_interpretation(transcript: str, asr_confidence: float) -> dict:
    if settings.mock_mode:
        return {
            "normalized_summary": "Caller is reporting a broken street light needing immediate repair.",
            "category": "Maintenance",
            "location": "Unspecified Street",
            "issue": "Broken Street Light",
            "people": "Caller",
            "time_info": "Current",
            "sentiment": {"label": "Distressed/Negative", "score": 0.85},
            "urgency": {"label": "High", "score": 0.9, "keywords": "immediately, broken"},
            "overall_confidence": 0.88,
            "restatement_question": "I understood that you have a broken street light that needs immediate fixing. Is that correct?"
        }

    # Simplistic heuristic extraction for non-mock fallback
    sentiment = analyze_sentiment(transcript)
    urgency = calculate_urgency(transcript, sentiment["label"])
    
    # Very basic summary / extraction for the demo without OpenAI
    summary = f"Caller reported: {transcript[:50]}..."
    
    return {
        "normalized_summary": summary,
        "category": "General Inquiry/Complaint",
        "location": "Unknown",
        "issue": "Review Transcript",
        "people": "Unknown",
        "time_info": "Unknown",
        "sentiment": sentiment,
        "urgency": urgency,
        "overall_confidence": min(asr_confidence, 0.7), # Caps at 0.7 to show "Recommend Takeover" if needed
        "restatement_question": f"I understood you said: '{summary}'. Is that correct?"
    }
