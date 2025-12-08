import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, ProfileType } from '../types';

interface UserContextType {
    profiles: UserProfile[];
    activeProfile: UserProfile | null;
    isLoading: boolean;
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

const PROFILES_KEY = 'lingbo_profiles';
const ACTIVE_PROFILE_KEY = 'lingbo_active_profile_id';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load data from AsyncStorage on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [savedProfiles, savedActiveId] = await Promise.all([
                    AsyncStorage.getItem(PROFILES_KEY),
                    AsyncStorage.getItem(ACTIVE_PROFILE_KEY),
                ]);
                if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
                if (savedActiveId) setActiveProfileId(savedActiveId);
            } catch (error) {
                console.error('Failed to load user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Persist profiles to AsyncStorage
    useEffect(() => {
        if (!isLoading) {
            AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
        }
    }, [profiles, isLoading]);

    // Persist active profile ID
    useEffect(() => {
        if (!isLoading) {
            if (activeProfileId) {
                AsyncStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
            } else {
                AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
            }
        }
    }, [activeProfileId, isLoading]);

    const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

    const addProfile = useCallback((name: string, type: ProfileType) => {
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
    }, []);

    const switchProfile = useCallback((profileId: string) => {
        setActiveProfileId(profileId);
    }, []);

    const updateActiveProfile = useCallback((data: Partial<UserProfile>) => {
        if (!activeProfileId) return;
        setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...data } : p));
    }, [activeProfileId]);

    const completeLesson = useCallback((levelId: number) => {
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
    }, [activeProfileId]);

    const saveGameScore = useCallback((gameId: string, score: number) => {
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
                };
            }
            return p;
        }));
    }, [activeProfileId]);

    const markTutorialSeen = useCallback((tutorialId: string) => {
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
    }, [activeProfileId]);

    const deleteProfile = useCallback((id: string) => {
        setProfiles(prev => prev.filter(p => p.id !== id));
        if (activeProfileId === id) setActiveProfileId(null);
    }, [activeProfileId]);

    const logout = useCallback(() => {
        setActiveProfileId(null);
    }, []);

    return (
        <UserContext.Provider value={{
            profiles,
            activeProfile,
            isLoading,
            addProfile,
            switchProfile,
            updateActiveProfile,
            completeLesson,
            saveGameScore,
            markTutorialSeen,
            deleteProfile,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
