import { useState, useMemo, useEffect } from 'react';

// API base (Vite injects VITE_API_BASE_URL at build time)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
import { motion } from 'framer-motion';
import { Users, Code, Briefcase, FileText, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';

type QuestionCategory = 'behavioral' | 'technical' | 'project' | 'resume';

interface Question {
  id: number;
  text: string;
  hint?: string;
  expanded: boolean;
}

export function QuestionsPage() {
  const [activeCategory, setActiveCategory] = useState<QuestionCategory>('behavioral');
  const { resumeData } = useResume();

  // Upload states for users without local resume data (or to analyze a file)
  const [uploadedQuestions, setUploadedQuestions] = useState<null | {
    hr: string[];
    technical: string[];
    project: string[];
    internships?: string[];
    certifications?: string[];
    skills?: string[];
  }>(null);

  // Check for questions from ATS upload on mount
  useEffect(() => {
    const storedQuestions = sessionStorage.getItem('interviewPrepQuestions');
    
    if (storedQuestions) {
      try {
        const parsed = JSON.parse(storedQuestions);
        setUploadedQuestions(parsed);
      } catch (e) {
        console.error('Failed to parse stored questions', e);
      }
    }
  }, []);

  // Resume panel state
  const [showResumePanel, setShowResumePanel] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const usingResumeQuestions = !!uploadedQuestions;

  const clearResumeQuestions = () => {
    sessionStorage.removeItem('interviewPrepQuestions');
    setUploadedQuestions(null);
  };

  const generateQuestionsFromResume = async () => {
    if (!resumeFile && !jobDescription.trim()) {
      alert('Please upload a resume file or paste a job description.');
      return;
    }
    try {
      setGenLoading(true);
      const form = new FormData();
      if (resumeFile) form.append('resume', resumeFile);
      form.append('jobDescription', jobDescription);
  const res = await fetch(`${API_BASE}/api/ats/analyze`, {
        method: 'POST',
        body: form,
      });
  const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to analyze resume');
      const q = data.questions || {};
      sessionStorage.setItem('interviewPrepQuestions', JSON.stringify(q));
  if (data.candidateName) sessionStorage.setItem('candidateName', data.candidateName);
  setUploadedQuestions(q);
  setShowResumePanel(false);
  setActiveCategory('behavioral');
    } catch (e: any) {
      alert(e.message || 'Failed to generate questions');
    } finally {
      setGenLoading(false);
    }
  };

  // Derived availability of resume data can be added later if needed

  // Generate questions based on resume data or uploaded questions
  const allQuestions = useMemo(() => {
    const behavioral: Question[] = [];
    const technical: Question[] = [];
    const situational: Question[] = [];
    const resume: Question[] = [];

    // If we have uploaded questions from ATS analysis, use those
    if (uploadedQuestions) {
      // HR questions go to behavioral
      uploadedQuestions.hr?.forEach((q, idx) => {
        behavioral.push({
          id: idx + 1,
          text: q,
          hint: idx === 1 ? 'Use the STAR Method' : undefined,
          expanded: false
        });
      });

      // Technical questions
      uploadedQuestions.technical?.forEach((q, idx) => {
        technical.push({
          id: idx + 1,
          text: q,
          expanded: false
        });
      });

      // Project questions go to the project category
      uploadedQuestions.project?.forEach((q, idx) => {
        situational.push({
          id: idx + 1,
          text: q,
          expanded: false
        });
      });
    } else {
      // Generate from resume data
      // Behavioral questions
      behavioral.push(
        {
          id: 1,
          text: 'Tell me about yourself.',
          hint: undefined,
          expanded: false
        },
        {
          id: 2,
          text: 'Tell me about a time you had to manage a conflicting priority.',
          hint: 'Use the STAR Method',
          expanded: false
        },
        {
          id: 3,
          text: 'Why do you want to work for this company?',
          hint: undefined,
          expanded: false
        }
      );

      // Technical questions based on skills
      if (resumeData.skills.length > 0) {
        resumeData.skills.slice(0, 3).forEach((skill, idx) => {
          technical.push({
            id: idx + 1,
            text: `Explain your experience with ${skill}.`,
            expanded: false
          });
        });
      } else {
        technical.push(
          {
            id: 1,
            text: 'What is your approach to learning new technologies?',
            expanded: false
          },
          {
            id: 2,
            text: 'Describe your development workflow.',
            expanded: false
          }
        );
      }

      // Project-based questions: projects, work experience, internships
      if (resumeData.projects.length > 0) {
        resumeData.projects.forEach((project) => {
          if (project.name) {
            situational.push({
              id: situational.length + 1,
              text: `Describe your ${project.name} project and its impact.`,
              expanded: false
            });
          }
        });
      }

      if (resumeData.experience.length > 0) {
        resumeData.experience.forEach((exp) => {
          if (exp.position && exp.company) {
            situational.push({
              id: situational.length + 1,
              text: `Tell me about your experience as a ${exp.position} at ${exp.company}.`,
              expanded: false
            });

            // If it's an internship, add internship-specific question
            if (exp.position.toLowerCase().includes('intern')) {
              situational.push({
                id: situational.length + 1,
                text: `What did you learn during your internship at ${exp.company}?`,
                expanded: false
              });
            }
          }
        });
      }

      // Fallback generic project questions if none found
      if (situational.length === 0) {
        situational.push(
          {
            id: 1,
            text: 'Describe a project you are proud of and its impact.',
            expanded: false
          },
          {
            id: 2,
            text: 'Tell me about a time you owned a project end-to-end.',
            expanded: false
          },
          {
            id: 3,
            text: 'How do you balance technical quality and delivery timelines?',
            expanded: false
          }
        );
      }

      // Resume-focused questions (overview & highlights)
      resume.push(
        {
          id: 1,
          text: 'Walk me through your resume.',
          expanded: false
        },
        {
          id: 2,
          text: 'Which accomplishment on your resume are you most proud of and why?',
          expanded: false
        },
        {
          id: 3,
          text: 'Can you explain any employment gaps or major transitions on your resume?',
          expanded: false
        }
      );
    }

    return {
      behavioral,
      technical,
      project: situational,
      resume
    } as {
      behavioral: Question[];
      technical: Question[];
      project: Question[];
      resume: Question[];
    };
  }, [resumeData, uploadedQuestions]);

  const [questions, setQuestions] = useState(allQuestions);

  // Update questions when allQuestions changes
  useEffect(() => {
    setQuestions(allQuestions);
  }, [allQuestions]);

  const categories = [
    {
      id: 'behavioral' as QuestionCategory,
      label: 'Behavioral',
      icon: Users,
      count: questions.behavioral.length,
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'technical' as QuestionCategory,
      label: 'Technical',
      icon: Code,
      count: questions.technical.length,
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    },
    {
      id: 'project' as QuestionCategory,
      label: 'Projects',
      icon: Briefcase,
      count: questions.project.length,
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    },
    {
      id: 'resume' as QuestionCategory,
      label: 'About Your Resume',
      icon: FileText,
      count: questions.resume.length,
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
    }
  ];

  const currentCategoryQuestions = questions[activeCategory];
  const totalQuestions = currentCategoryQuestions.length;

  const toggleQuestionExpand = (questionId: number) => {
    setQuestions(prev => ({
      ...prev,
      [activeCategory]: (prev as any)[activeCategory].map((q: Question) =>
        q.id === questionId ? { ...q, expanded: !q.expanded } : q
      )
    }));
  };

  // Navigation removed: switching to list-based display of questions

  const handleCategoryChange = (category: QuestionCategory) => {
    setActiveCategory(category);
  };

  const getSTARContent = () => {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Hint: Use the STAR Method</h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="font-semibold">Situation:</span>
            <span>Describe the context. What was the project or challenge?</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">Task:</span>
            <span>What was your specific responsibility in that situation?</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">Action:</span>
            <span>What steps did you take to resolve the conflict or manage the priorities?</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">Result:</span>
            <span>What was the outcome? Quantify your success if possible.</span>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Interview Preparation
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600 dark:text-gray-400">
                  Practice with AI-generated questions based on your resume.
                </p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${usingResumeQuestions ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700'}`}>
                  {usingResumeQuestions ? 'Resume-based' : 'Generic questions'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
            </div>
          </div>

          {showResumePanel && (
            <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
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

          <div className="grid lg:grid-cols-[280px,1fr] gap-8">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Question Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Question Categories
                  </h3>
                </div>
                <div className="p-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-colors ${
                          isActive
                            ? category.color
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{category.label}</span>
                        </div>
                        {category.count > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-white/20'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {category.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Category Progress removed for list view */}

              {/* Question Display */}
              <div className="p-8">
                {totalQuestions > 0 ? (
                  <div className="space-y-6">
                    {currentCategoryQuestions.map((q: Question, idx: number) => (
                      <div key={`${activeCategory}-${q.id}`}>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {q.text}
                              </h2>
                              {q.hint && (
                                <button
                                  onClick={() => toggleQuestionExpand(q.id)}
                                  className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                  {q.expanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                  )}
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activeCategory === 'behavioral' && 'Summarize your professional background and key skills.'}
                              {activeCategory === 'technical' && 'Demonstrate your technical knowledge and problem-solving approach.'}
                              {activeCategory === 'project' && 'Describe your projects, internships, and work experience in detail.'}
                              {activeCategory === 'resume' && 'Explain your experiences and accomplishments in detail.'}
                            </p>
                          </div>
                        </div>

                        {/* STAR Method Hint */}
                        {q.expanded && q.hint && getSTARContent()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      No questions available for this category.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation removed for list-based view */}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
