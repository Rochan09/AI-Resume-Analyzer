import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, TrendingUp, MessageSquare, FileText, Send, Check, Info } from 'lucide-react';

interface ATSResult {
  atsScore: number;
  strengths: string[];
  suggestions: string[];
  keywordsFound: string[];
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
    try {
      const form = new FormData();
      form.append('resume', file as Blob, (file as File).name);
      form.append('jobDescription', jobDescription || '');

      const res = await fetch('http://localhost:5001/api/ats/analyze', {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (json.ok) {
        const analysisResult = {
          atsScore: json.atsScore,
          strengths: json.strengths,
          suggestions: json.suggestions,
          keywordsFound: json.keywordsFound,
          questions: json.questions
        };
        setResult(analysisResult);
        
        // Save to sessionStorage
        sessionStorage.setItem('atsAnalysisResult', JSON.stringify(analysisResult));
        sessionStorage.setItem('atsJobDescription', jobDescription);
      } else {
        console.error('analyze response', json);
        alert('Analysis failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error calling ATS analyze — is backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewPrep = () => {
    if (result) {
      // Store both questions and ATS analysis data
      sessionStorage.setItem('interviewPrepQuestions', JSON.stringify(result.questions));
      sessionStorage.setItem('atsAnalysisData', JSON.stringify({
        atsScore: result.atsScore,
        strengths: result.strengths,
        suggestions: result.suggestions,
        keywordsFound: result.keywordsFound
      }));
      window.location.hash = 'questions';
    }
  };

  const handleImproveResume = () => {
    if (result) {
      // Store ATS analysis data for the improvement page
      sessionStorage.setItem('atsAnalysisData', JSON.stringify({
        atsScore: result.atsScore,
        strengths: result.strengths,
        suggestions: result.suggestions,
        keywordsFound: result.keywordsFound
      }));
      window.location.hash = 'improvement';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800';
    return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800';
  };

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
                  <Send className="w-5 h-5" />
                  {loading ? 'Analyzing...' : 'Send Resume'}
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
              {result && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Key Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Keyword Match</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">92%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Formatting</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">78%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Action Verbs</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">88%</p>
                      </div>
                    </div>
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
                          Excellent ATS Score!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Great work! Your resume is well-optimized and has a high chance of passing through Applicant Tracking Systems.
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
                            Summary of Your Analysis
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            Your resume demonstrates strong alignment with accepted keyword optimization for the target role. You've effectively used action verbs to highlight your accomplishments. However, minor improvements in formatting consistency and expanding on the impact of your work could execute a further...
                          </p>
                        </div>

                        {/* Strengths */}
                        {result.strengths.length > 0 && (
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3 mb-3">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  Strengths:
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {result.strengths[0] || 'You have a great set of industry standard keywords and powerful action verbs.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Areas for Improvement */}
                        {result.suggestions.length > 0 && (
                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  Areas for Improvement:
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {result.suggestions[0] || 'Ensure consistent date formatting across all sections and quantify more of your achievements with specific metrics.'}
                                </p>
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
      </div>
    </div>
  );
}
