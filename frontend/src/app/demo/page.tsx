"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, AlertTriangle, ShieldAlert, CheckCircle2, Volume2, User, Bot, Loader2 } from "lucide-react";
import { createSession, interpretTranscript, verifyResult, submitFeedback } from "@/lib/api";

export default function DemoPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionData, setSessionData] = useState<any>(null);
  const [step, setStep] = useState(0); // 0: init, 1: recording/uploading, 2: interpreting, 3: verification, 4: human, 5: done
  const [isMocking, setIsMocking] = useState(false);
  const [humanTakeover, setHumanTakeover] = useState(false);
  const [editForm, setEditForm] = useState({ category: '', location: '', issue: '' });

  // Dummy scenarios for quick demo
  const mockScenarios = [
    { name: "Distressed Caller (Broken Light)", text: "Hello, my street light is broken and it is completely dark here. It is very unsafe." },
    { name: "Confused Citizen (Tax Issue)", text: "I don't know where to pay my property tax online. The website is confusing." },
    { name: "Angry Citizen (Delay)", text: "I have been waiting for my water connection for three months! This is unacceptable." }
  ];

  const handleStartSimulatedCall = async () => {
    setIsMocking(true);
    setStep(1);
    try {
      const sess = await createSession();
      setSessionData(sess);
      
      // Await interpret directly to catch any network/backend errors
      const interpreted = await interpretTranscript(sess.id);
      setSessionData({ ...sess, ...interpreted });
      setEditForm({ category: interpreted.category, location: interpreted.location, issue: interpreted.issue });
      setStep(3);
    } catch (e) {
      console.error("Failed to interpret call:", e);
      alert("Error: Could not connect to the backend. Please ensure the FastAPI server is running on port 8000.");
    } finally {
      setIsMocking(false);
    }
  };

  const handleVerification = async (result: 'correct' | 'partial' | 'incorrect') => {
    if (!sessionData) return;
    await verifyResult(sessionData.id, result);
    
    if (result === 'correct') {
      setStep(5);
    } else {
      setHumanTakeover(true);
      setStep(4);
    }
  };

  const saveHumanEdits = async () => {
    if (!sessionData) return;
    setIsMocking(true);
    const updated = await submitFeedback(sessionData.id, { ...editForm, human_takeover: true });
    setSessionData(updated);
    setIsMocking(false);
    setStep(5);
  };

  const playRestatement = () => {
    if ('speechSynthesis' in window && sessionData?.restatement_question) {
      const utterance = new SpeechSynthesisUtterance(sessionData.restatement_question);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
      <header className="px-6 py-4 flex items-center border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <Link href="/" className="mr-4 p-2 hover:bg-white/10 rounded-full transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          Demo Simulator
        </h1>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-xs bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1 rounded-full flex items-center">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-2"></span>
            Running locally (Mock Mode Compatible)
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Simulator */}
        <div className="w-1/3 border-r border-white/10 bg-black/20 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-6 flex items-center text-blue-400">
            <User className="mr-2 w-5 h-5" /> Citizen Call Simulator
          </h2>

          <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Select a Scenario to Simulate</label>
              <div className="space-y-2">
                {mockScenarios.map((scen, idx) => (
                  <button 
                    key={idx}
                    onClick={handleStartSimulatedCall}
                    disabled={step > 0 && step < 5}
                    className="w-full text-left p-3 rounded-lg bg-black/40 hover:bg-white/10 border border-white/5 transition disabled:opacity-50"
                  >
                    <div className="font-medium">{scen.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 border-dashed">
              <Mic className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Record microphone or upload audio (Requires full backend setup)</p>
              <button disabled className="px-4 py-2 bg-blue-600/50 text-white/50 rounded-lg text-sm cursor-not-allowed">
                Start Recording
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Agent Copilot */}
        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-transparent to-blue-900/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center text-purple-400">
              <Bot className="mr-2 w-5 h-5" /> Agent Co-Pilot Dashboard
            </h2>
            
            <button 
              onClick={() => setHumanTakeover(!humanTakeover)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${humanTakeover ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'}`}
            >
              Switch to Human-led
            </button>
          </div>

          {step === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <ShieldAlert className="w-16 h-16 opacity-20 mb-4" />
              <p>Waiting for incoming call...</p>
            </div>
          )}

          {step > 0 && isMocking && step < 3 && (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-lg text-blue-400">Processing Audio & Interpreting...</span>
            </div>
          )}

          {sessionData && step >= 3 && (
            <div className="space-y-6 max-w-3xl">
              
              {/* Warnings */}
              {sessionData.urgency?.label === 'High' && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex gap-3 text-red-200">
                  <AlertTriangle className="text-red-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-400">High Distress/Urgency Detected</h4>
                    <p className="text-sm mt-1">Keywords matched: {sessionData.urgency_keywords}. Human takeover is recommended.</p>
                  </div>
                </div>
              )}

              {/* Grid Data */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                  <h3 className="text-xs uppercase text-muted-foreground mb-3 tracking-wider">AI Understanding</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="text-gray-500 w-20 inline-block">Category:</span> <span className="font-medium text-blue-100">{sessionData.category}</span></div>
                    <div><span className="text-gray-500 w-20 inline-block">Location:</span> <span className="font-medium">{sessionData.location}</span></div>
                    <div><span className="text-gray-500 w-20 inline-block">Issue:</span> <span className="font-medium">{sessionData.issue}</span></div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                  <h3 className="text-xs uppercase text-muted-foreground mb-3 tracking-wider">Signals</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Confidence</span>
                      <div className="flex-1 mx-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{width: `${(sessionData.overall_confidence || 0.8) * 100}%`}}></div>
                      </div>
                      <span className="font-mono text-xs">{((sessionData.overall_confidence || 0.8) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Sentiment</span>
                      <span className="text-amber-400 font-medium">{sessionData.sentiment_label || sessionData.sentiment?.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Block - Critical for MVP */}
              {!humanTakeover && step === 3 && (
                <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl"></div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Step 3: Verification required</h3>
                  <p className="text-sm text-blue-100/70 mb-4">Read this back to the citizen to verify facts before logging.</p>
                  
                  <div className="bg-black/40 p-4 rounded-lg flex items-start gap-4 mb-6 border border-white/5">
                    <button onClick={playRestatement} className="p-2 bg-white/10 hover:bg-white/20 rounded-full shrink-0 transition text-blue-300">
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <p className="text-lg font-medium italic text-blue-50 leading-relaxed">
                      &quot;{sessionData.restatement_question}&quot;
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => handleVerification('correct')} className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Correct
                    </button>
                    <button onClick={() => handleVerification('partial')} className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 py-3 rounded-xl font-medium transition">
                      Partially Correct
                    </button>
                    <button onClick={() => handleVerification('incorrect')} className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 py-3 rounded-xl font-medium transition">
                      Incorrect
                    </button>
                  </div>
                </div>
              )}

              {/* Human Takeover Form */}
              {(humanTakeover || step === 4) && (
                <div className="bg-amber-900/10 border border-amber-500/30 p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center">
                    <User className="mr-2 w-5 h-5" /> Human Override Mode
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">Category</label>
                      <input 
                        value={editForm.category}
                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">Issue Specifics</label>
                      <textarea 
                        value={editForm.issue}
                        onChange={e => setEditForm({...editForm, issue: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-amber-500 outline-none h-24"
                      />
                    </div>
                    <button onClick={saveHumanEdits} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl transition flex justify-center items-center">
                      {isMocking ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Corrected Record"}
                    </button>
                  </div>
                </div>
              )}

              {/* Done State */}
              {step === 5 && (
                <div className="bg-green-900/10 border border-green-500/30 p-8 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Session Saved</h3>
                  <p className="text-muted-foreground mb-6">The verified data has been logged to the system.</p>
                  <button onClick={() => { setStep(0); setSessionData(null); setHumanTakeover(false); }} className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-2 rounded-full transition">
                    Start New Call
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
