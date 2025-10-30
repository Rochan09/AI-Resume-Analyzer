import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, CalendarClock, ListChecks } from 'lucide-react';

type Session = {
  _id: string;
  startedAt?: string;
  endedAt?: string;
  durationSec?: number;
  overallScore?: number;
  createdAt: string;
  questions: Array<{ question: string; score?: number; category?: string }>;
};

export default function InterviewHistoryPage() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch('http://localhost:5001/api/interview/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) {
          if (data?.ok) setSessions(data.sessions || []);
          else setError(data?.error || 'Failed to load');
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview History</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your last 50 mock interview sessions.</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No sessions yet. Take your first interview to see history here.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((s) => {
              const created = new Date(s.createdAt);
              const duration = s.durationSec ?? Math.max(0, Math.round(((s.endedAt ? Date.parse(s.endedAt) : Date.now()) - (s.startedAt ? Date.parse(s.startedAt) : created.getTime())) / 1000));
              const avg = typeof s.overallScore === 'number' ? s.overallScore : (s.questions.length ? Math.round((s.questions.reduce((sum, q) => sum + (q.score || 0), 0) / s.questions.length) * 10) / 10 : 0);
              return (
                <div key={s._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{created.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{avg}/10</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{s.questions.length}</p>
                      <p className="text-xs text-gray-500">Questions</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.floor(duration / 60)}m</p>
                      <p className="text-xs text-gray-500">Duration</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.round((avg / 10) * 100)}%</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>
                      Top categories: {Array.from(new Set(s.questions.map(q => q.category || 'general'))).slice(0, 3).join(', ') || 'general'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
