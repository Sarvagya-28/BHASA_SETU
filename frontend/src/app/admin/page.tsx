"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Database } from "lucide-react";
import { getSessions } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="text-blue-500" />
            Saved Calls
          </h1>
        </div>
        <button 
          onClick={fetchSessions}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <main className="max-w-6xl mx-auto bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No call sessions found. Go to the Demo to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10 text-sm font-medium text-muted-foreground">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Language</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Agent Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-white/5 transition">
                    <td className="p-4 font-mono text-blue-400">#{session.id}</td>
                    <td className="p-4">{new Date(session.created_at).toLocaleString()}</td>
                    <td className="p-4">{session.detected_language || "N/A"}</td>
                    <td className="p-4">{session.category || "N/A"}</td>
                    <td className="p-4">
                      {session.urgency_label === 'High' ? (
                        <Badge variant="destructive">High</Badge>
                      ) : session.urgency_label === 'Medium' ? (
                        <Badge className="bg-amber-500/20 text-amber-500">Medium</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-500 border-green-500/30">Low</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {session.verification_result === 'correct' ? (
                        <Badge className="bg-green-500/20 text-green-500">Correct</Badge>
                      ) : session.verification_result === 'partial' ? (
                        <Badge className="bg-amber-500/20 text-amber-500">Partial</Badge>
                      ) : session.verification_result === 'incorrect' ? (
                        <Badge variant="destructive">Incorrect</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {session.human_takeover ? (
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400">Human Led</Badge>
                      ) : (
                        <span className="text-muted-foreground">AI Auto</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
