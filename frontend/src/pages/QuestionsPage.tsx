import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Code, Briefcase, FileText, ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';

type QuestionCategory = 'behavioral' | 'technical' | 'situational' | 'resume';

interface Question {
  id: number;
  text: string;
  hint?: string;
  expanded: boolean;
}

export function QuestionsPage() {
  const [activeCategory, setActiveCategory] = useState<QuestionCategory>('behavioral');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { resumeData } = useResume();

  // Upload states for users without local resume data (or to analyze a file)
  const [uploadedQuestions, setUploadedQuestions] = useState<null | {
    hr: string[];
    technical: string[];
    project: string[];
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

  const hasResumeData = useMemo(() => {
    return (
      resumeData.personalInfo.fullName ||
      resumeData.experience.length > 0 ||
      resumeData.education.length > 0 ||
      resumeData.skills.length > 0 ||
      resumeData.projects.length > 0
    );
  }, [resumeData]);

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

      // Project questions go to resume-based
      uploadedQuestions.project?.forEach((q, idx) => {
        resume.push({
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

      // Situational questions
      situational.push(
        {
          id: 1,
          text: 'How would you handle a disagreement with a team member?',
          expanded: false
        },
        {
          id: 2,
          text: 'What would you do if you missed a project deadline?',
          expanded: false
        },
        {
          id: 3,
          text: 'How do you prioritize tasks when everything is urgent?',
          expanded: false
        }
      );

      // Resume-based questions
      if (resumeData.experience.length > 0) {
        resumeData.experience.slice(0, 2).forEach((exp, idx) => {
          if (exp.position && exp.company) {
            resume.push({
              id: idx + 1,
              text: `Tell me about your experience as a ${exp.position} at ${exp.company}.`,
              expanded: false
            });
          }
        });
      }

      if (resumeData.projects.length > 0) {
        resumeData.projects.slice(0, 2).forEach((project, idx) => {
          if (project.name) {
            resume.push({
              id: resume.length + 1,
              text: `Describe your ${project.name} project and its impact.`,
              expanded: false
            });
          }
        });
      }

      if (resume.length === 0) {
        resume.push({
          id: 1,
          text: 'Walk me through your resume.',
          expanded: false
        });
      }
    }

    return {
      behavioral,
      technical,
      situational,
      resume
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
      id: 'situational' as QuestionCategory,
      label: 'Situational',
      icon: Briefcase,
      count: questions.situational.length,
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
  const currentQuestion = currentCategoryQuestions[currentQuestionIndex];
  const totalQuestions = currentCategoryQuestions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const toggleQuestionExpand = (questionId: number) => {
    setQuestions(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map(q =>
        q.id === questionId ? { ...q, expanded: !q.expanded } : q
      )
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleCategoryChange = (category: QuestionCategory) => {
    setActiveCategory(category);
    setCurrentQuestionIndex(0);
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Interview Preparation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Practice with AI-generated questions based on your resume.
            </p>
          </div>

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
              {/* Category Progress Bar */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Category Progress
                  </h3>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {Math.round(progressPercentage)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Question Display */}
              <div className="p-8">
                {currentQuestion ? (
                  <div>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                            {currentQuestionIndex + 1}
                          </span>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currentQuestion.text}
                          </h2>
                          {currentQuestion.hint && (
                            <button
                              onClick={() => toggleQuestionExpand(currentQuestion.id)}
                              className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              {currentQuestion.expanded ? (
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
                          {activeCategory === 'situational' && 'Show how you handle workplace challenges and decisions.'}
                          {activeCategory === 'resume' && 'Explain your experiences and accomplishments in detail.'}
                        </p>
                      </div>
                    </div>

                    {/* STAR Method Hint */}
                    {currentQuestion.expanded && currentQuestion.hint && getSTARContent()}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      No questions available for this category.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors border border-gray-300 dark:border-gray-600 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex >= totalQuestions - 1}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
