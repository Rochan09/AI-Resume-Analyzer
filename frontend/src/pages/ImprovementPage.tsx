import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, GraduationCap, Award, FileText, Lightbulb, CheckCircle, AlertCircle, Sparkles, TrendingUp, Mail, Target, Zap, BarChart3 } from 'lucide-react';

type Section = 'contact' | 'summary' | 'experience' | 'skills' | 'education' | 'formatting' | 'actionWords' | 'length' | 'jobMatch';

interface Suggestion {
  id: string;
  type: 'critical' | 'important' | 'good' | 'info';
  title: string;
  description: string;
  impact: string;
  pointsGain: number;
  category: string;
  actionable: string[];
}

interface ATSData {
  score: number;
  grade: string;
  suggestions: string[];
  strengths: string[];
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
  improvementPotential?: {
    possibleGain: number;
    topOpportunities: Array<{
      category: string;
      currentScore: number;
      maxScore: number;
      potentialPoints: number;
    }>;
  };
}

export function ImprovementPage() {
  const [activeSection, setActiveSection] = useState<Section>('contact');
  const [atsData, setAtsData] = useState<ATSData | null>(null);
  const [suggestions, setSuggestions] = useState<Record<Section, Suggestion[]>>({
    contact: [],
    summary: [],
    experience: [],
    skills: [],
    education: [],
    formatting: [],
    actionWords: [],
    length: [],
    jobMatch: []
  });

  // Load ATS data from sessionStorage and generate suggestions
  useEffect(() => {
    const savedData = sessionStorage.getItem('atsAnalysisData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setAtsData(data);
      
      // Generate suggestions based on ATS analysis
      const generatedSuggestions = generateSuggestions(data);
      setSuggestions(generatedSuggestions);
      
      // Set first section with suggestions as active
      const firstSectionWithSuggestions = Object.entries(generatedSuggestions).find(([_, suggs]) => suggs.length > 0)?.[0] as Section;
      if (firstSectionWithSuggestions) {
        setActiveSection(firstSectionWithSuggestions);
      }
    }
  }, []);

  // Generate smart suggestions based on ATS analysis
  const generateSuggestions = (data: ATSData): Record<Section, Suggestion[]> => {
    const newSuggestions: Record<Section, Suggestion[]> = {
      contact: [],
      summary: [],
      experience: [],
      skills: [],
      education: [],
      formatting: [],
      actionWords: [],
      length: [],
      jobMatch: []
    };

    if (!data.detailedAnalysis) return newSuggestions;

    // Contact Information
    if (data.detailedAnalysis.contact) {
      const { score, maxScore } = data.detailedAnalysis.contact;
      const pointsLost = maxScore - score;
      if (pointsLost > 0) {
        const missingItems = [];
        if (pointsLost >= 8) missingItems.push('email', 'phone', 'LinkedIn', 'GitHub/portfolio');
        else if (pointsLost >= 6) missingItems.push('phone', 'LinkedIn', 'GitHub/portfolio');
        else if (pointsLost >= 4) missingItems.push('LinkedIn', 'GitHub/portfolio');
        else if (pointsLost >= 2) missingItems.push('LinkedIn or GitHub/portfolio');

        newSuggestions.contact.push({
          id: 'c1',
          type: pointsLost >= 5 ? 'critical' : 'important',
          title: 'Add Missing Contact Information',
          description: `Your contact section is missing ${pointsLost} points out of ${maxScore}. Complete contact info makes it easy for recruiters to reach you.`,
          impact: `+${pointsLost} points`,
          pointsGain: pointsLost,
          category: 'Contact',
          actionable: [
            ...missingItems.map(item => `Add your ${item}`),
            'Place contact info prominently at the top',
            'Use professional email address',
            'Include clickable LinkedIn URL'
          ]
        });
      }
    }

    // Professional Summary
    if (data.detailedAnalysis.summary) {
      const { score, maxScore } = data.detailedAnalysis.summary;
      const pointsLost = maxScore - score;
      if (pointsLost > 0) {
        newSuggestions.summary.push({
          id: 'su1',
          type: pointsLost >= 5 ? 'critical' : 'important',
          title: 'Enhance Professional Summary',
          description: `Your summary needs improvement to earn ${pointsLost} more points. A strong summary (50-100 words) showcases your value proposition.`,
          impact: `+${pointsLost} points`,
          pointsGain: pointsLost,
          category: 'Summary',
          actionable: [
            'Write 50-100 words highlighting your expertise',
            'Include years of experience and key achievements',
            'Mention 2-3 core competencies',
            'Use industry-specific keywords',
            'Show your unique value proposition',
            'Example: "Results-driven [Role] with [X] years experience in [Industry]. Proven track record of [Achievement]. Expert in [Skills]."'
          ]
        });
      }
    }

    // Work Experience
    if (data.detailedAnalysis.experience) {
      const { score, maxScore } = data.detailedAnalysis.experience;
      const pointsLost = maxScore - score;
      if (pointsLost > 0) {
        newSuggestions.experience.push({
          id: 'ex1',
          type: pointsLost >= 10 ? 'critical' : pointsLost >= 5 ? 'important' : 'good',
          title: 'Strengthen Work Experience Section',
          description: `Your experience section could gain ${pointsLost} points. Include dates, company names, and 8+ bullet points across all roles.`,
          impact: `+${pointsLost} points`,
          pointsGain: pointsLost,
          category: 'Experience',
          actionable: [
            'Add 8+ bullet points total (2-4 per role)',
            'Include clear dates for each position',
            'Specify company names and your title',
            'Start bullets with action verbs',
            'Quantify achievements with metrics',
            'Show progression and growth',
            'List 2-3 recent relevant positions'
          ]
        });
      }
    }

    // Skills
    if (data.detailedAnalysis.skills) {
      const { score, maxScore } = data.detailedAnalysis.skills;
      const pointsLost = maxScore - score;
      if (pointsLost > 0) {
        newSuggestions.skills.push({
          id: 'sk1',
          type: pointsLost >= 8 ? 'critical' : pointsLost >= 5 ? 'important' : 'good',
          title: 'Expand Skills Section',
          description: `Add ${pointsLost} more points by including 15+ diverse skills across 5+ categories (technical, soft skills, tools, languages).`,
          impact: `+${pointsLost} points`,
          pointsGain: pointsLost,
          category: 'Skills',
          actionable: [
            'List 15+ relevant skills minimum',
            'Include skills from 5+ categories',
            'Add: Technical Skills, Programming Languages, Frameworks, Tools, Soft Skills',
            'Match skills to job description',
            'Use exact terminology from job posting',
            'Organize by proficiency or category',
            'Include certifications if available'
          ]
        });
      }
    }

    // Action Verbs & Achievements
    if (data.detailedAnalysis.actionWords) {
      const { score, maxScore, verbCount, achievementCount } = data.detailedAnalysis.actionWords;
      const pointsLost = maxScore - score;
      if (pointsLost > 0) {
        newSuggestions.actionWords.push({
          id: 'av1',
          type: pointsLost >= 8 ? 'critical' : 'important',
          title: 'Add Action Verbs & Quantify Achievements',
          description: `You have ${verbCount} action verbs and ${achievementCount} metrics. Add ${pointsLost} more points with 12+ strong verbs and 8+ quantified achievements.`,
          impact: `+${pointsLost} points`,
          pointsGain: pointsLost,
          category: 'Action Verbs',
          actionable: [
            'Use 12+ action verbs: Spearheaded, Orchestrated, Optimized, Implemented, Launched',
            'Add 8+ metrics: percentages, dollar amounts, time saved, team size',
            'Replace weak verbs: "Responsible for" → "Managed", "Worked on" → "Developed"',
            'Quantify everything: "Increased sales by 30%", "Led team of 15", "Reduced costs by $50K"',
            'Show impact with before/after comparisons'
          ]
        });
      }
    }

    // Formatting
    if (data.detailedAnalysis.formatting) {
      const { score, maxScore } = data.detailedAnalysis.formatting;
      const pointsLost = maxScore - score;
      if (pointsLost > 0) {
        newSuggestions.formatting.push({
          id: 'f1',
          type: pointsLost >= 5 ? 'important' : 'good',
          title: 'Improve Resume Formatting',
          description: `Better formatting can add ${pointsLost} points. Use bullet points (10+), clear sections (4+), and consistent structure.`,
          impact: `+${pointsLost} points`,
          pointsGain: pointsLost,
          category: 'Formatting',
          actionable: [
            'Use 10+ bullet points throughout',
            'Create 4+ clear sections: Contact, Summary, Experience, Skills, Education',
            'Maintain consistent formatting',
            'Use standard section headers',
            'Add white space for readability',
            'Use professional fonts',
            'Keep single column layout for ATS compatibility'
          ]
        });
      }
    }

    // Education
    if (data.detailedAnalysis.education) {
      const { score, maxScore } = data.detailedAnalysis.education;
      const pointsLost = maxScore - score;
      if (pointsLost > 0) {
        newSuggestions.education.push({
          id: 'ed1',
          type: pointsLost >= 5 ? 'important' : 'good',
          title: 'Complete Education Section',
          description: `Add ${pointsLost} points by including degree, major, graduation year, and institution name.`,
          impact: `+${pointsLost} points`,
          pointsGain: pointsLost,
          category: 'Education',
          actionable: [
            'Include your degree (Bachelor\'s, Master\'s, etc.)',
            'Specify your major/field of study',
            'Add graduation year',
            'Include institution name',
            'Add relevant coursework if recent graduate',
            'Include GPA if above 3.5',
            'List relevant certifications'
          ]
        });
      }
    }

    // Resume Length
    if (data.detailedAnalysis.length) {
      const { score, maxScore, wordCount } = data.detailedAnalysis.length;
      const pointsLost = maxScore - score;
      if (pointsLost > 0) {
        const optimal = wordCount < 450 ? 'too short' : 'too long';
        newSuggestions.length.push({
          id: 'l1',
          type: pointsLost >= 5 ? 'important' : 'good',
          title: `Resume is ${optimal === 'too short' ? 'Too Short' : 'Too Long'}`,
          description: `Your resume is ${wordCount} words. Optimal length is 450-700 words. ${optimal === 'too short' ? 'Add more detail' : 'Condense content'} to gain ${pointsLost} points.`,
          impact: `+${pointsLost} points`,
          pointsGain: pointsLost,
          category: 'Length',
          actionable: optimal === 'too short' ? [
            'Expand experience descriptions',
            'Add more bullet points per role',
            'Include additional relevant positions',
            'Add skills section with more items',
            'Include certifications or projects',
            'Target: 450-700 words total'
          ] : [
            'Remove redundant information',
            'Condense older experience',
            'Focus on recent 10 years',
            'Remove irrelevant positions',
            'Tighten bullet point language',
            'Target: 450-700 words total'
          ]
        });
      }
    }

    // Job Match
    if (data.detailedAnalysis.jobMatch) {
      const { score, maxScore, matchRatio } = data.detailedAnalysis.jobMatch;
      const pointsLost = maxScore - score;
      if (pointsLost > 0) {
        newSuggestions.jobMatch.push({
          id: 'jm1',
          type: pointsLost >= 5 ? 'critical' : 'important',
          title: 'Improve Job Description Match',
          description: `Current match: ${matchRatio || '0%'}. Add ${pointsLost} points by including more keywords from the job description.`,
          impact: `+${pointsLost} points`,
          pointsGain: pointsLost,
          category: 'Job Match',
          actionable: [
            'Read job description carefully',
            'Identify key skills and requirements',
            'Mirror exact terminology used in posting',
            'Include required technologies/tools',
            'Add mentioned methodologies (Agile, Scrum, etc.)',
            'Use industry-specific keywords',
            'Target 50%+ keyword match for full points'
          ]
        });
      }
    }

    return newSuggestions;
  };


  const sections = [
    { id: 'contact' as Section, label: 'Contact Info', icon: Mail, count: suggestions.contact.length },
    { id: 'summary' as Section, label: 'Summary', icon: FileText, count: suggestions.summary.length },
    { id: 'experience' as Section, label: 'Experience', icon: Briefcase, count: suggestions.experience.length },
    { id: 'skills' as Section, label: 'Skills', icon: Award, count: suggestions.skills.length },
    { id: 'education' as Section, label: 'Education', icon: GraduationCap, count: suggestions.education.length },
    { id: 'formatting' as Section, label: 'Formatting', icon: Target, count: suggestions.formatting.length },
    { id: 'actionWords' as Section, label: 'Action Verbs', icon: Zap, count: suggestions.actionWords.length },
    { id: 'length' as Section, label: 'Length', icon: BarChart3, count: suggestions.length.length },
    { id: 'jobMatch' as Section, label: 'Job Match', icon: TrendingUp, count: suggestions.jobMatch.length }
  ];

  const totalSuggestions = Object.values(suggestions).flat().length;
  const totalPointsGain = Object.values(suggestions).flat().reduce((sum, s) => sum + s.pointsGain, 0);

  const handleBack = () => {
    window.location.hash = 'ats';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'important': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'good': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'info': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertCircle;
      case 'important': return Lightbulb;
      case 'good': return CheckCircle;
      case 'info': return Sparkles;
      default: return AlertCircle;
    }
  };

  if (!atsData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Analysis Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please analyze your resume first to see improvement suggestions.</p>
          <button
            onClick={() => window.location.hash = 'ats'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Go to ATS Analysis
          </button>
        </div>
      </div>
    );
  }

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
              Back to ATS Analysis
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Resume Improvement Plan
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Follow these specific recommendations to boost your ATS score
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {atsData.score}
                  <span className="text-2xl text-gray-400 dark:text-gray-500">/100</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Score</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[300px,1fr] gap-8">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Score Improvement Potential */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold">Improvement Potential</h3>
                </div>
                <div className="text-4xl font-bold mb-1">
                  +{totalPointsGain}
                </div>
                <p className="text-blue-100 text-sm">
                  points possible gain
                </p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-sm mb-1">Potential Score</div>
                  <div className="text-2xl font-bold">
                    {Math.min(100, atsData.score + totalPointsGain)}
                    <span className="text-lg text-blue-200">/100</span>
                  </div>
                </div>
              </div>

              {/* Sections List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Improvement Areas ({totalSuggestions})
                  </h3>
                </div>
                <div className="p-2 max-h-[600px] overflow-y-auto">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    const hasIssues = section.count > 0;
                    
                    if (!hasIssues) return null;
                    
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
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {section.count}
                          </span>
                        </div>
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
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className={`p-6 border-b-2 ${getTypeColor(suggestion.type)}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/50">
                              <TypeIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                {suggestion.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                  {suggestion.impact}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {suggestion.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {suggestion.description}
                        </p>
                      </div>

                      {/* Card Content - Actionable Steps */}
                      <div className="p-6">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          Action Steps:
                        </h4>
                        <div className="space-y-2.5">
                          {suggestion.actionable.map((action, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                {idx + 1}
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                                {action}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                              {suggestion.type === 'critical' ? 'Critical: High impact on score' :
                               suggestion.type === 'important' ? 'Important: Significant improvement' :
                               suggestion.type === 'good' ? 'Good: Helpful optimization' :
                               'Info: Nice to have'}
                            </span>
                          </div>
                          <button
                            onClick={() => window.location.hash = 'builder'}
                            className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                          >
                            <FileText className="w-4 h-4" />
                            Edit Resume
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Perfect Score! 🎉
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your {sections.find(s => s.id === activeSection)?.label} section is excellent. No improvements needed!
                  </p>
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Back to Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
