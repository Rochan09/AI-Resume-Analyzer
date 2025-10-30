import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, FileText, TrendingUp, LogOut, Edit, Trash2, BarChart3, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ResumeCard {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  atsScore?: number;
  grade?: string;
  lastAnalyzed?: string;
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageScore: 0,
    bestScore: 0,
    lastActivity: ''
  });

  useEffect(() => {
    fetchUserResumes();
  }, []);

  const fetchUserResumes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/resume', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes || []);
        calculateStats(data.resumes || []);
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (resumeList: ResumeCard[]) => {
    const total = resumeList.length;
    const scoresWithATS = resumeList.filter(r => r.atsScore).map(r => r.atsScore || 0);
    const average = scoresWithATS.length > 0 
      ? Math.round(scoresWithATS.reduce((a, b) => a + b, 0) / scoresWithATS.length)
      : 0;
    const best = scoresWithATS.length > 0 ? Math.max(...scoresWithATS) : 0;
    
    const lastActivity = resumeList.length > 0
      ? new Date(resumeList[0].updatedAt).toLocaleDateString()
      : 'No activity';

    setStats({
      totalResumes: total,
      averageScore: average,
      bestScore: best,
      lastActivity
    });
  };

  const handleLogout = () => {
    logout();
    window.location.hash = '';
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/resume/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setResumes(resumes.filter(r => r._id !== id));
        calculateStats(resumes.filter(r => r._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 80) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (score >= 70) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (score >= 60) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getGradeIcon = (grade?: string) => {
    if (!grade) return AlertCircle;
    if (grade === 'Excellent') return Award;
    if (grade === 'Very Good' || grade === 'Good') return CheckCircle;
    return AlertCircle;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* User Avatar */}
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                  <User className="w-12 h-12 text-white" />
                </div>
                
                {/* User Info */}
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {user?.name || 'User'}
                  </h1>
                  <div className="flex items-center gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-medium rounded-xl transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Resumes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalResumes}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resumes</h3>
            </motion.div>

            {/* Average Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average ATS Score</h3>
            </motion.div>

            {/* Best Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className={`text-3xl font-bold ${getScoreColor(stats.bestScore)}`}>
                  {stats.bestScore}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Score</h3>
            </motion.div>

            {/* Last Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Last Activity</h3>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{stats.lastActivity}</p>
            </motion.div>
          </div>

          {/* Resumes Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    My Resumes
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage and track your resume versions
                  </p>
                </div>
                <button
                  onClick={() => window.location.hash = 'builder'}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Create New Resume
                </button>
              </div>
            </div>

            {/* Resume Cards */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Resumes Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first resume to get started
                  </p>
                  <button
                    onClick={() => window.location.hash = 'builder'}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Create Resume
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumes.map((resume, index) => {
                    const GradeIcon = getGradeIcon(resume.grade);
                    return (
                      <motion.div
                        key={resume._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl"
                      >
                        {/* Card Header */}
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                {resume.title || 'Untitled Resume'}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Updated {new Date(resume.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* ATS Score Badge */}
                          {resume.atsScore !== undefined ? (
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${getScoreBackground(resume.atsScore)}`}>
                              <GradeIcon className={`w-5 h-5 ${getScoreColor(resume.atsScore)}`} />
                              <div>
                                <div className={`text-2xl font-bold ${getScoreColor(resume.atsScore)}`}>
                                  {resume.atsScore}
                                  <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
                                </div>
                                {resume.grade && (
                                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    {resume.grade}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                              <AlertCircle className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Not Analyzed
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="p-4 bg-white dark:bg-gray-800 flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Load and edit resume
                              window.location.hash = 'builder';
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => window.location.hash = 'ats'}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Analyze
                          </button>
                          <button
                            onClick={() => handleDeleteResume(resume._id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
