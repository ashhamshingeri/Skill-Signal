import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export type UserRole = 'policymaker' | 'training_centre' | 'job_seeker' | 'admin';

export type NavTab =
  | 'landing'
  | 'dashboard'
  | 'skills'
  | 'districts'
  | 'forecasts'
  | 'gaps'
  | 'substitution'
  | 'recommendations'
  | 'ai-analyst'
  | 'data-sources'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'profile'
  | 'settings-security';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  education?: string;
  currentOccupation?: string;
  targetCareer?: string;
  currentSkills?: string[];
  skillProficiencies?: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
  experienceYears?: string | number;
  careerInterests?: string[];
  certifications?: string[];
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  isDemoAccount?: boolean;
  isEmailVerified?: boolean;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  user: UserProfile | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  selectedStateId: string;
  setSelectedStateId: (id: string) => void;
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;
  selectedSkillId: string;
  setSelectedSkillId: (id: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  liveSyncStatus: 'connected' | 'syncing' | 'offline';
  triggerSync: () => Promise<void>;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  login: (email: string, pass: string, remember?: boolean) => Promise<boolean>;
  demoLogin: (role: UserRole) => void;
  register: (data: { name: string; email: string; password: string; role: UserRole; organization?: string; education?: string; currentOccupation?: string; targetCareer?: string }) => Promise<boolean>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Saved user state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('skillsignal_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Default initial active tab: dashboard if logged in, landing if fresh visitor
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const saved = localStorage.getItem('skillsignal_user');
    return saved ? 'dashboard' : 'landing';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('skillsignal_theme') as ThemeMode) || 'light';
  });

  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [liveSyncStatus, setLiveSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Apply Theme to document root
  useEffect(() => {
    localStorage.setItem('skillsignal_theme', theme);
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    showToast(`Theme changed to ${newTheme} mode`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerSync = async () => {
    setLiveSyncStatus('syncing');
    showToast('Syncing real-time telemetry from NCS, SIDH & PLFS...', 'info');
    setTimeout(() => {
      setLiveSyncStatus('connected');
      showToast('All data pipelines synchronized successfully', 'success');
    }, 1200);
  };

  const login = async (email: string, pass: string, remember = false): Promise<boolean> => {
    try {
      const res = await api.login(email, pass, remember);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('skillsignal_user', JSON.stringify(res.user));
        if (res.token) localStorage.setItem('skillsignal_token', res.token);
        showToast(`Welcome back, ${res.user.name}`, 'success');
        setActiveTab('dashboard');
        return true;
      }
      return false;
    } catch {
      showToast('Invalid credentials. Try demo access below.', 'error');
      return false;
    }
  };

  const demoLogin = (role: UserRole) => {
    let demoUser: UserProfile;
    if (role === 'policymaker') {
      demoUser = {
        id: 'usr-demo-policy',
        name: 'Dr. Rajesh Verma',
        email: 'rajesh.verma@msde.gov.in',
        role: 'policymaker',
        organization: 'Ministry of Skill Development & Entrepreneurship',
        stateName: 'New Delhi HQ',
        isDemoAccount: true,
        isEmailVerified: true,
      };
    } else if (role === 'training_centre') {
      demoUser = {
        id: 'usr-demo-iti',
        name: 'Prof. Sunita Rao',
        email: 'director@iti-pune.gov.in',
        role: 'training_centre',
        organization: 'Government ITI Pune & PMKVY Center',
        stateName: 'Maharashtra',
        districtName: 'Pune',
        isDemoAccount: true,
        isEmailVerified: true,
      };
    } else if (role === 'job_seeker') {
      demoUser = {
        id: 'usr-demo-seeker',
        name: 'Aakash Sharma',
        email: 'aakash.sharma@skillsignal.in',
        role: 'job_seeker',
        education: 'Diploma in Mechanical Engineering',
        currentOccupation: 'Internal Combustion Engine (ICE) Mechanic',
        targetCareer: 'Electric Vehicle Powertrain Diagnostics',
        experienceYears: '3 Years',
        currentSkills: [
          'Mechanical chassis assembly & suspension',
          'Braking & regenerative hydraulics',
          'OBD-II diagnostic tools & fault code reading',
          'Workshop safety & high-current protocols',
        ],
        skillProficiencies: {
          'Mechanical chassis assembly & suspension': 'advanced',
          'Braking & regenerative hydraulics': 'advanced',
          'OBD-II diagnostic tools & fault code reading': 'intermediate',
          'Workshop safety & high-current protocols': 'intermediate',
        },
        careerInterests: ['Clean Mobility', 'Electric Vehicles', 'Automotive Automation'],
        certifications: ['Automotive Service Technician (Level 4)', 'Safety Protocol Clearance'],
        stateName: 'Karnataka',
        districtName: 'Bengaluru Urban',
        isDemoAccount: true,
        isEmailVerified: true,
      };
    } else {
      demoUser = {
        id: 'usr-demo-admin',
        name: 'System Admin',
        email: 'admin@skillsignal.gov.in',
        role: 'admin',
        organization: 'National Skill Development Agency',
        isDemoAccount: true,
        isEmailVerified: true,
      };
    }

    setUser(demoUser);
    localStorage.setItem('skillsignal_user', JSON.stringify(demoUser));
    showToast(`Signed in as ${demoUser.name} (${role.toUpperCase()})`, 'success');
    setActiveTab('dashboard');
  };

  const register = async (data: { name: string; email: string; password: string; role: UserRole; organization?: string; education?: string; currentOccupation?: string; targetCareer?: string }): Promise<boolean> => {
    try {
      const res = await api.register(data);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('skillsignal_user', JSON.stringify(res.user));
        showToast('Account created successfully!', 'success');
        setActiveTab('dashboard');
        return true;
      }
      return false;
    } catch {
      showToast('Registration failed. Please check input parameters.', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillsignal_user');
    localStorage.removeItem('skillsignal_token');
    showToast('Signed out of SkillSignal', 'info');
    setActiveTab('landing');
  };

  const setUserRole = (newRole: UserRole) => {
    if (user) {
      const updated: UserProfile = { ...user, role: newRole };
      // Provide appropriate defaults if switching role in demo
      if (newRole === 'job_seeker' && !updated.currentOccupation) {
        updated.education = 'Diploma in Mechanical Engineering';
        updated.currentOccupation = 'Internal Combustion Engine (ICE) Mechanic';
        updated.targetCareer = 'Electric Vehicle Powertrain Diagnostics';
        updated.currentSkills = [
          'Mechanical chassis assembly & suspension',
          'Braking & regenerative hydraulics',
          'OBD-II diagnostic tools & fault code reading',
          'Workshop safety & high-current protocols',
        ];
        updated.skillProficiencies = {
          'Mechanical chassis assembly & suspension': 'advanced',
          'Braking & regenerative hydraulics': 'advanced',
          'OBD-II diagnostic tools & fault code reading': 'intermediate',
          'Workshop safety & high-current protocols': 'intermediate',
        };
      }
      setUser(updated);
      localStorage.setItem('skillsignal_user', JSON.stringify(updated));
      showToast(`Switched workspace role to ${newRole.toUpperCase()}`, 'info');
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('skillsignal_user', JSON.stringify(updated));
      showToast('Profile updated successfully', 'success');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        isAuthenticated: !!user,
        userRole: user?.role || 'policymaker',
        setUserRole,
        selectedStateId,
        setSelectedStateId,
        selectedDistrictId,
        setSelectedDistrictId,
        selectedSkillId,
        setSelectedSkillId,
        searchOpen,
        setSearchOpen,
        notificationsOpen,
        setNotificationsOpen,
        liveSyncStatus,
        triggerSync,
        theme,
        setTheme,
        toasts,
        showToast,
        updateUser,
        login,
        demoLogin,
        register,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
