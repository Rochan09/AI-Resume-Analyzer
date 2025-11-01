import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, TrendingUp, FileText, Send, Check, Info } from 'lucide-react';

interface ATSResult {
  atsScore: number;
  grade: string;
  strengths: string[];
  suggestions: string[];
  keywordsFound: string[];
  detailedAnalysis?: {
    contact?: { score: number; maxScore: number };
    summary?: { score: number; maxScore: number };
    experience?: { score: number; maxScore: number };
    skills?: { score: number; maxScore: number };
    actionWords?: { score: number; maxScore: number; verbCount: number; achievementCount: number };
    formatting?: { score: number; maxScore: number };
    education?: { score: number; maxScore: number };
    length?: { score: number; maxScore: number; wordCount: number };
    jobMatch?: { score: number; maxScore: number; matchRatio?: string };
  };
  keyMetrics?: {
    skillsCoverage: { percentage: number; label: string; icon: string; color: string };
    formatting: { percentage: number; label: string; icon: string; color: string };
    actionVerbs: { count: number; label: string; icon: string; color: string };
    achievements: { count: number; label: string; icon: string; color: string };
    wordCount: { count: number; label: string; icon: string; color: string };
    jobMatch?: { percentage: number; label: string; icon: string; color: string } | null;
  };
  improvementPotential?: {
    possibleGain: number;
    topOpportunities: Array<{
      category: string;
      currentScore: number;
      maxScore: number;
      potentialPoints: number;
    }>;
  };
  questions: {
    hr: string[];
    technical: string[];
    project: string[];
  };
}

type AnalysisTab = 'summary' | 'keywords' | 'formatting' | 'content';

export function ATSPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>('summary');
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const loadingStages = [
    { icon: '📄', text: 'Uploading resume...', duration: 1000 },
    { icon: '🔍', text: 'Extracting text from document...', duration: 1200 },
    { icon: '🎯', text: 'Identifying skills and technologies...', duration: 1500 },
    { icon: '💼', text: 'Analyzing work experience...', duration: 1200 },
    { icon: '📊', text: 'Calculating ATS compatibility...', duration: 1100 },
    { icon: '✨', text: 'Generating personalized suggestions...', duration: 1000 }
  ];

  // Load saved data from sessionStorage on mount
  useEffect(() => {
    const savedFileName = sessionStorage.getItem('atsUploadedFileName');
    const savedResult = sessionStorage.getItem('atsAnalysisResult');
    const savedJobDesc = sessionStorage.getItem('atsJobDescription');

    if (savedFileName) {
      setFileName(savedFileName);
    }
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (e) {
        console.error('Failed to parse saved ATS result', e);
      }
    }
    if (savedJobDesc) {
      setJobDescription(savedJobDesc);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      sessionStorage.setItem('atsUploadedFileName', selectedFile.name);
      setResult(null); // Clear previous results
      sessionStorage.removeItem('atsAnalysisResult');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingStage(0);
    setLoadingProgress(0);
    setResult(null);

    try {
      // Simulate staged loading with animations
      const totalDuration = loadingStages.reduce((sum, stage) => sum + stage.duration, 0);
      let elapsed = 0;

      // Start the actual API call
      const form = new FormData();
      form.append('resume', file as Blob, (file as File).name);
      form.append('jobDescription', jobDescription || '');

  const apiPromise = fetch(`${API_BASE}/api/ats/analyze`, {
        method: 'POST',
        body: form,
      });

      // Animate through stages
      for (let i = 0; i < loadingStages.length; i++) {
        setLoadingStage(i);
        const stageDuration = loadingStages[i].duration;
        const startProgress = (elapsed / totalDuration) * 100;
        const endProgress = ((elapsed + stageDuration) / totalDuration) * 100;

        // Animate progress for this stage
        const steps = 20;
        const stepDuration = stageDuration / steps;
        for (let step = 0; step <= steps; step++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          const progress = startProgress + ((endProgress - startProgress) * (step / steps));
          setLoadingProgress(progress);
        }

        elapsed += stageDuration;
      }

      // Wait for API response
      const res = await apiPromise;
      const json = await res.json();
      
      if (json.ok) {
        // Complete the progress bar
        setLoadingProgress(100);
        await new Promise(resolve => setTimeout(resolve, 300));

        const analysisResult = {
          atsScore: json.atsScore,
          grade: json.grade || 'N/A',
          strengths: json.strengths,
          suggestions: json.suggestions,
          keywordsFound: json.keywordsFound,
          detailedAnalysis: json.detailedAnalysis || {},
          keyMetrics: json.keyMetrics || null,
          improvementPotential: json.improvementPotential || null,
          questions: json.questions,
          candidateName: json.candidateName || null
        };
        setResult(analysisResult);
        
        // Save to sessionStorage
  sessionStorage.setItem('atsAnalysisResult', JSON.stringify(analysisResult));
  if (json.candidateName) sessionStorage.setItem('candidateName', json.candidateName);
        sessionStorage.setItem('atsJobDescription', jobDescription);
        
        // Save ATS score to backend (if we have a resume ID)
        const resumeId = sessionStorage.getItem('currentResumeId');
        if (resumeId) {
          try {
            const token = localStorage.getItem('authToken');
            await fetch(`${API_BASE}/api/resume/${resumeId}/ats-score`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                atsScore: json.atsScore,
                grade: json.grade
              })
            });
          } catch (err) {
            console.error('Failed to save ATS score:', err);
          }
        }
      } else {
        console.error('analyze response', json);
        alert('Analysis failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error calling ATS analyze — is backend running?');
    } finally {
      setLoading(false);
      setLoadingStage(0);
      setLoadingProgress(0);
    }
  };

  const handleInterviewPrep = () => {
    if (result) {
      // Store both questions and complete ATS analysis data
      sessionStorage.setItem('interviewPrepQuestions', JSON.stringify(result.questions));
      sessionStorage.setItem('atsAnalysisData', JSON.stringify({
        score: result.atsScore,
        grade: result.grade,
        strengths: result.strengths,
        suggestions: result.suggestions,
        keywordsFound: result.keywordsFound,
        detailedAnalysis: result.detailedAnalysis,
        improvementPotential: result.improvementPotential
      }));
      window.location.hash = 'questions';
    }
  };

  const handleImproveResume = () => {
    if (result) {
      // Store complete ATS analysis data for the improvement page
      sessionStorage.setItem('atsAnalysisData', JSON.stringify({
        score: result.atsScore,
        grade: result.grade,
        strengths: result.strengths,
        suggestions: result.suggestions,
        keywordsFound: result.keywordsFound,
        detailedAnalysis: result.detailedAnalysis,
        improvementPotential: result.improvementPotential
      }));
      window.location.hash = 'improvement';
    }
  };

  // Utility functions removed if unused to satisfy typechecking

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid lg:grid-cols-[400px,1fr] gap-8">
            {/* Left Panel - Upload Section */}
            <div className="space-y-6">
              {/* Analyze Your Resume Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Analyze Your Resume
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Get detailed feedback in seconds.
                </p>

                {/* Upload Area */}
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors mb-6"
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    {file || fileName ? (
                      <>
                        <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-3" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {file?.name || fileName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Click to upload or drag & drop
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, DOCX (MAX. 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                  />
                </label>

                {/* Send Resume Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Resume</span>
                    </>
                  )}
                </button>
              </div>

              {/* Job Description Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Job Description
                    </h3>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      Optional
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Paste a job description for a more refined analysis and a precise ATS score.
                </p>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Key Metrics */}
              {result && result.keyMetrics && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Key Metrics
                  </h3>
                  <div className="space-y-3">
                    {/* Skills Coverage */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${
                      result.keyMetrics.skillsCoverage.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                      result.keyMetrics.skillsCoverage.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                      'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.keyMetrics.skillsCoverage.color === 'green' ? 'bg-green-100 dark:bg-green-900/40' :
                        result.keyMetrics.skillsCoverage.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
                        'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        <span className="text-xl">{result.keyMetrics.skillsCoverage.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{result.keyMetrics.skillsCoverage.label}</p>
                        <p className={`text-lg font-bold ${
                          result.keyMetrics.skillsCoverage.color === 'green' ? 'text-green-700 dark:text-green-400' :
                          result.keyMetrics.skillsCoverage.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                          'text-red-700 dark:text-red-400'
                        }`}>
                          {result.keyMetrics.skillsCoverage.percentage}%
                        </p>
                      </div>
                    </div>

                    {/* Formatting */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${
                      result.keyMetrics.formatting.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                      result.keyMetrics.formatting.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                      'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.keyMetrics.formatting.color === 'green' ? 'bg-green-100 dark:bg-green-900/40' :
                        result.keyMetrics.formatting.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
                        'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        <span className="text-xl">{result.keyMetrics.formatting.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{result.keyMetrics.formatting.label}</p>
                        <p className={`text-lg font-bold ${
                          result.keyMetrics.formatting.color === 'green' ? 'text-green-700 dark:text-green-400' :
                          result.keyMetrics.formatting.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                          'text-red-700 dark:text-red-400'
                        }`}>
                          {result.keyMetrics.formatting.percentage}%
                        </p>
                      </div>
                    </div>

                    {/* Action Verbs */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${
                      result.keyMetrics.actionVerbs.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                      result.keyMetrics.actionVerbs.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                      'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.keyMetrics.actionVerbs.color === 'green' ? 'bg-green-100 dark:bg-green-900/40' :
                        result.keyMetrics.actionVerbs.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
                        'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        <span className="text-xl">{result.keyMetrics.actionVerbs.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{result.keyMetrics.actionVerbs.label}</p>
                        <p className={`text-lg font-bold ${
                          result.keyMetrics.actionVerbs.color === 'green' ? 'text-green-700 dark:text-green-400' :
                          result.keyMetrics.actionVerbs.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                          'text-red-700 dark:text-red-400'
                        }`}>
                          {result.keyMetrics.actionVerbs.count} verbs
                        </p>
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${
                      result.keyMetrics.achievements.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                      result.keyMetrics.achievements.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                      'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.keyMetrics.achievements.color === 'green' ? 'bg-green-100 dark:bg-green-900/40' :
                        result.keyMetrics.achievements.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
                        'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        <span className="text-xl">{result.keyMetrics.achievements.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{result.keyMetrics.achievements.label}</p>
                        <p className={`text-lg font-bold ${
                          result.keyMetrics.achievements.color === 'green' ? 'text-green-700 dark:text-green-400' :
                          result.keyMetrics.achievements.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                          'text-red-700 dark:text-red-400'
                        }`}>
                          {result.keyMetrics.achievements.count} metrics
                        </p>
                      </div>
                    </div>

                    {/* Word Count */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${
                      result.keyMetrics.wordCount.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                      result.keyMetrics.wordCount.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                      'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.keyMetrics.wordCount.color === 'green' ? 'bg-green-100 dark:bg-green-900/40' :
                        result.keyMetrics.wordCount.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
                        'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        <span className="text-xl">{result.keyMetrics.wordCount.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{result.keyMetrics.wordCount.label}</p>
                        <p className={`text-lg font-bold ${
                          result.keyMetrics.wordCount.color === 'green' ? 'text-green-700 dark:text-green-400' :
                          result.keyMetrics.wordCount.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                          'text-red-700 dark:text-red-400'
                        }`}>
                          {result.keyMetrics.wordCount.count} words
                        </p>
                      </div>
                    </div>

                    {/* Job Match - Only if available */}
                    {result.keyMetrics.jobMatch && (
                      <div className={`flex items-center gap-3 p-3 rounded-xl ${
                        result.keyMetrics.jobMatch.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                        result.keyMetrics.jobMatch.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                        'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          result.keyMetrics.jobMatch.color === 'green' ? 'bg-green-100 dark:bg-green-900/40' :
                          result.keyMetrics.jobMatch.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
                          'bg-red-100 dark:bg-red-900/40'
                        }`}>
                          <span className="text-xl">{result.keyMetrics.jobMatch.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400">{result.keyMetrics.jobMatch.label}</p>
                          <p className={`text-lg font-bold ${
                            result.keyMetrics.jobMatch.color === 'green' ? 'text-green-700 dark:text-green-400' :
                            result.keyMetrics.jobMatch.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                            'text-red-700 dark:text-red-400'
                          }`}>
                            {result.keyMetrics.jobMatch.percentage}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Results */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {result ? (
                <div>
                  {/* Score Display */}
                  <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {result.grade} ATS Score!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {result.atsScore >= 90 
                            ? 'Outstanding! Your resume is exceptionally well-optimized and will excel with ATS systems.'
                            : result.atsScore >= 80
                            ? 'Great work! Your resume is very well-optimized with a strong chance of passing ATS.'
                            : result.atsScore >= 70
                            ? 'Good progress! Your resume is solid. A few targeted improvements will make it excellent.'
                            : result.atsScore >= 60
                            ? 'Fair resume with potential. Focus on the critical suggestions to improve ATS compatibility.'
                            : 'Your resume needs significant attention. Follow the critical improvements below to boost your chances.'}
                        </p>
                      </div>
                      
                      {/* Circular Score */}
                      <div className="flex flex-col items-center ml-8">
                        <div className="relative w-32 h-32">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - result.atsScore / 100)}`}
                              className={`${
                                result.atsScore >= 80 ? 'text-green-500' :
                                result.atsScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                              } transition-all duration-1000`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {result.atsScore}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleImproveResume}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Improve My Resume
                      </button>
                      <button
                        onClick={handleInterviewPrep}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Interview Questions
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex">
                      {['summary', 'keywords', 'formatting', 'content'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as AnalysisTab)}
                          className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors border-b-2 ${
                            activeTab === tab
                              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-8">
                    {activeTab === 'summary' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Analysis Overview
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            Your resume scored <strong>{result.atsScore}/100</strong> ({result.grade}). 
                            {result.improvementPotential && result.improvementPotential.possibleGain > 0 && (
                              <> You can gain up to <strong>{result.improvementPotential.possibleGain} more points</strong> by addressing the areas below.</>
                            )}
                          </p>
                        </div>

                        {/* Improvement Opportunities */}
                        {result.improvementPotential && result.improvementPotential.topOpportunities.length > 0 && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-4">
                            <div className="flex items-start gap-3">
                              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                  Top Improvement Opportunities:
                                </h4>
                                <div className="space-y-2">
                                  {result.improvementPotential.topOpportunities.map((opp, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-700 dark:text-gray-300">
                                        {opp.category}: {opp.currentScore}/{opp.maxScore}
                                      </span>
                                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        +{opp.potentialPoints} pts
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Strengths */}
                        {result.strengths.length > 0 && (
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  Strengths ({result.strengths.length}):
                                </h4>
                                <ul className="space-y-1.5">
                                  {result.strengths.map((strength, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                      <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {result.suggestions.length > 0 && (
                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  Suggestions for Improvement ({result.suggestions.length}):
                                </h4>
                                <ul className="space-y-2">
                                  {result.suggestions.map((suggestion, idx) => {
                                    const isCritical = suggestion.includes('⚠️') || suggestion.includes('CRITICAL');
                                    const isPriority = suggestion.includes('⚡') || suggestion.includes('PRIORITY');
                                    const isGood = suggestion.includes('✓') || suggestion.includes('GOOD');
                                    const isExcellent = suggestion.includes('🎯') || suggestion.includes('EXCELLENT');
                                    
                                    return (
                                      <li 
                                        key={idx} 
                                        className={`text-sm flex items-start gap-2 ${
                                          isCritical ? 'text-red-700 dark:text-red-400 font-medium' :
                                          isPriority ? 'text-orange-700 dark:text-orange-400 font-medium' :
                                          isGood ? 'text-green-700 dark:text-green-400' :
                                          isExcellent ? 'text-blue-700 dark:text-blue-400' :
                                          'text-gray-700 dark:text-gray-300'
                                        }`}
                                      >
                                        <span className="mt-0.5">•</span>
                                        <span>{suggestion}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'keywords' && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Keywords Analysis
                        </h3>
                        {result.keywordsFound.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {result.keywordsFound.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No specific keywords detected. Upload a job description for better analysis.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'formatting' && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Formatting Analysis
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Clean Structure</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Your resume has a clear and organized structure.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Standard Sections</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">All standard resume sections are present.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'content' && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Content Analysis
                        </h3>
                        <div className="space-y-4">
                          {result.strengths.map((strength, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700 dark:text-gray-300">{strength}</p>
                            </div>
                          ))}
                          {result.suggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Upload your resume to get instant ATS score analysis and personalized recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Loading Modal with Animations */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-6xl mb-4"
                >
                  {loadingStages[loadingStage]?.icon || '📄'}
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Analyzing Your Resume
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This will take just a moment...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.round(loadingProgress)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {loadingStage + 1} / {loadingStages.length}
                  </span>
                </div>
              </div>

              {/* Current Stage */}
              <motion.div
                key={loadingStage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full" />
                  </motion.div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {loadingStages[loadingStage]?.text || 'Processing...'}
                  </p>
                </div>
              </motion.div>

              {/* Stages Checklist */}
              <div className="space-y-2">
                {loadingStages.map((stage, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: index <= loadingStage ? 1 : 0.3,
                      x: index === loadingStage ? [0, 5, 0] : 0
                    }}
                    transition={{ 
                      opacity: { duration: 0.3 },
                      x: { duration: 0.5, repeat: index === loadingStage ? Infinity : 0 }
                    }}
                    className="flex items-center gap-3"
                  >
                    {index < loadingStage ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    ) : index === loadingStage ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full flex-shrink-0" />
                    )}
                    <span className={`text-xs ${
                      index <= loadingStage 
                        ? 'text-gray-900 dark:text-white font-medium' 
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {stage.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Fun Fact */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border border-blue-200 dark:border-blue-800"
              >
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  💡 <span className="font-medium">Did you know?</span> 75% of resumes are rejected by ATS systems before reaching human eyes!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
