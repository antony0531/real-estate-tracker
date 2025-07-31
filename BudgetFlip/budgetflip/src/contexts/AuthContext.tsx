import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, setupAPIInterceptor, type User as APIUser } from '../services/api';

interface User extends APIUser {
  initials: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup API interceptor for token refresh
    setupAPIInterceptor();
    
    // Check for stored session
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    try {
      const response = await authAPI.login(email, password);
      const { user } = response;
      
      // Generate initials
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const fullUser: User = { ...user, initials };
      
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      navigate('/projects');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Invalid email or password');
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    // Input validation
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Name validation
    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    try {
      const response = await authAPI.register(email, password, name);
      const { user } = response;
      
      // Generate initials
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const fullUser: User = { ...user, initials };
      
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      navigate('/projects');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}