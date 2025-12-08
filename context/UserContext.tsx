
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ProfileType } from '../types';

interface UserContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  addProfile: (name: string, type: ProfileType) => void;
  switchProfile: (profileId: string) => void;
  updateActiveProfile: (data: Partial<UserProfile>) => void;
  completeLesson: (levelId: number) => void;
  saveGameScore: (gameId: string, score: number) => void;
  markTutorialSeen: (tutorialId: string) => void;
  deleteProfile: (id: string) => void;
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
      avatar: type === 'kid' ? '🐻' : '👤',
      progress: {
        completedLessons: [],
        gameScores: {},
        tutorialsSeen: []
      }
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

  const completeLesson = (levelId: number) => {
      if (!activeProfileId) return;
      setProfiles(prev => prev.map(p => {
          if (p.id !== activeProfileId) return p;
          const completed = p.progress?.completedLessons || [];
          if (completed.includes(levelId)) return p;
          
          return {
              ...p,
              xp: (p.xp || 0) + 100,
              progress: {
                  ...p.progress,
                  completedLessons: [...completed, levelId]
              }
          };
      }));
  };

  const saveGameScore = (gameId: string, score: number) => {
      if (!activeProfileId) return;
      setProfiles(prev => prev.map(p => {
          if (p.id !== activeProfileId) return p;
          const currentScores = p.progress?.gameScores || {};
          const bestScore = currentScores[gameId] || 0;
          
          if (score > bestScore) {
              return {
                  ...p,
                  progress: {
                      ...p.progress,
                      gameScores: {
                          ...currentScores,
                          [gameId]: score
                      }
                  }
              }
          }
          return p;
      }));
  };

  const markTutorialSeen = (tutorialId: string) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => {
      if (p.id !== activeProfileId) return p;
      const seen = p.progress?.tutorialsSeen || [];
      if (seen.includes(tutorialId)) return p;
      
      return {
        ...p,
        progress: {
          ...p.progress,
          tutorialsSeen: [...seen, tutorialId]
        }
      };
    }));
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) setActiveProfileId(null);
  };

  const logout = () => {
    setActiveProfileId(null);
  };

  return (
    <UserContext.Provider value={{ profiles, activeProfile, addProfile, switchProfile, updateActiveProfile, completeLesson, saveGameScore, markTutorialSeen, deleteProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
