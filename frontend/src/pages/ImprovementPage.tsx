import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, GraduationCap, Award, FileText, Lightbulb, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

type Section = 'summary' | 'experience' | 'skills' | 'education';

interface Suggestion {
  id: string;
  type: 'add' | 'rewrite' | 'improve';
  title: string;
  description: string;
  original?: string;
  improved?: string;
  keywords?: string[];
  impact?: string;
  status: 'pending' | 'accepted' | 'regenerated';
}

export function ImprovementPage() {
  const [activeSection, setActiveSection] = useState<Section>('summary');
  const [progress] = useState({
    total: 4,
    completed: 0
  });

  // Mock suggestions data - this would come from the backend
  const suggestions: Record<Section, Suggestion[]> = {
    summary: [
      {
        id: 's1',
        type: 'add',
        title: 'Add Missing Keywords',
        description: 'The job description mentions these keywords, but they\'re missing from your summary.',
        keywords: ['Agile', 'Scrum'],
        impact: 'Add All (2)',
        status: 'pending'
      },
      {
        id: 's2',
        type: 'rewrite',
        title: 'Rewrite for Impact',
        description: 'Make your summary more powerful by focusing on achievements.',
        original: 'Experienced project manager with a background in tech.',
        improved: '"Results-driven Project Manager with 5+ years of experience leading cross-functional teams in the tech industry to deliver complex projects on time and within budget."',
        impact: '80% (80)',
        status: 'pending'
      }
    ],
    experience: [
      {
        id: 'e1',
        type: 'improve',
        title: 'Quantify Achievements',
        description: 'Replace vague statements with specific data and metrics to demonstrate your impact.',
        original: '"Managed team projects and improved process efficiency."',
        improved: '"Spearheaded 3+ key projects, leading a team of 10 engineers and improving process efficiency by 20% through the implementation of Agile methodologies."',
        status: 'pending'
      }
    ],
    skills: [
      {
        id: 'sk1',
        type: 'add',
        title: 'Suggested Skills to Add',
        description: 'Based on the job description, including these skills could significantly boost your match rate.',
        keywords: ['JIRA', 'Risk Management'],
        impact: 'Add All (2)',
        status: 'pending'
      }
    ],
    education: []
  };

  const sections = [
    { id: 'summary' as Section, label: 'Summary', icon: FileText, count: 2 },
    { id: 'experience' as Section, label: 'Work Experience', icon: Briefcase, count: 1 },
    { id: 'skills' as Section, label: 'Skills', icon: Award, count: 1 },
    { id: 'education' as Section, label: 'Education', icon: GraduationCap, count: 0 }
  ];

  const handleApply = (suggestionId: string) => {
    console.log('Applying suggestion:', suggestionId);
    // In a real app, this would update the resume in ResumeContext
  };

  const handleRegenerate = (suggestionId: string) => {
    console.log('Regenerating suggestion:', suggestionId);
    // In a real app, this would call the backend to regenerate the suggestion
  };

  const handleBack = () => {
    window.location.hash = 'ats';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'add': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'rewrite': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'improve': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'add': return Lightbulb;
      case 'rewrite': return Sparkles;
      case 'improve': return CheckCircle;
      default: return AlertCircle;
    }
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
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to ATS Score
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Resume Improvement Suggestions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and apply AI-powered suggestions to boost your ATS score
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px,1fr] gap-8">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Your Progress
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  You've applied {progress.completed} of {progress.total} suggestions.
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  />
                </div>
                <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Apply All Suggestions
                </button>
              </div>

              {/* Sections List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Recommendations by Section
                  </h3>
                </div>
                <div className="p-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-colors ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{section.label}</span>
                        </div>
                        {section.count > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {section.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {suggestions[activeSection].length > 0 ? (
                suggestions[activeSection].map((suggestion) => {
                  const TypeIcon = getTypeIcon(suggestion.type);
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {suggestion.title}
                              </h3>
                              {suggestion.impact && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  {suggestion.impact}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {suggestion.description}
                        </p>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        {/* Keywords */}
                        {suggestion.keywords && suggestion.keywords.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Based on the job description, including these skills could significantly boost your match rate.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center gap-1"
                                >
                                  {keyword}
                                  <span className="text-gray-400">+</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Original vs Improved */}
                        {suggestion.original && (
                          <div className="space-y-4">
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                                Your Text:
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                {suggestion.original}
                              </p>
                            </div>

                            {suggestion.improved && (
                              <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                                  Suggested Improvement:
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {suggestion.improved}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleRegenerate(suggestion.id)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                        >
                          Regenerate
                        </button>
                        <button
                          onClick={() => handleApply(suggestion.id)}
                          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Suggestions for {sections.find(s => s.id === activeSection)?.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This section looks great! No improvements needed.
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
