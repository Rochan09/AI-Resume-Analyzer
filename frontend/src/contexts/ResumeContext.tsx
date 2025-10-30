import { createContext, useContext, useEffect, useState } from 'react';

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  skills: string[];
  skillsV2?: {
    technical: Array<{ id: string; name: string; level: string }>;
    soft: Array<{ id: string; name: string; level: string }>;
    languages: Array<{ id: string; name: string; level: string }>;
  };
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string;
    link?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  },
  summary: '',
  education: [],
  experience: [],
  skills: [],
  skillsV2: {
    technical: [],
    soft: [],
    languages: [],
  },
  projects: [],
};

interface ResumeContextType {
  resumeData: ResumeData;
  updateResumeData: (data: Partial<ResumeData>) => void;
  resetResumeData: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const stored = localStorage.getItem('resumeData');
    return stored ? JSON.parse(stored) : defaultResumeData;
  });

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Listen for resume data cleared event (when user logs in/registers)
  useEffect(() => {
    const handleResumeDataCleared = () => {
      setResumeData(defaultResumeData);
    };

    window.addEventListener('resumeDataCleared', handleResumeDataCleared);
    return () => window.removeEventListener('resumeDataCleared', handleResumeDataCleared);
  }, []);

  const updateResumeData = (data: Partial<ResumeData>) => {
    setResumeData(prev => ({ ...prev, ...data }));
  };

  const resetResumeData = () => {
    setResumeData(defaultResumeData);
    localStorage.removeItem('resumeData');
  };

  return (
    <ResumeContext.Provider value={{ resumeData, updateResumeData, resetResumeData }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) throw new Error('useResume must be used within ResumeProvider');
  return context;
}
