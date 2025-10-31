import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ResumeProvider } from './contexts/ResumeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPageNew';
import { ATSPage } from './pages/ATSPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { ImprovementPage } from './pages/ImprovementPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import MockInterviewPage from './pages/MockInterviewPage';
import InterviewHistoryPage from './pages/InterviewHistoryPage';

function AppContent() {
  // Initialize with current hash or default to 'home'
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || 'home';
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      setCurrentPage(hash);
    };

    // Initial load - ensure we're on the right page
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Protected pages that require authentication
  const protectedPages = ['builder', 'ats', 'questions', 'improvement', 'profile', 'interview', 'interview-history'];

  const renderPage = () => {
    // Check if user is trying to access a protected page without being authenticated
    if (protectedPages.includes(currentPage) && !isAuthenticated) {
      // Don't change the hash, just render login page
      // This preserves the intended destination
      return <LoginPage />;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'home':
        return <HomePage />;
      case 'builder':
        return <BuilderPage />;
      case 'ats':
        return <ATSPage />;
      case 'questions':
        return <QuestionsPage />;
      case 'improvement':
        return <ImprovementPage />;
      case 'profile':
        return <ProfilePage />;
      case 'interview':
        return <MockInterviewPage />;
      case 'interview-history':
        return <InterviewHistoryPage />;
      default:
        return <HomePage />;
    }
  };

  const showNavAndFooter = currentPage !== 'login' && currentPage !== 'register';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      {showNavAndFooter && <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />}
      <main className="flex-1">
        {renderPage()}
      </main>
      {showNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ResumeProvider>
          <AppContent />
        </ResumeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
