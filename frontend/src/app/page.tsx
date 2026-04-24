import Link from 'next/link';
import { ArrowRight, Mic, ShieldCheck, Database } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <header className="px-8 flex items-center h-20 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-primary-foreground">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          BhashaSetu <span className="text-blue-500">1092</span>
        </div>
        <nav className="ml-auto flex gap-6">
          <Link href="/demo" className="text-sm font-medium hover:text-blue-400 transition-colors">Demo Simulator</Link>
          <Link href="/admin" className="text-sm font-medium hover:text-blue-400 transition-colors">Call Records</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="space-y-6 max-w-4xl z-10">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400 backdrop-blur-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Hackathon MVP v1.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Verify-First Multilingual <br className="hidden md:block"/> Voice Co-Pilot
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Empowering citizen helplines with AI that listens, translates, and most importantly, <span className="text-blue-400 font-medium">verifies</span> before action.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link 
              href="/demo" 
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all hover:scale-105"
            >
              Start Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/admin" 
              className="inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 px-8 py-4 text-base font-semibold hover:bg-white/10 transition-all"
            >
              View Saved Calls
              <Database className="ml-2 w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Workflow Diagram */}
        <div className="mt-24 max-w-5xl w-full grid grid-cols-1 md:grid-cols-4 gap-6 px-4 z-10 pb-20">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
            <Mic className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">1. Voice In</h3>
            <p className="text-sm text-muted-foreground">Citizen speaks in their native language or dialect.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 font-bold text-xl">AI</div>
            <h3 className="text-lg font-semibold mb-2">2. Understanding</h3>
            <p className="text-sm text-muted-foreground">Fast transcription and sentiment analysis extracts key details.</p>
          </div>
          <div className="bg-white/5 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-sm text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10"></div>
            <ShieldCheck className="w-8 h-8 text-blue-400 mb-4 relative z-10" />
            <h3 className="text-lg font-semibold mb-2 relative z-10 text-blue-100">3. Verification</h3>
            <p className="text-sm text-blue-200/80 relative z-10">AI restates the issue. Citizen confirms before saving.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4 font-bold">H</div>
            <h3 className="text-lg font-semibold mb-2">4. Human Takeover</h3>
            <p className="text-sm text-muted-foreground">Seamless handover for distress calls or low confidence.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
