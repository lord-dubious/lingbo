
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ProfileType } from '../types';

interface UserContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  addProfile: (name: string, type: ProfileType) => void;
  switchProfile: (profileId: string) => void;
  updateActiveProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('lingbo_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    return localStorage.getItem('lingbo_active_profile_id');
  });

  useEffect(() => {
    localStorage.setItem('lingbo_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeProfileId) localStorage.setItem('lingbo_active_profile_id', activeProfileId);
    else localStorage.removeItem('lingbo_active_profile_id');
  }, [activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const addProfile = (name: string, type: ProfileType) => {
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      name,
      type,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      streak: 1,
      level: 1,
      xp: 0,
      avatar: type === 'kid' ? '🐻' : '👤'
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const switchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
  };

  const updateActiveProfile = (data: Partial<UserProfile>) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...data } : p));
  };

  const logout = () => {
    setActiveProfileId(null);
  };

  return (
    <UserContext.Provider value={{ profiles, activeProfile, addProfile, switchProfile, updateActiveProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
