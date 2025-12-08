import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  progress: {
    completedLessons: number[];
    unlockedLevels: number[];
    quizScores: Record<number, number>;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
}

interface UserContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  createProfile: (name: string, avatar: string) => void;
  switchProfile: (profileId: string) => void;
  updateProgress: (xpDetails: number) => void;
  completeLesson: (levelId: number) => void;
  deleteProfile: (profileId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProfiles = await AsyncStorage.getItem('lingbo_profiles');
        const savedActiveId = await AsyncStorage.getItem('lingbo_active_profile_id');

        if (savedProfiles) {
          const parsedProfiles = JSON.parse(savedProfiles);
          setProfiles(parsedProfiles);

          if (savedActiveId) {
            const active = parsedProfiles.find((p: UserProfile) => p.id === savedActiveId);
            if (active) setActiveProfile(active);
          }
        }
      } catch (e) {
        console.error("Failed to load user data", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to AsyncStorage whenever state changes
  useEffect(() => {
    if (loading) return;
    const saveData = async () => {
        try {
            await AsyncStorage.setItem('lingbo_profiles', JSON.stringify(profiles));
            if (activeProfile) {
                await AsyncStorage.setItem('lingbo_active_profile_id', activeProfile.id);
            } else {
                await AsyncStorage.removeItem('lingbo_active_profile_id');
            }
        } catch (e) {
            console.error("Failed to save user data", e);
        }
    };
    saveData();
  }, [profiles, activeProfile, loading]);

  const createProfile = (name: string, avatar: string) => {
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      name,
      avatar,
      level: 1,
      xp: 0,
      progress: {
        completedLessons: [],
        unlockedLevels: [1],
        quizScores: {}
      },
      settings: {
        soundEnabled: true,
        musicEnabled: true
      }
    };

    setProfiles(prev => [...prev, newProfile]);
    setActiveProfile(newProfile);
  };

  const switchProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) setActiveProfile(profile);
  };

  const updateProgress = (xpDelta: number) => {
    if (!activeProfile) return;

    const updatedProfile = { ...activeProfile, xp: activeProfile.xp + xpDelta };
    // Simple level up logic: every 100 XP is a level
    const newLevel = Math.floor(updatedProfile.xp / 100) + 1;
    if (newLevel > updatedProfile.level) {
        updatedProfile.level = newLevel;
    }

    setActiveProfile(updatedProfile);
    setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const completeLesson = (levelId: number) => {
     if (!activeProfile) return;

     const updatedProfile = { ...activeProfile };
     if (!updatedProfile.progress.completedLessons.includes(levelId)) {
         updatedProfile.progress.completedLessons.push(levelId);
         // Unlock next level
         const nextLevel = levelId + 1;
         if (!updatedProfile.progress.unlockedLevels.includes(nextLevel)) {
             updatedProfile.progress.unlockedLevels.push(nextLevel);
         }
         // Add XP for completion
         updatedProfile.xp += 100;
         updatedProfile.level = Math.floor(updatedProfile.xp / 100) + 1;
     }

     setActiveProfile(updatedProfile);
     setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const deleteProfile = (profileId: string) => {
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      if (activeProfile?.id === profileId) {
          setActiveProfile(null);
      }
  };

  return (
    <UserContext.Provider value={{
      profiles,
      activeProfile,
      createProfile,
      switchProfile,
      updateProgress,
      completeLesson,
      deleteProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
