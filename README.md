# BhashaSetu 1092 MVP 🎙️🇮🇳

BhashaSetu 1092 is a **verify-first multilingual voice co-pilot** designed for citizen helplines. It listens to a citizen's query, translates and understands it, and forces a **verification step** before taking action.

## Hackathon Features
- **Verification First**: AI restates its understanding and requires the citizen to confirm.
- **Multilingual Pipeline**: Integrates Whisper ASR and NLP sentiment heuristics.
- **Human Takeover**: If the caller is highly distressed or the AI is uncertain, the system prompts human intervention.
- **Mac/Hackathon Optimized**: Includes a `MOCK_MODE` to guarantee zero failures during live demos without downloading massive models on slow wifi.

---

## 🍏 Mac Quickstart (Apple Silicon / Intel)

### 1. Prerequisites
Open your terminal and ensure you have these installed:
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required dependencies
brew install ffmpeg
brew install node@20
brew install python@3.11

# For Apple Silicon, ensure Node is in PATH:
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
# Important: For the safest live demo, keep MOCK_MODE=true in .env
uvicorn main:app --reload --port 8000
```
*If you are running on Apple Silicon and want to test real inference, set `MOCK_MODE=false`. The pipeline uses optimized `int8` CPU inference for faster-whisper.*

### 3. Frontend Setup
Open a **new terminal tab**:
```bash
cd frontend
npm install
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

---

## 🎬 Judge Demo Script (90 Seconds)

1. **Open the App**: Navigate to `localhost:3000`. Show the landing page and briefly highlight the 4-step diagram (Voice In -> AI Understanding -> Verification -> Human Takeover).
2. **Start Demo**: Click **"Start Demo"**. 
3. **Simulate Call**: In the left panel, click **"Distressed Caller (Broken Light)"**.
   - *Narrative*: "Let's simulate a call coming into the 1092 helpline."
4. **Agent Dashboard**: Point to the right panel.
   - *Highlight*: "The AI instantly extracts the category (Maintenance) and shows the confidence meter."
   - *Highlight Alert*: Point out the Red Alert box. "Because the sentiment is distressed, the AI recommends Human Takeover."
5. **The Verification Step**: 
   - *Narrative*: "Before we submit this ticket, the AI generates a restatement question: *'I understood you have a broken street light. Is that correct?'*"
   - Click the **Play Audio** icon (uses browser TTS) to show how it would sound to the caller.
6. **Capture Feedback**: 
   - *Narrative*: "If the caller says yes, we click **Correct**." (Click it).
7. **View Admin**: Go to **Call Records** (top nav) and show the saved entry in the SQLite database, proving end-to-end functionality.

---

## Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, shadcn/ui.
- **Backend**: Python 3.11, FastAPI, SQLModel (SQLite).
- **Audio Processing**: `ffmpeg-python`.
- **AI/ML**: `faster-whisper`, `transformers` (XLM-RoBERTa for sentiment).
# BHASA_SETU
