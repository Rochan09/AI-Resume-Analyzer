import { Moon, Sun, Menu, X, FileText, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only show protected nav items when user is authenticated
  const navItems = isAuthenticated
    ? [
        { id: 'home', label: 'Home' },
        { id: 'builder', label: 'Builder' },
        { id: 'ats', label: 'ATS Score' },
        { id: 'questions', label: 'Interview Prep' },
        { id: 'interview', label: 'AI Interview' },
      ]
    : [{ id: 'home', label: 'Home' }];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    window.location.hash = '';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FileText className="w-6 h-6" />
            <span>SmartResume AI</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user && (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.fullName}
                  </span>
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {/* Profile Header */}
                      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold">{user.fullName}</p>
                            <p className="text-xs text-blue-100">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Profile Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={() => handleNavigate('profile')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <div>
                            <p className="font-medium text-sm">My Profile</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">View all resumes</p>
                          </div>
                        </button>

                        <button
                          onClick={() => handleNavigate('builder')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                          <div>
                            <p className="font-medium text-sm">Resume Builder</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Create or edit resume</p>
                          </div>
                        </button>

                        <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <div>
                            <p className="font-medium text-sm">Logout</p>
                            <p className="text-xs text-red-500 dark:text-red-400">Sign out of your account</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => handleNavigate('login')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigate('register')}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`block w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {isAuthenticated && user && (
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNavigate('profile')}
                    className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <button
                    onClick={() => handleNavigate('login')}
                    className="block w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavigate('register')}
                    className="block w-full text-left px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
