import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage immediately
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    // Initialize from localStorage immediately
    return localStorage.getItem('authToken');
  });

  // Keep this useEffect for any additional sync needs
  useEffect(() => {
    // Load token from localStorage on mount
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Clear existing resume data from localStorage
    localStorage.removeItem('resumeData');
    localStorage.removeItem('interviewPrepQuestions');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('resumeDataCleared'));
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });

    const data = await res.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Clear existing resume data from localStorage
    localStorage.removeItem('resumeData');
    localStorage.removeItem('interviewPrepQuestions');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('resumeDataCleared'));
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('resumeData');
    localStorage.removeItem('interviewPrepQuestions');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('resumeDataCleared'));
    
    window.location.hash = 'login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
