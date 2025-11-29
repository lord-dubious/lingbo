
import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { HashRouter, Routes, Route, useNavigate, useParams, Link, Navigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Gamepad2,
  BookOpen,
  PlayCircle,
  Mic,
  ChevronRight,
  Lock,
  Volume2,
  Image as ImageIcon,
  CheckCircle,
  RefreshCcw,
  Send,
  AudioWaveform,
  StopCircle,
  Play,
  Settings,
  Trophy,
  Flame,
  Calendar,
  X,
  Type,
  Puzzle,
  ArrowLeft,
  Star,
  Zap,
  Plus,
  Users,
  Smile,
  Layout as LayoutIcon,
  Video,
  Music,
  FileText,
  Sparkles,
  Timer,
  Hash,
  Lightbulb,
  Loader2,
  Download,
  Eraser,
  Printer
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

import Layout from './components/Layout';
import IgboKeyboard from './components/IgboKeyboard';
import WorksheetFlipbook from './components/WorksheetFlipbook';
import TracingCanvas from './components/TracingCanvas';
import { ADULT_CURRICULUM, KIDS_FLASHCARDS, KIDS_GAMES, LIBRARY_BOOKS, VIDEO_RESOURCES, IGBO_ALPHABET_FULL, ACHIEVEMENTS, MEMORY_GAME_DATA, IGBO_NUMBERS, WORKSHEETS, FUN_FACTS } from './constants';
import {
  generateTutorResponse,
  generateIgboSpeech,
  transcribeUserAudio,
  analyzePronunciation,
  blobToBase64,
  getGeminiClient
} from './services/geminiService';
import { playPCMAudio, playGameSound } from './services/audioService';
import { ChatMessage, VideoResource, AnalysisResult, UserProfile, ProfileType, QuizItem } from './types';

const APP_LOGO = 'https://i.ibb.co/RGFF4bgS/lingbo-logo-main-png.png';

// --- Global Context for User & Profiles ---
interface UserContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  addProfile: (name: string, type: ProfileType) => void;
  switchProfile: (profileId: string) => void;
  updateActiveProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};


// --- Components ---


const ConfettiOverlay = ({ onRestart }: { onRestart?: () => void }) => (
  <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center animate-in zoom-in p-6 text-center backdrop-blur-sm">
    <div className="mb-6 relative">
      <Sparkles size={80} className="text-yellow-400 animate-spin-slow absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <Trophy size={100} className="text-purple-500 relative z-10 drop-shadow-xl" />
    </div>
    <h3 className="font-kids font-bold text-4xl text-pink-500 mb-2">Great Job!</h3>
    <p className="font-bold text-gray-500 text-lg mb-8">O mara nma!</p>
    {onRestart && <button onClick={onRestart} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">Play Again</button>}
  </div>
);

// 1. Onboarding
const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const { addProfile } = useUser();
  const navigate = useNavigate();

  const handleFinish = () => {
    if (name.trim()) {
      addProfile(name, 'adult'); // Default first profile is Adult
      navigate('/hub');
    }
  };

  const slides = [
    {
      title: "Nnọ! Welcome",
      subtitle: "A language for generations.",
      desc: "Your journey to mastering the Igbo Language starts here",
      image: APP_LOGO
    },
    {
      title: "Learn Naturally",
      subtitle: "",
      desc: "Discover the language through stories, everyday words, and gentle practice. Learn The Igbo Way.",
      icon: "🌿",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Your Name",
      subtitle: "",
      desc: "Let's personalize your experience.",
      icon: "👋",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      isInput: true
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center relative">
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="absolute top-6 left-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          {slides[step].image ? (
            <div className="flex flex-col items-center">
              <h1 className="text-6xl font-bold text-primary mb-4 tracking-tight">Lingbo</h1>
              <img src={slides[step].image} alt="Lingbo" className="w-48 h-48 object-contain mx-auto animate-in zoom-in duration-500" />
            </div>
          ) : (
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${slides[step].iconBg} ${slides[step].iconColor} mx-auto animate-in zoom-in duration-500 shadow-lg`}>
              <div className="text-6xl">{slides[step].icon}</div>
            </div>
          )}
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slides[step].title}</h2>
        {slides[step].subtitle && <h3 className="text-lg text-primary font-medium mb-4">{slides[step].subtitle}</h3>}
        <p className="text-gray-500 text-lg mb-8 max-w-xs mx-auto">{slides[step].desc}</p>

        {slides[step].isInput && (
          <div className="w-full mb-8 animate-in slide-in-from-bottom-8 delay-100">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-gray-600 text-white font-bold placeholder:text-gray-300 text-center text-xl outline-none focus:ring-4 focus:ring-primary/30 shadow-lg transition-all"
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-sm mt-auto">
        {step < 2 ? (
          <button onClick={() => setStep(step + 1)} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors text-lg shadow-lg hover:shadow-xl shadow-orange-200">
            Next
          </button>
        ) : (
          <button onClick={handleFinish} disabled={!name.trim()} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-lg hover:shadow-xl shadow-orange-200">
            Get Started
          </button>
        )}
        <div className="flex gap-2 justify-center mt-8">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Profile Selector
const ProfileSelector = ({ type, onClose }: { type: ProfileType, onClose: () => void }) => {
  const { profiles, switchProfile, addProfile } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  const filteredProfiles = profiles.filter(p => p.type === type);

  const handleSelect = (id: string) => {
    switchProfile(id);
    onClose();
    if (type === 'adult') navigate('/adults');
    else navigate('/kids');
  };

  const handleCreate = () => {
    if (newName.trim()) {
      addProfile(newName.trim(), type);
      onClose();
      if (type === 'adult') navigate('/adults');
      else navigate('/kids');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 animate-in zoom-in duration-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Who is learning?</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {!isAdding ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProfiles.map(p => (
              <button key={p.id} onClick={() => handleSelect(p.id)} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                <div className="w-20 h-20 rounded-full bg-gray-100 text-4xl flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  {p.avatar}
                </div>
                <span className="font-bold text-gray-700">{p.name}</span>
              </button>
            ))}
            <button onClick={() => setIsAdding(true)} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-primary group transition-all">
              <div className="w-20 h-20 rounded-full bg-white text-gray-400 flex items-center justify-center group-hover:text-primary transition-colors">
                <Plus size={32} />
              </div>
              <span className="font-bold text-gray-500 group-hover:text-primary">Add Profile</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-600">New {type === 'adult' ? 'Adult' : 'Kid'} Profile</h3>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Enter Name"
              className="w-full p-4 bg-gray-100 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary text-gray-800"
            />
            <div className="flex gap-3">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50">Create</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Main Hub
const Hub = () => {
  const [showProfileSelector, setShowProfileSelector] = useState<ProfileType | null>(null);
  const [dailyWord, setDailyWord] = useState(KIDS_FLASHCARDS[0]);
  const [funFact, setFunFact] = useState(FUN_FACTS[0]);

  useEffect(() => {
    const day = new Date().getDate();
    setDailyWord(KIDS_FLASHCARDS[day % KIDS_FLASHCARDS.length]);
    setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-20">
      {showProfileSelector && <ProfileSelector type={showProfileSelector} onClose={() => setShowProfileSelector(null)} />}

      <header className="max-w-4xl mx-auto flex items-center justify-between py-4 mb-6">
        <div className="w-10"></div>
        <div className="flex items-center gap-3">
          <img src={APP_LOGO} alt="Lingbo" className="w-12 h-12 object-contain" />
          <h1 className="text-4xl font-bold text-primary tracking-tight">Lingbo</h1>
        </div>
        <Link to="/profile" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"><Settings size={20} className="text-gray-500" /></Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* Word of Day */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex gap-4 items-center">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">Word of the Day</div>
              <div className="font-bold text-gray-800 text-lg">{dailyWord.igbo}</div>
              <div className="text-sm text-gray-500">{dailyWord.english}</div>
            </div>
          </div>
          <button
            onClick={async () => { const b64 = await generateIgboSpeech(dailyWord.igbo); if (b64) playPCMAudio(b64); }}
            className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 text-primary transition-colors"
          >
            <Volume2 size={24} />
          </button>
        </div>

        {/* Fun Fact Bubble */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-full px-5 py-2 shadow-sm border-2 border-purple-100 hover:shadow-md transition-all max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="shrink-0 bg-purple-100 p-1.5 rounded-full">
              <Lightbulb size={14} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-purple-900 leading-snug"><span className="font-bold text-purple-600">Did you know?</span> {funFact}</p>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <button onClick={() => setShowProfileSelector('adult')} className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all text-left overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform origin-top-right duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-orange-200 shadow-lg group-hover:scale-110 transition-transform">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Adult Learning</h2>
              <p className="text-gray-500">Curriculum-based lessons, detailed grammar, and cultural insights.</p>
              <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                <Users size={16} /> Select Profile <ChevronRight size={16} />
              </div>
            </div>
          </button>

          <button onClick={() => setShowProfileSelector('kid')} className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-yellow-200 transition-all text-left overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform origin-top-right duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-yellow-400 text-yellow-900 rounded-2xl flex items-center justify-center mb-6 shadow-yellow-200 shadow-lg group-hover:scale-110 transition-transform">
                <Smile size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Kids Corner</h2>
              <p className="text-gray-500">Fun games, stories, and interactive activities designed for children.</p>
              <div className="mt-6 flex items-center gap-2 text-yellow-600 font-bold text-sm group-hover:gap-3 transition-all">
                <Users size={16} /> Select Profile <ChevronRight size={16} />
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

const TextChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Nnọ! I am Chike. We can practice conversation. Gwa m okwu (Talk to me)!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setLoading(true);

    try {
      const responseText = await generateTutorResponse(userText);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: 'Network error.', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = async (text: string, id: string) => {
    if (playingId === id) return;
    setPlayingId(id);
    try {
      console.log('Requesting TTS for:', text);
      const b64 = await generateIgboSpeech(text);
      if (b64) {
        console.log('Playing TTS audio...');
        await playPCMAudio(b64);
        console.log('TTS playback complete');
      } else {
        console.warn('No audio data received from TTS');
      }
    } catch (error) {
      console.error('TTS playback error:', error);
    } finally {
      setPlayingId(null);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
              {m.text}
              {m.role === 'model' && !m.isError && (
                <button
                  onClick={() => handlePlayAudio(m.text, m.id)}
                  disabled={playingId === m.id}
                  className={`ml-2 inline-block p-1 bg-white/50 rounded-full hover:bg-white transition-all ${playingId === m.id ? 'animate-pulse text-primary' : ''}`}
                >
                  {playingId === m.id ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      <div className="p-3 border-t bg-gray-50 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type in Igbo or English..."
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
        />
        <button onClick={handleSend} disabled={loading} className="p-2 bg-primary text-white rounded-full disabled:opacity-50 hover:bg-orange-600 transition-colors"><Send size={20} /></button>
      </div>
    </div>
  );
};

// ... (Rest of App.tsx stays the same, I will just output the surrounding components to ensure validity if needed, but XML block limits context. I'll provide the full App.tsx if needed, but let's stick to the TextChat replacement and necessary context)

const AdultDashboard = () => {
  const navigate = useNavigate();
  const { activeProfile } = useUser();
  const [funFact, setFunFact] = useState(FUN_FACTS[0]);

  useEffect(() => {
    setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  }, []);

  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  const handleSpeakWord = useCallback(async (word: string) => {
    if (speakingWord === word) return;
    setSpeakingWord(word);
    try {
      const audio = await generateIgboSpeech(word);
      if (audio) {
        await playPCMAudio(audio);
      } else {
        console.warn('No audio data returned for', word);
      }
    } catch (err) {
      console.error('Adult lesson TTS failed', err);
    } finally {
      setSpeakingWord(null);
    }
  }, [speakingWord]);

  return (
    <Layout title="Curriculum" showBack backPath="/hub">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Nnọ, {activeProfile?.name || 'Friend'}!</h2>
            <p className="text-gray-600 text-sm">Ready to continue your learning?</p>
          </div>
          <div className="text-4xl">{activeProfile?.avatar}</div>
        </div>

        {/* Fun Fact */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
          <Lightbulb size={24} className="text-blue-500 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-blue-700 text-sm mb-1">Did You Know?</h4>
            <p className="text-blue-900 text-sm leading-relaxed">{funFact}</p>
          </div>
        </div>

        {/* Reference Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-primary" /> Reference Materials</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/alphabet')} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">Ab</div>
              <div className="text-left"><div className="font-bold text-gray-800">Alphabet</div><div className="text-xs text-gray-500">Abidii</div></div>
            </button>
            <button onClick={() => navigate('/numbers')} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">123</div>
              <div className="text-left"><div className="font-bold text-gray-800">Numbers</div><div className="text-xs text-gray-500">Onuogugu</div></div>
            </button>
          </div>
        </div>

        {/* Curriculum List */}
        <div className="grid grid-cols-1 gap-4">
          <h3 className="font-bold text-gray-800">Lessons</h3>
          {ADULT_CURRICULUM.map((level) => (
            <div
              key={level.level_id}
              onClick={() => level.status !== 'locked' && navigate(`/adults/level/${level.level_id}`)}
              className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${level.status === 'locked' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-primary/30 hover:shadow-md cursor-pointer'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${level.status === 'completed' ? 'bg-green-100 text-green-600' : level.status === 'in_progress' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                  {level.status === 'completed' ? <CheckCircle size={24} /> : level.level_id}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Level {level.level_id}</div>
                  <div className="font-bold text-gray-800 text-xl">{level.title}</div>
                  {level.description && <div className="text-sm text-gray-500 mt-1">{level.description}</div>}
                </div>
              </div>
              {level.status === 'locked' ? <Lock size={24} className="text-gray-300" /> : <ChevronRight size={24} className="text-primary" />}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

// 5. Kids Dashboard
type KidsSectionId = 'activities' | 'videos' | 'stories' | 'worksheets';

const kidsSections: { id: KidsSectionId; title: string; blurb: string; icon: React.ComponentType<{ size?: number }>; accent: string }[] = [
  { id: 'activities', title: 'Play', blurb: 'Fun games!', icon: Gamepad2, accent: 'bg-orange-100 text-orange-600' },
  { id: 'videos', title: 'Watch', blurb: 'Cool videos!', icon: PlayCircle, accent: 'bg-blue-100 text-blue-600' },
  { id: 'stories', title: 'Read', blurb: 'Story books!', icon: BookOpen, accent: 'bg-green-100 text-green-600' },
  { id: 'worksheets', title: 'Draw', blurb: 'Color & Trace!', icon: FileText, accent: 'bg-purple-100 text-purple-600' }
];

const KidsDashboard = () => {
  const navigate = useNavigate();
  const { activeProfile } = useUser();
  const [activeSection, setActiveSection] = useState<KidsSectionId | null>(null);

  const activities = [
    { title: 'Words', icon: ImageIcon, path: '/kids/game/words', color: 'bg-orange-100 text-orange-600' },
    { title: 'Build', icon: Puzzle, path: '/kids/game/sentence', color: 'bg-pink-100 text-pink-600' },
    { title: 'Match', icon: Zap, path: '/kids/game/memory', color: 'bg-purple-100 text-purple-600' },
    { title: 'Tap', icon: Timer, path: '/kids/game/speed', color: 'bg-yellow-100 text-yellow-600' },
    { title: 'ABC', icon: Type, path: '/alphabet', color: 'bg-blue-100 text-blue-600' },
    { title: '123', icon: Hash, path: '/numbers', color: 'bg-green-100 text-green-600' },
    { title: 'Talk', icon: Mic, path: '/practice', color: 'bg-red-100 text-red-600' }
  ];

  const renderSectionContent = () => {
    if (activeSection === 'activities') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
          {activities.map(activity => (
            <button
              key={activity.title}
              onClick={() => navigate(activity.path)}
              className="bg-white border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${activity.color} group-hover:scale-110 group-hover:animate-bounce transition-transform`}>
                <activity.icon size={32} />
              </div>
              <span className="font-kids font-bold text-lg text-gray-700 text-center">{activity.title}</span>
            </button>
          ))}
        </div>
      );
    }

    if (activeSection === 'videos') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-50 rounded-3xl p-8 text-center border-2 border-dashed border-blue-200">
            <PlayCircle size={64} className="mx-auto text-blue-400 mb-4" />
            <h3 className="font-kids text-2xl text-blue-800 mb-2">Watch & Learn</h3>
            <p className="text-blue-600 mb-6">Sing along with Igbo songs and stories!</p>
            <button onClick={() => navigate('/videos')} className="px-8 py-4 bg-blue-500 text-white rounded-full font-bold shadow-lg hover:bg-blue-600 hover:scale-105 transition-all">
              Open Video Library
            </button>
          </div>
        </div>
      );
    }

    if (activeSection === 'stories') {
      const featuredBooks = LIBRARY_BOOKS.slice(0, 3);
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featuredBooks.map((book, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:scale-105 transition-transform">
                <img src={book.cover} className="w-full aspect-[4/5] object-cover rounded-xl mb-3" />
                <p className="font-kids font-bold text-gray-800 text-center text-sm">{book.title}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/library')} className="px-8 py-4 bg-green-500 text-white rounded-full font-bold shadow-lg hover:bg-green-600 hover:scale-105 transition-all">
              Go to Library
            </button>
          </div>
        </div>
      );
    }

    if (activeSection === 'worksheets') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={() => navigate('/kids/worksheet/alphabet')}
            className="w-full bg-white border-b-4 border-purple-200 active:border-b-0 active:translate-y-1 rounded-3xl p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Eraser size={40} />
            </div>
            <div className="text-left">
              <h3 className="font-kids text-2xl text-gray-800 mb-1">Alphabet Tracing</h3>
              <p className="text-gray-500">Practice writing your ABCs</p>
            </div>
            <ChevronRight className="ml-auto text-purple-300" size={32} />
          </button>

          <button
            onClick={() => navigate('/library')}
            className="w-full bg-white border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 rounded-3xl p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform">
              <FileText size={40} />
            </div>
            <div className="text-left">
              <h3 className="font-kids text-2xl text-gray-800 mb-1">Printable Worksheets</h3>
              <p className="text-gray-500">Download and print fun activities</p>
            </div>
            <ChevronRight className="ml-auto text-gray-300" size={32} />
          </button>
        </div>
      );
    }
  };

  return (
    <Layout
      title={activeSection ? kidsSections.find(s => s.id === activeSection)?.title : "Kids Corner"}
      showBack={!!activeSection}
      onBack={() => activeSection ? setActiveSection(null) : navigate('/hub')}
      isKidsMode
      hideBottomNav
    >
      {!activeSection ? (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-3xl border-2 border-yellow-200 shadow-sm">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-md animate-bounce-slow">
              {activeProfile?.avatar || '🐻'}
            </div>
            <div>
              <h2 className="font-kids font-bold text-2xl text-yellow-900">Hi, {activeProfile?.name}!</h2>
              <p className="text-yellow-700 font-medium">What do you want to do today?</p>
            </div>
          </div>

          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kidsSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="group relative bg-white rounded-[2rem] p-6 shadow-sm border-2 border-gray-100 hover:border-transparent hover:shadow-xl transition-all overflow-hidden text-left h-48 flex flex-col justify-between"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20 transition-transform group-hover:scale-150 duration-500 ${section.accent.split(' ')[0]}`}></div>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4 ${section.accent} group-hover:scale-110 group-hover:animate-bounce transition-transform duration-300`}>
                  <section.icon size={28} />
                </div>

                <div className="relative z-10">
                  <h3 className="font-kids text-2xl font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">{section.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">{section.blurb}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        renderSectionContent()
      )}
    </Layout>
  );
};

const AlphabetTracingWorksheet = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  return (
    <Layout
      title={selectedLetter ? `Tracing: ${selectedLetter}` : "Alphabet Tracing"}
      showBack
      onBack={() => selectedLetter ? setSelectedLetter(null) : navigate(-1)}
      isKidsMode
      hideBottomNav
    >
      <div className="space-y-6">
        {!selectedLetter ? (
          <>
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm text-center">
              <h3 className="font-kids text-2xl text-purple-700 mb-2">Pick a letter!</h3>
              <p className="text-gray-500">Tap any letter to start practicing.</p>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {IGBO_ALPHABET_FULL.map(letter => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className="aspect-square bg-white border-b-4 border-purple-200 active:border-b-0 active:translate-y-1 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                >
                  <span className="text-2xl font-kids font-bold text-purple-600">{letter}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <TracingCanvas letter={selectedLetter} />
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-4">Trace the letter {selectedLetter} carefully!</p>
              <button
                onClick={() => {
                  generateIgboSpeech(selectedLetter).then(b64 => b64 && playPCMAudio(b64));
                }}
                className="px-6 py-3 bg-white border border-purple-200 rounded-full text-purple-600 font-bold shadow-sm hover:bg-purple-50 flex items-center gap-2 mx-auto"
              >
                <Volume2 size={20} /> Hear Sound
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const MemoryGameWrapper = () => <MemoryGame onBack={() => window.history.back()} />;
const SpeedGameWrapper = () => <SpeedTapGame onBack={() => window.history.back()} />;

const SentenceGameWrapper = () => {
  const [gameWon, setGameWon] = useState(false);
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const sentenceGame = KIDS_GAMES[0];
  const [availableBlocks, setAvailableBlocks] = useState<string[]>(sentenceGame.example_round.scrambled_blocks);

  const handleBlockClick = (word: string) => {
    playGameSound('click');
    const newSentence = [...builtSentence, word];
    setBuiltSentence(newSentence);
    setAvailableBlocks(availableBlocks.filter(b => b !== word));

    if (newSentence.length === sentenceGame.example_round.correct_order.length) {
      if (newSentence.every((val, i) => val === sentenceGame.example_round.correct_order[i])) {
        playGameSound('win');
        setGameWon(true);
        generateIgboSpeech("O mara nma!").then(b64 => b64 && playPCMAudio(b64));
      } else {
        playGameSound('error');
        setIsError(true);
        setTimeout(() => setIsError(false), 500);
      }
    }
  };

  const reset = () => { setBuiltSentence([]); setAvailableBlocks(sentenceGame.example_round.scrambled_blocks); setGameWon(false); setIsError(false); };

  return (
    <Layout title="Sentence Puzzle" showBack isKidsMode hideBottomNav>
      <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-pink-100 relative overflow-hidden min-h-[450px] flex flex-col max-w-2xl mx-auto">
        {gameWon && <ConfettiOverlay onRestart={reset} />}
        <div className="text-center mb-6 mt-6">
          <h3 className="font-kids font-bold text-2xl text-pink-500 mb-1">Sentence Builder</h3>
          <p className="text-gray-500 text-sm">Make: <span className="text-gray-800 font-bold bg-gray-100 px-1 rounded">"{sentenceGame.example_round.target_sentence}"</span></p>
        </div>

        {/* Puzzle Area */}
        <div className={`bg-gray-50 rounded-2xl p-6 min-h-[140px] flex gap-3 flex-wrap items-center justify-center mb-8 border-2 border-dashed border-gray-300 transition-colors ${isError ? 'bg-red-50 border-red-200 animate-shake' : ''}`}>
          {/* Empty Slots or Filled Blocks */}
          {Array.from({ length: sentenceGame.example_round.correct_order.length }).map((_, i) => {
            const word = builtSentence[i];
            return (
              <div key={i} className={`w-32 h-16 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${word ? 'bg-white shadow-md text-gray-700 border border-gray-100 scale-100' : 'bg-gray-200/50 border-2 border-dashed border-gray-300 scale-95'}`}>
                {word ? (
                  <span className="animate-in zoom-in spring-bounce">{word}</span>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-300/50"></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center flex-wrap mt-auto">
          {availableBlocks.map((word, i) => (
            <button
              key={i}
              onClick={() => handleBlockClick(word)}
              className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold px-6 py-4 rounded-2xl shadow-md border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all text-lg animate-in fade-in slide-in-from-bottom-2 hover:scale-105"
            >
              {word}
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-center"><button onClick={reset} className="text-gray-400 flex items-center gap-2 text-sm font-bold hover:text-pink-500"><RefreshCcw size={16} /> Start Over</button></div>
      </div>
    </Layout>
  );
};

const FlashcardWrapper = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const card = KIDS_FLASHCARDS[currentCard];
  const next = () => setCurrentCard((p) => (p + 1) % KIDS_FLASHCARDS.length);
  const prev = () => setCurrentCard((p) => (p - 1 + KIDS_FLASHCARDS.length) % KIDS_FLASHCARDS.length);
  return (
    <Layout title="Flashcards" showBack isKidsMode hideBottomNav>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-sm aspect-[4/5] bg-white rounded-3xl shadow-xl border-4 border-yellow-300 p-6 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex justify-between items-center text-gray-400 text-sm font-bold">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg border border-blue-200">{card.english}</span>
            <button onClick={async () => { const b64 = await generateIgboSpeech(card.igbo); if (b64) playPCMAudio(b64); }} className="p-3 hover:bg-blue-50 rounded-full border border-gray-100 shadow-sm transition-colors"><Volume2 size={24} className="text-blue-500" /></button>
          </div>
          <div className="relative flex-1 flex items-center justify-center w-full">
            <img src={card.image} alt={card.english} className="w-48 h-48 object-contain drop-shadow-lg relative z-10" />
          </div>
          <div className="text-center w-full">
            <h2 className="text-5xl font-kids font-bold text-blue-600 mb-2">{card.igbo}</h2>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-8">
          <button onClick={prev} className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 border border-gray-100 active:scale-95 transition-transform"><ChevronRight size={36} className="rotate-180" /></button>
          <button onClick={next} className="w-16 h-16 bg-blue-500 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center text-white hover:bg-blue-600 active:scale-95 transition-transform"><ChevronRight size={36} /></button>
        </div>
      </div>
    </Layout>
  )
};

// 6. Live Chat (Real Implementation)
const LiveChat = () => {
  const [connected, setConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    return () => disconnect();
  }, []);

  const connect = async () => {
    if (!process.env.API_KEY) { alert("API Key missing"); return; }
    if (isConnectingRef.current || connected) return;

    isConnectingRef.current = true;

    try {
      // Clean up any existing session first
      await disconnect();

      const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create separate audio context for mic input (don't play it back)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      // Resume context if suspended
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const session = await client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: { parts: [{ text: "You are Chike, a friendly and educational Igbo language tutor. You speak English with a Nigerian accent. You teach users basic Igbo phrases. Keep your responses concise and helpful for learners. Always encourage them." }] }
        },
        callbacks: {
          onopen: () => {
            console.log('Live session connected');
            setConnected(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              console.log('Received audio from Gemini');
              await playPCMAudio(base64Audio);
            }
          },
          onclose: () => {
            console.log('Live session closed');
            setConnected(false);
          },
          onerror: (error) => {
            console.error('Live session error:', error);
            setConnected(false);
          }
        }
      });

      sessionRef.current = session;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        setVolume(Math.sqrt(sum / inputData.length) * 100);

        // Convert to PCM and send to Gemini
        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
        }
        const bytes = new Uint8Array(int16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }

        if (session) {
          try {
            session.sendRealtimeInput({
              media: {
                mimeType: 'audio/pcm;rate=16000',
                data: btoa(binary)
              }
            });
          } catch (e) {
            // Ignore send errors
          }
        }
      };

      // CRITICAL: Don't connect processor to destination - this causes feedback!
      // Only connect source to processor for processing, don't play it back
      source.connect(processor);
      // Remove: processor.connect(audioCtx.destination);
    } catch (e) {
      console.error('Connection error:', e);
      alert("Could not connect. Check mic permission.");
      await disconnect();
    } finally {
      isConnectingRef.current = false;
    }
  };

  const disconnect = async () => {
    console.log('Disconnecting live session...');
    setConnected(false);

    // Close live session
    if (sessionRef.current) {
      try {
        await sessionRef.current.close();
      } catch (e) {
        console.warn('Error closing session:', e);
      }
      sessionRef.current = null;
    }

    // Disconnect audio processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch (e) {
        console.warn('Error closing audio context:', e);
      }
      audioContextRef.current = null;
    }

    setVolume(0);
  };

  return (
    <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 relative overflow-hidden transition-all duration-500">
      {connected && <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><div className="w-64 h-64 bg-primary rounded-full animate-pulse" style={{ transform: `scale(${1 + volume / 10})` }}></div></div>}
      <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${connected ? 'bg-red-500 shadow-red-200 animate-pulse' : 'bg-gray-200'}`}>
        <Mic size={40} className="text-white" />
        {connected && <div className="absolute inset-0 rounded-full border-4 border-white opacity-50 animate-ping"></div>}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{connected ? 'Live with Chike' : 'Start Live Session'}</h3>
      <p className="text-gray-500 mb-8 max-w-xs">{connected ? 'Speak naturally. Chike is listening.' : 'Practice conversation with a real-time AI tutor.'}</p>
      {!connected ? <button onClick={connect} className="bg-primary text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-orange-600 hover:scale-105 transition-all">Connect</button> : <button onClick={disconnect} className="bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-full hover:bg-gray-300 transition-all">End Call</button>}
    </div>
  );
};

const PronunciationCoach = () => {
  const [target, setTarget] = useState('Kedu ka i mere?');
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<AnalysisResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr; chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const b64 = await blobToBase64(blob);
        const transcript = await transcribeUserAudio(b64, 'audio/webm');
        setFeedback(await analyzePronunciation(target, transcript));
      };
      mr.start(); setIsRecording(true); setFeedback(null);
    } catch (e) { alert("Microphone access denied"); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop()); };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Pronunciation Coach</h3>
      <div className="mb-8">
        <p className="text-gray-500 text-sm uppercase mb-2">Say this phrase:</p>
        <h2 className="text-2xl font-bold text-primary mb-2">{target}</h2>
        <button onClick={async () => { const b64 = await generateIgboSpeech(target); if (b64) playPCMAudio(b64); }} className="text-sm text-gray-400 flex items-center justify-center gap-1 hover:text-primary"><Volume2 size={16} /> Listen</button>
      </div>
      <div className="flex justify-center mb-6"><button onClick={isRecording ? stopRecording : startRecording} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 shadow-red-200 animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>{isRecording ? <StopCircle size={40} className="text-white" /> : <Mic size={40} />}</button></div>
      {feedback && (<div className="bg-gray-50 p-4 rounded-xl text-left animate-in fade-in"><div className="flex items-center justify-between mb-2"><span className="font-bold text-gray-700">Score</span><span className={`font-bold ${feedback.score > 80 ? 'text-green-600' : 'text-orange-600'}`}>{feedback.score}%</span></div><p className="text-sm text-gray-600 mb-1"><strong>You said:</strong> {feedback.user_said_igbo} ({feedback.user_said_english})</p><p className="text-sm text-gray-600"><strong>Feedback:</strong> {feedback.feedback}</p></div>)}
    </div>
  )
};

const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [matchBubble, setMatchBubble] = useState<{ x: number, y: number, text: string } | null>(null);

  useEffect(() => { setCards([...MEMORY_GAME_DATA].sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, uid: i }))); }, []);

  const handleCardClick = (index: number, e: React.MouseEvent) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].matchId)) return;
    playGameSound('flip');
    const newFlipped = [...flipped, index]; setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const id1 = cards[newFlipped[0]].matchId; const id2 = cards[newFlipped[1]].matchId;
      if (id1 === id2) {
        setTimeout(() => {
          playGameSound('success');
          setMatched(p => [...p, id1]);
          setFlipped([]);

          // Show match bubble
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          setMatchBubble({ x: rect.left + rect.width / 2, y: rect.top, text: "Match!" });
          setTimeout(() => setMatchBubble(null), 1000);

          if (matched.length + 1 === MEMORY_GAME_DATA.length / 2) { playGameSound('win'); setWon(true); }
        }, 300);
      }
      else { setTimeout(() => setFlipped([]), 1000); }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl border-4 border-purple-100 min-h-[500px] flex flex-col relative overflow-hidden">
      {won && <ConfettiOverlay onRestart={() => window.location.reload()} />}
      {matchBubble && createPortal(
        <div
          className="fixed z-50 pointer-events-none animate-in zoom-in fade-out slide-out-to-top-10 duration-1000 font-kids font-bold text-3xl text-green-500 drop-shadow-lg stroke-white"
          style={{ left: matchBubble.x, top: matchBubble.y, transform: 'translate(-50%, -100%)' }}
        >
          {matchBubble.text}
        </div>,
        document.body
      )}

      <div className="flex justify-between items-center mb-6"><button onClick={onBack}><ArrowLeft size={24} className="text-gray-600" /></button><h3 className="font-kids font-bold text-2xl text-purple-600">Memory Match</h3><div className="w-6"></div></div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 flex-1 content-start perspective-1000">
        {cards.map((card, i) => (
          <button
            key={card.uid}
            onClick={(e) => handleCardClick(i, e)}
            className="aspect-square relative group cursor-pointer perspective-1000"
          >
            <div
              className="w-full h-full transition-all duration-500 transform-style-3d"
              style={{
                transform: (flipped.includes(i) || matched.includes(card.matchId)) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Front (Question Mark) */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-sm backface-hidden"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <span className="text-white font-kids font-bold text-4xl opacity-50">?</span>
              </div>

              {/* Back (Content) */}
              <div
                className="absolute inset-0 bg-white rounded-xl border-4 border-purple-200 flex items-center justify-center overflow-hidden shadow-sm backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {card.type === 'image' ? <img src={card.content} className="w-full h-full object-cover" /> : <span className="font-kids font-bold text-gray-800 text-sm text-center px-1">{card.content}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const SpeedTapGame = ({ onBack }: { onBack: () => void }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(p => p - 0.1), 100);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && isPlaying) {
      setIsPlaying(false);
      setGameOver(true);
      playGameSound('win');
    }
  }, [isPlaying, timeLeft]);

  const generateQuestion = () => {
    const card = KIDS_FLASHCARDS[Math.floor(Math.random() * KIDS_FLASHCARDS.length)];
    let options = [card];
    while (options.length < 3) {
      const r = KIDS_FLASHCARDS[Math.floor(Math.random() * KIDS_FLASHCARDS.length)];
      if (!options.find(o => o.igbo === r.igbo)) options.push(r);
    }
    setCurrentQuestion({ target: card, options: options.sort(() => Math.random() - 0.5) });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setGameOver(false);
    setCombo(0);
    setMaxCombo(0);
    generateQuestion();
  };

  const handleAnswer = (option: any) => {
    if (option.igbo === currentQuestion.target.igbo) {
      playGameSound('success');
      const comboMultiplier = Math.min(5, Math.floor(combo / 5) + 1);
      setScore(s => s + (10 * comboMultiplier));
      setCombo(c => {
        const newCombo = c + 1;
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        return newCombo;
      });
      setFeedback('correct');
      setTimeout(() => { setFeedback(null); generateQuestion(); }, 200);
    } else {
      playGameSound('error');
      setTimeLeft(t => Math.max(0, t - 2));
      setCombo(0);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 200);
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-xl border-4 min-h-[500px] flex flex-col relative overflow-hidden text-center transition-colors duration-200 ${feedback === 'correct' ? 'border-green-400 bg-green-50' : feedback === 'wrong' ? 'border-red-400 bg-red-50 animate-shake' : 'border-blue-100'}`}>
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack}><ArrowLeft size={24} className="text-gray-600" /></button>
        <div className="flex gap-4 items-center">
          <div className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full font-bold flex items-center gap-2">
            <Trophy size={16} /> {score}
          </div>
          {combo > 1 && (
            <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold text-sm animate-in zoom-in spring-bounce">
              {combo}x Combo!
            </div>
          )}
        </div>
        <div className="w-6"></div>
      </div>

      {/* Timer Bar */}
      {isPlaying && (
        <div className="w-full h-4 bg-gray-200 rounded-full mb-6 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-100 ease-linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      )}

      {!isPlaying && !gameOver && (
        <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in">
          <h3 className="font-kids text-3xl font-bold text-blue-600 mb-4">Speed Tap!</h3>
          <p className="text-gray-500 mb-8">Tap the correct picture before time runs out.</p>
          <button onClick={startGame} className="bg-blue-500 text-white font-bold text-xl px-12 py-4 rounded-full shadow-lg hover:bg-blue-600 hover:scale-105 transition-all">Start Game</button>
        </div>
      )}

      {isPlaying && currentQuestion && (
        <div className="flex-1 flex flex-col animate-in fade-in">
          <div className="flex-1 flex items-center justify-center mb-6">
            <h2 className="font-kids text-5xl font-bold text-gray-800 drop-shadow-sm">{currentQuestion.target.igbo}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {currentQuestion.options.map((opt: any, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="aspect-square bg-white rounded-2xl border-4 border-gray-100 p-2 hover:border-blue-400 active:scale-95 transition-all shadow-sm hover:shadow-md"
              >
                <img src={opt.image} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center animate-in zoom-in backdrop-blur-sm">
          <Trophy size={80} className="text-yellow-400 mb-4" />
          <h3 className="font-kids text-4xl font-bold text-gray-800 mb-2">Game Over!</h3>
          <p className="text-xl text-gray-500 mb-2">Final Score: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-sm text-gray-400 mb-8">Max Combo: {maxCombo}</p>
          <button onClick={startGame} className="bg-blue-500 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-blue-600">Play Again</button>
        </div>
      )}
    </div>
  );
};

const AlphabetBoard = () => {
  const playLetter = async (letter: string) => { playGameSound('click'); const b64 = await generateIgboSpeech(letter); if (b64) await playPCMAudio(b64); };
  return (
    <Layout title="Igbo Alphabet" showBack>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {IGBO_ALPHABET_FULL.map((l) => <button key={l} onClick={() => playLetter(l)} className="aspect-square bg-white rounded-xl shadow-sm border border-gray-100 font-bold text-gray-800 hover:border-teal-400 hover:shadow-md transition-all text-xl">{l}</button>)}
      </div>
    </Layout>
  );
};

const NumbersBoard = () => {
  const playNumber = async (text: string) => { playGameSound('click'); const b64 = await generateIgboSpeech(text); if (b64) await playPCMAudio(b64); };
  return (
    <Layout title="Igbo Numbers" showBack>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {IGBO_NUMBERS.map((n) => (
          <button key={n.number} onClick={() => playNumber(n.word)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-orange-400 hover:shadow-md transition-all"><div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl">{n.number}</div><div className="flex-1 text-left"><div className="font-bold text-gray-800 text-lg">{n.word}</div></div><Volume2 size={20} className="text-gray-300" /></button>
        ))}
      </div>
    </Layout>
  );
};

const Library = () => {
  const navigate = useNavigate();
  return (
    <Layout title="Library" showBack>
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><BookOpen size={20} className="text-primary" /> Books</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{LIBRARY_BOOKS.map((b, i) => <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"><div className="aspect-[3/4] bg-gray-200 rounded mb-2 overflow-hidden"><img src={b.cover} className="w-full h-full object-cover" /></div><h3 className="font-bold text-sm text-gray-800">{b.title}</h3></div>)}</div>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><FileText size={20} className="text-orange-500" /> Worksheets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{WORKSHEETS.map((w) => <button onClick={() => navigate(`/library/worksheet/${w.id}`)} key={w.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-left hover:border-primary transition-colors"><div className="aspect-[3/4] bg-gray-100 rounded mb-2 overflow-hidden relative"><img src={w.cover} className="w-full h-full object-cover" /><div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-2 py-1 rounded-tl">{w.pages} Pages</div></div><h3 className="font-bold text-sm text-gray-800">{w.title}</h3></button>)}</div>
        </div>
      </div>
    </Layout>
  );
};

const WorksheetViewer = () => {
  const { id } = useParams();
  const worksheet = WORKSHEETS.find(w => w.id === id);
  const navigate = useNavigate();

  if (!worksheet) return <Navigate to="/library" />;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      <div className="flex justify-between items-center p-4 text-white bg-black/50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-gray-300">
          <ArrowLeft size={20} /> Back
        </button>
        <span className="font-bold text-lg">{worksheet.title}</span>
        <div className="w-16"></div>
      </div>
      <div className="flex-1 bg-gray-800 overflow-hidden">
        {(worksheet as any).pdfPath ? (
          <WorksheetFlipbook fileUrl={(worksheet as any).pdfPath} title={worksheet.title} />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <p>PDF not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoLibrary = () => {
  const [playingVideo, setPlayingVideo] = useState<VideoResource | null>(null);

  return (
    <Layout title="Videos" showBack>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VIDEO_RESOURCES.map((v) => (
          <button onClick={() => setPlayingVideo(v)} key={v.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-4 text-left hover:shadow-md transition-all group">
            <div className="w-32 aspect-video bg-gray-200 rounded-lg relative overflow-hidden">
              <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30"><PlayCircle className="text-white drop-shadow-md" /></div>
            </div>
            <div><h4 className="font-bold text-sm text-gray-800 mb-1">{v.title}</h4><span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{v.duration}</span></div>
          </button>
        ))}
      </div>
      {playingVideo && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4" onClick={() => setPlayingVideo(null)}>
          <div className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1`} title={playingVideo.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            <button onClick={() => setPlayingVideo(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors"><X size={24} /></button>
          </div>
          <h3 className="text-white font-bold text-xl mt-4">{playingVideo.title}</h3>
        </div>,
        document.body
      )}
    </Layout>
  );
};

// Quiz Question Component (to avoid hooks in map)
const QuizQuestion: React.FC<{ question: QuizItem, questionNumber: number, onScore: () => void }> = ({ question, questionNumber, onScore }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswer = (opt: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(opt);
    const correct = opt === question.correct_answer;
    if (correct) {
      playGameSound('success');
      onScore();
    } else {
      playGameSound('error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h4 className="font-bold text-gray-800 mb-4">Q{questionNumber}: {question.question || question.instruction}</h4>
      {question.quiz_type === 'multiple_choice_3_options' && (
        <div className="space-y-2">
          {question.options?.map((opt: string) => {
            const isSelected = selectedAnswer === opt;
            const isThisCorrect = opt === question.correct_answer;
            let buttonClass = "w-full p-3 text-left border-2 rounded-lg font-medium transition-all ";

            if (selectedAnswer) {
              if (isThisCorrect) {
                buttonClass += "bg-green-50 border-green-500 text-green-700";
              } else if (isSelected && !isThisCorrect) {
                buttonClass += "bg-red-50 border-red-500 text-red-700";
              } else {
                buttonClass += "border-gray-200 text-gray-400";
              }
            } else {
              buttonClass += "hover:bg-gray-50 hover:border-primary text-gray-700 border-gray-200";
            }

            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={!!selectedAnswer}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {selectedAnswer && isThisCorrect && <CheckCircle className="text-green-500" size={20} />}
                  {selectedAnswer && isSelected && !isThisCorrect && <X className="text-red-500" size={20} />}
                </div>
              </button>
            );
          })}
        </div>
      )}
      {question.quiz_type === 'match_picture_to_word' && (
        <div className="grid grid-cols-3 gap-2">
          {question.options?.map((opt: string) => {
            const isSelected = selectedAnswer === opt;
            const isThisCorrect = opt === question.correct_answer;
            let borderClass = "aspect-square border-4 rounded-lg overflow-hidden transition-all relative ";

            if (selectedAnswer) {
              if (isThisCorrect) {
                borderClass += "border-green-500";
              } else if (isSelected && !isThisCorrect) {
                borderClass += "border-red-500";
              } else {
                borderClass += "border-gray-200 opacity-50";
              }
            } else {
              borderClass += "hover:border-primary border-gray-200";
            }

            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={!!selectedAnswer}
                className={borderClass}
              >
                <img src={opt} className="w-full h-full object-cover" />
                {selectedAnswer && isThisCorrect && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="text-green-600 bg-white rounded-full" size={32} />
                  </div>
                )}
                {selectedAnswer && isSelected && !isThisCorrect && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <X className="text-red-600 bg-white rounded-full" size={32} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const LessonView = () => {
  const { id } = useParams();
  const level = ADULT_CURRICULUM.find(l => l.level_id === Number(id));
  const [activeTab, setActiveTab] = useState<'vocab' | 'quiz'>('vocab');
  const [quizScore, setQuizScore] = useState(0);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  const handleSpeakWord = useCallback(async (word: string) => {
    if (speakingWord === word) return;
    setSpeakingWord(word);
    try {
      const audio = await generateIgboSpeech(word);
      if (audio) {
        await playPCMAudio(audio);
      }
    } catch (err) {
      console.error('TTS failed', err);
    } finally {
      setSpeakingWord(null);
    }
  }, [speakingWord]);

  if (!level) return <Navigate to="/adults" />;

  const vocabLesson = level.lessons?.find(l => l.type === 'vocabulary');
  const quizLesson = level.lessons?.find(l => l.type === 'quiz_section');

  return (
    <Layout title={level.title} showBack backPath="/adults">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <p className="text-gray-500 mb-4">{level.description}</p>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('vocab')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'vocab' ? 'bg-white text-primary shadow' : 'text-gray-500'}`}>Vocabulary</button>
          <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'quiz' ? 'bg-white text-primary shadow' : 'text-gray-500'}`}>Quiz</button>
        </div>
      </div>

      {activeTab === 'vocab' && vocabLesson && (
        <div className="space-y-4">
          {vocabLesson.data?.map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <img src={item.image} className="w-16 h-16 rounded-lg object-cover bg-gray-200" alt={item.english} />
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-800">{item.igbo}</h4>
                <p className="text-gray-500 text-sm">{item.english}</p>
              </div>
              <button
                onClick={() => handleSpeakWord(item.igbo)}
                disabled={speakingWord === item.igbo}
                className={`p-3 rounded-full border border-primary/30 transition-colors ${speakingWord === item.igbo ? 'bg-primary text-white animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
              >
                {speakingWord === item.igbo ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'quiz' && quizLesson && (
        <div className="space-y-6">
          <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100"><Trophy className="inline mb-1 text-orange-500" size={20} /> <span className="font-bold text-orange-700">Quiz Score: {quizScore}</span></div>
          {quizLesson.activities?.map((q, i) => (
            <QuizQuestion
              key={i}
              question={q}
              questionNumber={i + 1}
              onScore={() => setQuizScore(s => s + 10)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};

const SpeakPractice = () => {
  const [tab, setTab] = useState('chat');
  return (
    <Layout title="AI Tutor" showBack>
      <div className="flex bg-gray-200 p-1 rounded-xl mb-4">
        <button onClick={() => setTab('chat')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${tab === 'chat' ? 'bg-white shadow text-primary' : ''}`}>Chat</button>
        <button onClick={() => setTab('live')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${tab === 'live' ? 'bg-white shadow text-primary' : ''}`}>Live</button>
        <button onClick={() => setTab('coach')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${tab === 'coach' ? 'bg-white shadow text-primary' : ''}`}>Coach</button>
      </div>
      {tab === 'chat' && <TextChat />}
      {tab === 'live' && <LiveChat />}
      {tab === 'coach' && <PronunciationCoach />}
    </Layout>
  );
};

const ProfilePage = () => {
  const { activeProfile, logout } = useUser();
  if (!activeProfile) return <Navigate to="/" />;

  const progressToNextLevel = ((activeProfile.xp % 100) / 100) * 100;

  return (
    <Layout title="Profile" showBack backPath="/hub">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="text-center bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-2xl shadow-sm border-2 border-orange-100">
          <div className="text-6xl mb-4 bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg">{activeProfile.avatar}</div>
          <h2 className="text-2xl font-bold text-gray-800">{activeProfile.name}</h2>
          <p className="text-gray-500 text-sm font-medium uppercase mt-1">Joined {activeProfile.joinedDate}</p>

          {/* Level Badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-orange-200">
            <Star className="text-yellow-500" size={20} fill="currentColor" />
            <span className="font-bold text-gray-700">Level {activeProfile.level}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="text-orange-500" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-800">{activeProfile.streak}</div>
            <div className="text-sm text-gray-500 font-medium">Day Streak</div>
          </div>

          {/* XP */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="text-purple-500" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-800">{activeProfile.xp}</div>
            <div className="text-sm text-gray-500 font-medium">Total XP</div>
          </div>
        </div>

        {/* Progress to Next Level */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700 text-sm">Progress to Level {activeProfile.level + 1}</h3>
            <span className="text-xs text-gray-500 font-medium">{activeProfile.xp % 100}/100 XP</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" /> Achievements
          </h3>
          <div className="space-y-3">
            {ACHIEVEMENTS.map(ach => (
              <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${ach.unlocked ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div className="text-3xl shrink-0">{ach.unlocked ? ach.icon : '🔒'}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{ach.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{ach.description}</p>
                </div>
                {ach.unlocked && <CheckCircle className="text-green-500 shrink-0" size={20} />}
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center pt-4">
          <button onClick={logout} className="text-red-500 font-bold hover:bg-red-50 px-8 py-3 rounded-full transition-colors border-2 border-red-200 hover:border-red-300 shadow-sm">
            Log Out
          </button>
        </div>
      </div>
    </Layout>
  );
};

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profiles } = useUser();
  if (profiles.length === 0) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

// --- Updated App Router ---
const App = () => {
  return (
    <UserProvider>
      <HashRouter>
        <IgboKeyboard />
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/" element={<Navigate to="/hub" replace />} />
          <Route path="/hub" element={<RequireAuth><Hub /></RequireAuth>} />

          {/* Adult Section */}
          <Route path="/adults" element={<RequireAuth><AdultDashboard /></RequireAuth>} />
          <Route path="/adults/level/:id" element={<RequireAuth><LessonView /></RequireAuth>} />

          {/* Kid Section */}
          <Route path="/kids" element={<RequireAuth><KidsDashboard /></RequireAuth>} />
          <Route path="/kids/game/words" element={<RequireAuth><FlashcardWrapper /></RequireAuth>} />
          <Route path="/kids/game/sentence" element={<RequireAuth><SentenceGameWrapper /></RequireAuth>} />
          <Route path="/kids/game/memory" element={<RequireAuth><MemoryGameWrapper /></RequireAuth>} />
          <Route path="/kids/game/speed" element={<RequireAuth><SpeedGameWrapper /></RequireAuth>} />
          <Route path="/kids/worksheet/alphabet" element={<RequireAuth><AlphabetTracingWorksheet /></RequireAuth>} />

          {/* Shared Features */}
          <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
          <Route path="/library/worksheet/:id" element={<RequireAuth><WorksheetViewer /></RequireAuth>} />
          <Route path="/videos" element={<RequireAuth><VideoLibrary /></RequireAuth>} />
          <Route path="/practice" element={<RequireAuth><SpeakPractice /></RequireAuth>} />
          <Route path="/alphabet" element={<RequireAuth><AlphabetBoard /></RequireAuth>} />
          <Route path="/numbers" element={<RequireAuth><NumbersBoard /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Routes>
      </HashRouter>
    </UserProvider>
  );
};

export default App;
