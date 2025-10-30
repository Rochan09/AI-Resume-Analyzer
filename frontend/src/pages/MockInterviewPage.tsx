import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Send, Mic, MicOff, MessageSquare, Sparkles, Clock, Volume2, VolumeX, TrendingUp, Award, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AIInterviewerAvatar } from '../components/AIInterviewerAvatar';

// Fallback default questions if none in sessionStorage
const DEFAULT_QUESTIONS: string[] = [
  'Tell me about yourself and your background.',
  'Why are you interested in this role and our company?',
  'Describe a challenging project you worked on. What was your approach?',
  'Tell me about a time you had a conflict at work. How did you resolve it?',
  'What is your biggest professional achievement?',
  'Walk me through a technically complex problem you solved.',
  'How do you prioritize tasks when everything seems urgent?',
  'Tell me about a time you failed and what you learned from it.',
  'What are your strengths and areas for improvement?',
  'Do you have any questions for us?'
];

type QItem = { question: string; category?: string };
type Feedback = { score: number; summary: string; strengths: string[]; improvements: string[] };
type SessionItem = QItem & { answer: string; score: number; strengths: string[]; improvements: string[]; durationSec?: number };

// Simple heuristic evaluator for quick feedback
function evaluateAnswer(answer: string) {
  const text = (answer || '').trim();
  if (!text) {
    return {
      score: 0,
      summary: 'No answer provided.',
      strengths: [],
      improvements: ['Provide a complete, structured answer. Use the STAR method.'],
    };
  }

  const lengthScore = Math.min(5, Math.floor(text.split(/\s+/).length / 30)); // +1 per ~30 words, max 5
  const hasNumbers = /(\d+%?|\$\d+)/.test(text);
  const hasSTAR = /(situation|task|action|result|impact)/i.test(text);
  const hasMetrics = /(increased|reduced|improved|cut|grew|saved|optimized)/i.test(text);
  const actionVerbs = /(led|designed|built|implemented|shipped|launched|automated|migrated|optimized|analyzed|collaborated)/i.test(text);

  let bonus = 0;
  if (hasNumbers) bonus += 2;
  if (hasSTAR) bonus += 2;
  if (hasMetrics) bonus += 1;
  if (actionVerbs) bonus += 1;

  const raw = Math.min(10, Math.max(1, lengthScore + bonus));

  const strengths: string[] = [];
  if (hasSTAR) strengths.push('Clear structure (STAR).');
  if (hasNumbers) strengths.push('Used numbers/metrics.');
  if (hasMetrics) strengths.push('Outcome-focused phrasing.');
  if (actionVerbs) strengths.push('Strong action verbs.');
  if (lengthScore >= 3) strengths.push('Good depth and detail.');

  const improvements: string[] = [];
  if (!hasSTAR) improvements.push('Organize answer using STAR (Situation, Task, Action, Result).');
  if (!hasNumbers) improvements.push('Add measurable impact (numbers, %).');
  if (!actionVerbs) improvements.push('Use strong action verbs (implemented, led, optimized).');

  return { score: raw, summary: 'Auto-evaluated response.', strengths, improvements };
}

// Interview Report Component
interface InterviewReportProps {
  items: SessionItem[];
  avgScore: number | null;
  seconds: number;
  savedSessionId: string | null;
  onRestart: () => void;
}

function InterviewReport({ items, avgScore, seconds, savedSessionId, onRestart }: InterviewReportProps) {
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 5) return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">🎉 Interview Complete!</h2>
            <p className="text-purple-100">Great job! Here's your detailed performance report.</p>
          </div>
          <button
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl bg-white text-purple-600 hover:bg-purple-50 font-medium transition-colors shadow-lg"
          >
            Take Another Interview
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">Questions</span>
            </div>
            <p className="text-3xl font-bold">{items.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Score</span>
            </div>
            <p className="text-3xl font-bold">{avgScore ? `${avgScore}/10` : 'N/A'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-3xl font-bold">{formatDuration(seconds)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Grade</span>
            </div>
            <p className="text-3xl font-bold">
              {avgScore && avgScore >= 8 ? 'A' : avgScore && avgScore >= 6 ? 'B' : avgScore && avgScore >= 4 ? 'C' : 'D'}
            </p>
          </div>
        </div>

        {savedSessionId && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Session saved to history</span>
            <a href="#interview-history" className="ml-auto text-sm font-medium hover:underline">
              View All Sessions →
            </a>
          </div>
        )}
      </div>

      {/* Detailed Q&A Report */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Question-by-Question Analysis</h3>
        
        {items.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold">
                    Q{idx + 1}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs font-medium">
                    {item.category || 'general'}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{item.question}</p>
              </div>
              <div className={`ml-4 px-4 py-2 rounded-xl border-2 ${getScoreBg(item.score)}`}>
                <p className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}/10</p>
              </div>
            </div>

            {/* Your Answer */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Answer:</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                {item.answer || '(No answer provided)'}
              </p>
            </div>

            {/* Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {item.strengths.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Strengths
                  </p>
                  <ul className="space-y-1">
                    {item.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {item.improvements.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                  </p>
                  <ul className="space-y-1">
                    {item.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">→</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockInterviewPage() {
  const { token } = useAuth();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<QItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [items, setItems] = useState<SessionItem[]>([]);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  // Resume-driven questions
  const [usingResumeQuestions, setUsingResumeQuestions] = useState(false);
  const [showResumePanel, setShowResumePanel] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [interviewMode, setInterviewMode] = useState<'hr' | 'technical' | 'full'>('full');
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const greetedRef = useRef(false);
  
  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Auto-recording state
  const [autoRecordCountdown, setAutoRecordCountdown] = useState<number | null>(null);
  const autoRecordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Speech recognition transcript accumulator to avoid duplicates
  const finalTranscriptRef = useRef<string>('');

  // Build questions by mode from stored questions object
  function buildQuestionsByMode(q: any, mode: 'hr' | 'technical' | 'full'): QItem[] {
    if (!q) return [];
    const hr = (q.hr || []).map((t: string) => ({ question: t, category: 'hr' }));
    const technical = (q.technical || []).map((t: string) => ({ question: t, category: 'technical' }));
    const projects = (q.project || []).map((t: string) => ({ question: t, category: 'project' }));
    const internships = (q.internships || []).map((t: string) => ({ question: t, category: 'internship' }));
    const certifications = (q.certifications || []).map((t: string) => ({ question: t, category: 'certification' }));
    const skills = (q.skills || []).map((t: string) => ({ question: t, category: 'skills' }));

    // Ensure personalized "Tell me about yourself" is included in HR if we know name
    const hrList = [...hr];
    if (candidateName) {
      const firstName = candidateName.split(' ')[0];
      const personalized = `Tell me about yourself, ${firstName}.`;
      const hasPersonalized = hrList.some(qi => qi.question.toLowerCase().includes('tell me about yourself'));
      if (!hasPersonalized) hrList.unshift({ question: personalized, category: 'hr' });
      else {
        // Replace the generic variant with personalized if needed
        for (let i = 0; i < hrList.length; i++) {
          if (hrList[i].question.toLowerCase().includes('tell me about yourself')) {
            hrList[i] = { question: personalized, category: 'hr' };
            break;
          }
        }
      }
    }

    const techCombined = [...technical, ...projects, ...internships, ...skills, ...certifications];

    let combined: QItem[] = [];
    if (mode === 'hr') {
      combined = hrList; // no strict cap specified for HR-only mode
    }
    if (mode === 'technical') {
      combined = techCombined.slice(0, 15); // exactly 15 for technical interview
    }
    if (mode === 'full') {
      const hrSelected = hrList.slice(0, 7);
      const techSelected = techCombined.slice(0, 13);
      combined = [...hrSelected, ...techSelected]; // total 20
    }

    // de-duplicate by question text
    const seen = new Set<string>();
    const dedup: QItem[] = [];
    for (const it of combined) {
      if (!seen.has(it.question)) { seen.add(it.question); dedup.push(it); }
    }
    // Fallbacks if not enough questions
    if (mode === 'technical' && dedup.length < 15) {
      const techFallback = [
        'Explain a complex problem you solved recently.',
        'How do you ensure code quality and maintainability?',
        'Describe your debugging workflow.',
        'How do you design APIs and data models?',
        'Discuss a performance optimization you implemented.',
      ];
      for (const t of techFallback) {
        if (dedup.length >= 15) break;
        if (!seen.has(t)) { seen.add(t); dedup.push({ question: t, category: 'technical' }); }
      }
    }
    if (mode === 'full' && dedup.length < 20) {
      const hrFallback = [
        'What are your strengths and how do they apply to this role?',
        'Tell me about a time you handled conflict in a team.',
        'Why are you interested in this role and our company?'
      ];
      for (const h of hrFallback) {
        if (dedup.length >= 20) break;
        if (!seen.has(h)) { seen.add(h); dedup.push({ question: h, category: 'hr' }); }
      }
      const techFallback = [
        'How do you approach testing and automation?',
        'Walk me through a system you designed.',
      ];
      for (const t of techFallback) {
        if (dedup.length >= 20) break;
        if (!seen.has(t)) { seen.add(t); dedup.push({ question: t, category: 'technical' }); }
      }
    }
    return dedup;
  }

  // Load questions from sessionStorage or default
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('interviewPrepQuestions');
      const storedName = sessionStorage.getItem('candidateName');
      if (storedName) setCandidateName(storedName);
      if (saved) {
        const data = JSON.parse(saved);
        const built = buildQuestionsByMode(data, interviewMode);
        const finalList = built.length ? built : DEFAULT_QUESTIONS.map(q => ({ question: q, category: 'general' }));
        setQuestions(finalList);
        setUsingResumeQuestions(!!built.length);
      } else {
        setQuestions(DEFAULT_QUESTIONS.map(q => ({ question: q, category: 'general' })));
        setUsingResumeQuestions(false);
      }
    } catch {
      setQuestions(DEFAULT_QUESTIONS.map(q => ({ question: q, category: 'general' })));
      setUsingResumeQuestions(false);
    }
  }, [interviewMode, candidateName]);

  const clearResumeQuestions = () => {
    sessionStorage.removeItem('interviewPrepQuestions');
    sessionStorage.removeItem('candidateName');
    setQuestions(DEFAULT_QUESTIONS.map(q => ({ question: q, category: 'general' })));
    setUsingResumeQuestions(false);
    setCandidateName(null);
  };

  // Generate resume-based questions via ATS analyze
  const generateQuestionsFromResume = async () => {
    if (!resumeFile && !jobDescription.trim()) {
      alert('Please upload a resume file or provide a job description.');
      return;
    }
    try {
      setGenLoading(true);
      const form = new FormData();
      if (resumeFile) form.append('resume', resumeFile);
      form.append('jobDescription', jobDescription);
      const res = await fetch('http://localhost:5001/api/ats/analyze', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to analyze resume');
      const q = data.questions || {};
      sessionStorage.setItem('interviewPrepQuestions', JSON.stringify(q));
      if (data.candidateName) sessionStorage.setItem('candidateName', data.candidateName);
      const combined: QItem[] = [
        ...(q.hr || []).map((t: string) => ({ question: t, category: 'hr' })),
        ...(q.technical || []).map((t: string) => ({ question: t, category: 'technical' })),
        ...(q.project || []).map((t: string) => ({ question: t, category: 'project' })),
        ...(q.internships || []).map((t: string) => ({ question: t, category: 'internship' })),
        ...(q.certifications || []).map((t: string) => ({ question: t, category: 'certification' })),
        ...(q.skills || []).map((t: string) => ({ question: t, category: 'skills' })),
      ].filter(Boolean);
      const seen = new Set<string>();
      const dedup: QItem[] = [];
      for (const it of combined) {
        if (!seen.has(it.question)) { seen.add(it.question); dedup.push(it); }
      }
      const built = buildQuestionsByMode(q, interviewMode);
      const finalList = built.length ? built : dedup;
      setQuestions(finalList.length ? finalList : DEFAULT_QUESTIONS.map(q => ({ question: q, category: 'general' })));
      setUsingResumeQuestions(!!finalList.length);
      setCandidateName(data.candidateName || null);
      setShowResumePanel(false);
      // If interview already started, restart to apply new list
      if (started) {
        setStarted(false);
        setCurrentIndex(0);
        setAnswer('');
        setItems([]);
        setSeconds(0);
        setFeedback(null);
        setSavedSessionId(null);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to generate questions';
      alert(msg);
    } finally {
      setGenLoading(false);
    }
  };

  // Load available voices for TTS
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Text-to-speech function
  const speakText = (text: string) => {
    if (!voiceEnabled || !text) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a female voice
    const femaleVoice = availableVoices.find(v => 
      v.name.toLowerCase().includes('female') || 
      v.name.toLowerCase().includes('woman') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('victoria') ||
      v.name.toLowerCase().includes('zira') ||
      v.name.toLowerCase().includes('google us english')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Start countdown for auto-recording after speech ends
      startAutoRecordCountdown();
    };
    utterance.onerror = () => setIsSpeaking(false);
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Start countdown timer for auto-recording
  const startAutoRecordCountdown = () => {
    // Clear any existing timers
    if (autoRecordTimerRef.current) clearTimeout(autoRecordTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Start 5-second countdown
    setAutoRecordCountdown(5);
    
    let count = 5;
    countdownIntervalRef.current = setInterval(() => {
      count--;
      setAutoRecordCountdown(count);
      if (count <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    }, 1000);
    
    // Auto-start recording after 5 seconds
    autoRecordTimerRef.current = setTimeout(() => {
      setAutoRecordCountdown(null);
      if (!listening && !finished) {
        startListening();
      }
    }, 5000);
  };

  // Clear auto-record timers
  const clearAutoRecordTimers = () => {
    if (autoRecordTimerRef.current) {
      clearTimeout(autoRecordTimerRef.current);
      autoRecordTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoRecordCountdown(null);
  };

  // Start listening (voice input)
  const startListening = () => {
    clearAutoRecordTimers(); // Clear countdown when manually starting
    
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    finalTranscriptRef.current = '';
    recognition.onresult = (event: any) => {
      let finalText = finalTranscriptRef.current;
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const chunk = (res[0]?.transcript || '').trim();
        if (!chunk) continue;
        if (res.isFinal) {
          // Append with a space delimiter, de-duplicating trailing spaces
          if (!finalText.endsWith(chunk)) {
            finalText = (finalText + ' ' + chunk).trim();
          }
        } else {
          interimText = (interimText + ' ' + chunk).trim();
        }
      }
      finalTranscriptRef.current = finalText;
      const combined = (finalText + (interimText ? ' ' + interimText : '')).trim();
      setAnswer(combined);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  // Stop listening
  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (err) {
      console.debug('Speech recognition stop error (ignored):', err);
    }
    setListening(false);
  };

  // Speak question when it changes
  useEffect(() => {
    if (started && !finished && currentIndex < questions.length) {
      const currentQuestion = questions[currentIndex]?.question;
      if (currentQuestion) {
        clearAutoRecordTimers(); // Clear any existing timers
        setTimeout(() => {
          if (!greetedRef.current && candidateName) {
            const firstName = candidateName.split(' ')[0];
            const modeLabel = interviewMode === 'hr' ? 'HR' : interviewMode === 'technical' ? 'technical' : 'full';
            speakText(`Hi ${firstName}, let's begin your ${modeLabel} interview. ${currentQuestion}`);
            greetedRef.current = true;
          } else {
            speakText(currentQuestion);
          }
        }, 500);
      }
    }
  }, [currentIndex, started, questions, candidateName, interviewMode]);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      clearAutoRecordTimers();
      stopListening();
    };
  }, []);

  // Timer: run only while interview is started and not finished
  useEffect(() => {
    if (!started || currentIndex >= questions.length) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, currentIndex, questions.length]);

  const progress = useMemo(() => {
    const total = Math.max(1, questions.length);
    return ((currentIndex) / total) * 100;
  }, [currentIndex, questions.length]);

  function formatHMS(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  const startInterview = () => {
    setStarted(true);
    setSeconds(0);
    setCurrentIndex(0);
    setAnswer('');
    setFeedback(null);
    setItems([]);
    setSavedSessionId(null);
    setStartedAt(new Date());
    greetedRef.current = false;
    window.speechSynthesis.cancel(); // Clear any pending speech
    clearAutoRecordTimers();
    stopListening();
  };

  const saveSession = async (finalItems: SessionItem[], totalSeconds: number) => {
    try {
      if (!token) return; // not logged in, skip
      const overallScore = finalItems.length
        ? Math.round((finalItems.reduce((sum, it) => sum + (it.score || 0), 0) / finalItems.length) * 10) / 10
        : undefined;
      const payload = {
        startedAt: startedAt ? startedAt.toISOString() : undefined,
        endedAt: new Date().toISOString(),
        durationSec: totalSeconds,
        overallScore,
        questions: finalItems.map(it => ({
          question: it.question,
          category: it.category,
          answer: it.answer,
          score: it.score,
          strengths: it.strengths,
          improvements: it.improvements,
          durationSec: it.durationSec,
        })),
      };
      const res = await fetch('http://localhost:5001/api/interview/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.ok) {
        setSavedSessionId(data.sessionId);
      }
    } catch (e) {
      // swallow errors to not block UI
      console.error('Failed to save interview session', e);
    }
  };

  const submitAnswer = () => {
    // Consider only what the user said as the answer
    const fb = evaluateAnswer(answer);
    setFeedback(fb);
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    clearAutoRecordTimers(); // Clear countdown timers
    stopListening(); // Stop voice recording
    finalTranscriptRef.current = '';

    // Record item for history
    const q = questions[currentIndex];
    setItems(prev => ([
      ...prev,
      {
        question: q?.question || '',
        category: q?.category,
        answer: answer.trim(),
        score: fb.score,
        strengths: fb.strengths,
        improvements: fb.improvements,
      },
    ]));

    // Move to next after a brief delay
    setTimeout(() => {
      setCurrentIndex(i => {
        const next = i + 1;
        // if finished, save session
        if (next >= questions.length) {
          const finalItems = [
            ...items,
            {
              question: q?.question || '',
              category: q?.category,
              answer: answer.trim(),
              score: fb.score,
              strengths: fb.strengths,
              improvements: fb.improvements,
            },
          ];
          saveSession(finalItems, seconds);
        }
        return Math.min(questions.length, next);
      });
      setAnswer('');
      setFeedback(null); // Clear feedback for next question
      finalTranscriptRef.current = '';
    }, 500);
  };

  const skipQuestion = () => {
    window.speechSynthesis.cancel();
    clearAutoRecordTimers();
    stopListening();
    finalTranscriptRef.current = '';
    setAnswer('');
    setFeedback(null);
    setCurrentIndex(i => Math.min(questions.length, i + 1));
  };

  const submitInterview = async () => {
    window.speechSynthesis.cancel();
    clearAutoRecordTimers();
    stopListening();

    let finalItems = items;
    // If there's an unsubmitted answer for current question, include it
    if (!finished && started && answer.trim() && currentIndex < questions.length) {
      const q = questions[currentIndex];
      const fb = evaluateAnswer(answer);
      finalItems = [
        ...items,
        {
          question: q?.question || '',
          category: q?.category,
          answer: answer.trim(),
          score: fb.score,
          strengths: fb.strengths,
          improvements: fb.improvements,
        },
      ];
      setItems(finalItems);
    }
    await saveSession(finalItems, seconds);
    setAnswer('');
    setFeedback(null);
    finalTranscriptRef.current = '';
    // Mark finished
    setCurrentIndex(questions.length);
  };

  // Voice input via Web Speech API if available
  const toggleListening = () => {
    if (listening) {
      stopListening();
      return;
    }
    startListening();
  };

  const finished = started && currentIndex >= questions.length;
  const avgScore = useMemo(() => {
    if (!items.length) return null;
    const n = items.reduce((sum, it) => sum + (it.score || 0), 0) / items.length;
    return Math.round(n * 10) / 10;
  }, [items]);

  // Avatar state
  const avatarState = isSpeaking ? 'speaking' : listening ? 'listening' : 'idle';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Mock Interview</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Practice with AI interviewer. Answer questions naturally.</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${usingResumeQuestions ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700'}`}>
                {usingResumeQuestions ? 'Resume-based' : 'Generic questions'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Mode selector */}
            <div className="hidden sm:flex items-center gap-1 mr-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
              {(['hr','technical','full'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setInterviewMode(m)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${interviewMode===m ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  title={m==='hr' ? 'HR interview' : m==='technical' ? 'Technical interview' : 'Full interview'}
                >
                  {m==='hr' ? 'HR' : m==='technical' ? 'Technical' : 'Full'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowResumePanel(v => !v)}
              title={usingResumeQuestions ? 'Using resume-based questions' : 'Upload your resume to get tailored questions'}
              className={`${
                usingResumeQuestions
                  ? 'px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                  : 'px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl ring-2 ring-purple-300/60'
              } text-sm inline-flex items-center gap-2 ${(!usingResumeQuestions && !showResumePanel) ? 'animate-pulse' : ''}`}
            >
              <Upload className="w-4 h-4" /> {showResumePanel ? 'Hide Resume' : 'Add Resume'}
            </button>
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) window.speechSynthesis.cancel();
              }}
              className={`p-2 rounded-lg border transition-colors ${voiceEnabled ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'}`}
              title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={startInterview}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Play className="w-4 h-4" /> {started ? 'Restart' : 'Start Interview'}
            </button>
          </div>
        </div>

        {/* Inline Resume Panel */}
        {showResumePanel && (
          <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Resume file (PDF/DOCX/TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-700 dark:text-gray-200 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Job description (optional)</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={2}
                  placeholder="Paste a job description to tailor questions"
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={generateQuestionsFromResume}
                  disabled={genLoading}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {genLoading ? 'Generating…' : 'Generate Questions'}
                </button>
                {usingResumeQuestions && (
                  <button
                    onClick={clearResumeQuestions}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300"
                  >
                    Use Generic
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!finished ? (
          /* Interview in progress - Two column layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT SIDE - Question + Avatar */}
            <div className="space-y-4">
              {/* Question Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Question {Math.min(currentIndex + 1, questions.length)}/{questions.length || 10}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{questions[currentIndex]?.category || 'general'}</p>
                  </div>
                  {isSpeaking && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                      <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Speaking...</span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                    {!started ? '👋 Welcome! Click "Start Interview" to begin. I\'ll ask you questions and you can answer naturally.' : (questions[currentIndex]?.question || DEFAULT_QUESTIONS[0])}
                  </p>
                </div>
              </div>

              {/* Avatar */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-purple-200 dark:border-purple-800 p-4 shadow-xl max-w-md mx-auto scale-90 md:scale-95">
                <AIInterviewerAvatar state={avatarState} name="AI Interviewer" />
              </div>

              {/* Progress bar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Progress</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{Math.round(progress)}%</p>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Answer Display + Controls */}
            <div className="space-y-4">
              {/* Timer at top */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Time</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                    {formatHMS(seconds)}
                  </div>
                </div>
              </div>

              {/* Answer Display Card with animated border when recording */}
              <div className={`
                bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transition-all duration-300
                ${listening ? 'border-4 border-red-500 dark:border-red-400 animate-pulse' : 'border border-gray-200 dark:border-gray-700'}
              `}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Your Answer</h3>
                  </div>
                  {listening && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400">🎤 RECORDING</span>
                    </div>
                  )}
                  {autoRecordCountdown !== null && autoRecordCountdown > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                      <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {autoRecordCountdown}
                      </div>
                      <span className="text-[10px] font-medium text-purple-700 dark:text-purple-300">Starting...</span>
                    </div>
                  )}
                </div>

                {/* Live transcription display */}
                <div className="min-h-[140px] max-h-[260px] overflow-y-auto p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  {answer ? (
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {answer}
                      {listening && <span className="inline-block w-0.5 h-4 bg-red-500 ml-1 animate-pulse" />}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <Mic className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isSpeaking ? 'Listening to question...' : autoRecordCountdown !== null ? 'Get ready to answer...' : 'Waiting to start recording...'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    onClick={toggleListening}
                    disabled={!started || isSpeaking || autoRecordCountdown !== null}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium ${
                      listening 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-100' 
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {listening ? (
                      <>
                        <MicOff className="w-4 h-4" /> Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" /> Manual Record
                      </>
                    )}
                  </button>
                  <button
                    onClick={skipQuestion}
                    disabled={!started}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Skip Question
                  </button>
                  <button
                    onClick={submitAnswer}
                    disabled={!started || !answer.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-4 h-4" /> Next Question
                  </button>
                </div>

                {/* Submit Interview */}
                {started && !finished && (
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      onClick={submitInterview}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                    >
                      Submit Interview
                    </button>
                  </div>
                )}
              </div>

              {/* Last feedback (if any) */}
              {feedback && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 flex items-center justify-center font-bold text-lg">
                      {feedback.score}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Quick Feedback</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Previous answer</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    {feedback.strengths.slice(0, 2).map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-green-700 dark:text-green-400">
                        <span>✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Interview Complete - Show Report */
          <InterviewReport 
            items={items} 
            avgScore={avgScore} 
            seconds={seconds}
            savedSessionId={savedSessionId}
            onRestart={startInterview}
          />
        )}
      </div>
    </div>
  );
}export default MockInterviewPage;
