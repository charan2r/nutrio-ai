'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserPreferences {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  healthGoals: string[];
  mealsPerDay: number;
  calorieTarget: number;
  allergies: string[];
}

interface User {
  id: string;
  email: string;
  name: string;
  preferences?: UserPreferences;
  onboardingComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (preferences: UserPreferences) => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nutrio_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      onboardingComplete: false,
    };
    setUser(newUser);
    localStorage.setItem('nutrio_user', JSON.stringify(newUser));
  };

  const register = async (email: string, password: string, name: string) => {
    // Mock registration
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      onboardingComplete: false,
    };
    setUser(newUser);
    localStorage.setItem('nutrio_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nutrio_user');
  };

  const updatePreferences = (preferences: UserPreferences) => {
    if (user) {
      const updatedUser = { ...user, preferences };
      setUser(updatedUser);
      localStorage.setItem('nutrio_user', JSON.stringify(updatedUser));
    }
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, onboardingComplete: true };
      setUser(updatedUser);
      localStorage.setItem('nutrio_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        login,
        register,
        logout,
        updatePreferences,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
