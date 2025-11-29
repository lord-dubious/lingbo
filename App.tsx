import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { HashRouter, Routes, Route, useNavigate, useParams, Link, Navigate } from 'react-router-dom';
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
  Radio,
  AudioWaveform,
  MessageSquare,
  StopCircle,
  Play,
  Settings,
  Trophy,
  Flame,
  Clock,
  LogOut,
  X,
  Type,
  AlertCircle,
  Trash2,
  Sparkles,
  Puzzle,
  Timer,
  ArrowLeft,
  Star,
  Zap,
  Bot,
  Calendar
} from 'lucide-react';
import { LiveServerMessage, Modality } from '@google/genai';

import Layout from './components/Layout';
import IgboKeyboard from './components/IgboKeyboard';
import { ADULT_CURRICULUM, KIDS_FLASHCARDS, KIDS_GAMES, LIBRARY_BOOKS, VIDEO_RESOURCES, IGBO_ALPHABET_FULL, ACHIEVEMENTS, MEMORY_GAME_DATA } from './constants';
import { 
  generateTutorResponse, 
  generateIgboSpeech, 
  transcribeUserAudio, 
  analyzePronunciation, 
  blobToBase64,
  getGeminiClient
} from './services/geminiService';
import { ChatMessage, VideoResource, AnalysisResult, UserProfile } from './types';

// --- Global Context for User ---
interface UserContextType {
  user: UserProfile | null;
  updateUser: (data: Partial<UserProfile>) => void;
  login: (name: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('lingbo_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user data", e);
      return null;
    }
  });

  const login = (name: string) => {
    const newUser: UserProfile = {
      name,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      streak: 1,
      level: 1,
      xp: 0
    };
    setUser(newUser);
    localStorage.setItem('lingbo_user', JSON.stringify(newUser));
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('lingbo_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lingbo_user');
  };

  return (
    <UserContext.Provider value={{ user, updateUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

// --- Helper for Audio Decoding (PCM) ---
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function pcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let globalAudioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

const playPCMAudio = async (base64: string) => {
  try {
    const audioCtx = getAudioContext();
    const pcmData = base64ToUint8Array(base64);
    const buffer = await pcmToAudioBuffer(pcmData, audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

// --- Advanced Game Sound Generator ---
const playGameSound = (type: 'success' | 'error' | 'click' | 'win' | 'flip') => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      // Cheerful ding (Sine wave slide up)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'error') {
      // Low buzz (Sawtooth)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'win') {
      // Victory Arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.value = freq;
        const start = now + (i * 0.1);
        g.gain.setValueAtTime(0.0, start);
        g.gain.linearRampToValueAtTime(0.1, start + 0.05);
        g.gain.exponentialRampToValueAtTime(0.01, start + 0.4);
        o.start(start);
        o.stop(start + 0.4);
      });
    } else if (type === 'flip') {
      // Soft pop
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else {
      // Standard Click
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch(e) { /* ignore */ }
};

// --- Onboarding Component ---
const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleFinish = () => {
    if (name.trim()) {
      login(name);
      navigate('/');
    }
  };

  const slides = [
    { 
      title: "Nno! Welcome.", 
      desc: "Your journey to mastering the Igbo language starts here.", 
      image: "/assets/images/lingbo_logo_main.png",
      color: "bg-transparent" // Changed from bg-primary to transparent for logo
    },
    { title: "Learn Naturally", desc: "Speak with AI tutors, play games, and read stories.", icon: "🧠", color: "bg-accent" },
    { title: "What is your name?", desc: "Let's personalize your experience.", icon: "👋", color: "bg-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center relative">
      {step > 0 && (
        <button 
          onClick={() => { setStep(step - 1); playGameSound('click'); }} 
          className="absolute top-6 left-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors shadow-sm"
          aria-label="Go Back"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      )}

      <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center mb-8 shadow-xl animate-in zoom-in duration-500 ${slides[step].color} ${slides[step].image ? 'shadow-none' : 'shadow-xl'}`}>
        {slides[step].image ? (
          <img 
            src={slides[step].image} 
            alt="Lingbo Logo" 
            className="w-full h-full object-contain drop-shadow-2xl" 
          />
        ) : (
          <span className="text-6xl md:text-8xl">{slides[step].icon}</span>
        )}
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 animate-in fade-in">{slides[step].title}</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto animate-in fade-in delay-100 text-lg">{slides[step].desc}</p>

      {step === 2 && (
        <div className="w-full max-w-xs md:max-w-md mb-8">
          <input
            type="text"
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-center text-lg md:text-xl font-medium text-gray-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFinish()}
            autoFocus
          />
        </div>
      )}

      <div className="w-full max-w-xs md:max-w-sm">
        {step < 2 ? (
          <button onClick={() => { setStep(step + 1); playGameSound('click'); }} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors text-lg">
            Next
          </button>
        ) : (
          <button onClick={handleFinish} disabled={!name.trim()} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors text-lg">
            Start Learning
          </button>
        )}
      </div>
      
      <div className="flex gap-2 mt-8">
        {slides.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'w-6 bg-gray-800' : 'bg-gray-300'}`} />
        ))}
      </div>
    </div>
  );
};

// --- Home Component ---
const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Daily Word Logic
  const [dailyWord, setDailyWord] = useState(KIDS_FLASHCARDS[0]);
  useEffect(() => {
    // Simple pseudo-random based on date
    const day = new Date().getDate();
    setDailyWord(KIDS_FLASHCARDS[day % KIDS_FLASHCARDS.length]);
  }, []);

  const menuItems = [
    { id: 'alphabet', label: 'Alphabet', sub: 'Sound Board', icon: Type, color: 'bg-teal-100 text-teal-600', route: '/alphabet' },
    { id: 'adults', label: 'Lessons', sub: 'Curriculum', icon: GraduationCap, color: 'bg-orange-100 text-orange-600', route: '/adults' },
    { id: 'kids', label: "Kids", sub: 'Games & Fun', icon: Gamepad2, color: 'bg-green-100 text-green-600', route: '/kids' },
    { id: 'library', label: 'Library', sub: 'Books', icon: BookOpen, color: 'bg-blue-100 text-blue-600', route: '/library' },
    { id: 'videos', label: 'Videos', sub: 'Watch', icon: PlayCircle, color: 'bg-purple-100 text-purple-600', route: '/videos' },
  ];

  return (
    <Layout title="Lingbo">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-primary rounded-2xl p-6 text-white shadow-lg shadow-orange-200 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">Nno, {user?.name || 'Friend'}!</h2>
              <p className="opacity-90 md:text-lg">Ready to learn some Igbo today?</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Flame className="text-yellow-300" size={24} fill="currentColor" />
            </div>
          </div>
          <div className="mt-6 flex gap-3 relative z-10">
            <div className="bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1">
              <Flame size={14} className="text-yellow-300" /> {user?.streak || 1} Day Streak
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1">
              <Trophy size={14} className="text-yellow-300" /> Level {user?.level || 1}
            </div>
          </div>
          {/* Subtle Logo Watermark */}
          <img src="/assets/images/lingbo_logo_main.png" className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12 pointer-events-none" alt="" />
        </div>

        {/* Word of the Day Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
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
             onClick={async () => { const b64 = await generateIgboSpeech(dailyWord.igbo); if(b64) playPCMAudio(b64); }} 
             className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 text-primary transition-colors"
           >
             <Volume2 size={24} />
           </button>
        </div>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => { navigate(item.route); playGameSound('click'); }}
              className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all aspect-square relative overflow-hidden group hover:shadow-md"
            >
              <div className={`p-3 md:p-4 rounded-full mb-3 ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={28} className="md:w-8 md:h-8" />
              </div>
              <span className="font-bold text-gray-800 text-sm md:text-base">{item.label}</span>
              <span className="text-xs text-gray-400 mt-1 md:text-sm">{item.sub}</span>
            </button>
          ))}
        </div>

        {/* Speak Practice Banner */}
        <button 
          onClick={() => navigate('/practice')}
          className="w-full flex items-center justify-between bg-gradient-to-r from-accent to-emerald-600 p-4 md:p-6 rounded-xl text-white shadow-md active:scale-[0.98] transition-transform group"
        >
          <div className="flex items-center gap-3 md:gap-5">
            <div className="bg-white/20 p-2 md:p-3 rounded-lg group-hover:bg-white/30 transition-colors">
              <Mic size={24} className="md:w-8 md:h-8" />
            </div>
            <div className="text-left">
              <div className="font-bold md:text-xl">Speak & Practice</div>
              <div className="text-xs md:text-sm opacity-90">Live Conversation & Analysis</div>
            </div>
          </div>
          <ChevronRight size={20} className="md:w-6 md:h-6" />
        </button>
      </div>
      <IgboKeyboard />
    </Layout>
  );
};

// --- Memory Game Component ---
const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [lastMatchTime, setLastMatchTime] = useState<number>(0);

  useEffect(() => {
    const shuffled = [...MEMORY_GAME_DATA].sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, uid: i }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].matchId)) return;
    
    playGameSound('flip');
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const id1 = cards[newFlipped[0]].matchId;
      const id2 = cards[newFlipped[1]].matchId;
      
      if (id1 === id2) {
        setTimeout(() => {
            playGameSound('success');
            setLastMatchTime(Date.now());
            setMatched(prev => {
              const newMatched = [...prev, id1];
              if (newMatched.length === Math.floor(MEMORY_GAME_DATA.length / 2)) {
                  setTimeout(() => {
                      playGameSound('win');
                      setWon(true);
                  }, 500);
              }
              return newMatched;
            });
            setFlipped([]);
        }, 300);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl border-4 border-purple-100 min-h-[500px] flex flex-col relative overflow-hidden">
      {won && <ConfettiOverlay onRestart={() => window.location.reload()} />}
      {Date.now() - lastMatchTime < 1500 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in zoom-in slide-in-from-bottom-5 fade-out duration-1000">
              <div className="bg-yellow-400 text-yellow-900 font-kids font-bold text-3xl md:text-5xl px-8 py-4 rounded-full shadow-lg border-4 border-white transform rotate-[-5deg]">
                  Match!
              </div>
          </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ArrowLeft size={24} className="text-gray-700" /></button>
        <h3 className="font-kids font-bold text-2xl md:text-3xl text-purple-600 tracking-wide">Memory Match</h3>
        <div className="w-10"></div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 flex-1 content-start perspective-[1000px]">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(card.matchId);
          return (
            <button
              key={card.uid}
              onClick={() => handleCardClick(i)}
              className="aspect-square relative group cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
              disabled={isFlipped}
            >
              <div 
                className="w-full h-full transition-all duration-500" 
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                  <div 
                    className="absolute inset-0 bg-purple-500 rounded-xl border-b-4 border-purple-700 shadow-sm flex items-center justify-center"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  >
                      <span className="text-white font-kids font-bold text-4xl md:text-5xl opacity-50 select-none">?</span>
                  </div>
                  <div 
                    className={`absolute inset-0 bg-white rounded-xl border-4 ${matched.includes(card.matchId) ? 'border-green-400 bg-green-50' : 'border-purple-300'} shadow-md flex items-center justify-center overflow-hidden`}
                    style={{ 
                      backfaceVisibility: 'hidden', 
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)' 
                    }}
                  >
                     {card.type === 'image' ? (
                         <img src={card.content} className="w-full h-full object-cover select-none" alt="" />
                     ) : (
                         <span className="font-kids font-bold text-gray-800 text-sm md:text-lg lg:text-xl px-1 break-words select-none text-center">{card.content}</span>
                     )}
                  </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Speed Tap Game Component ---
const SpeedTapGame = ({ onBack }: { onBack: () => void }) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [target, setTarget] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{idx: number, status: 'correct' | 'wrong'} | null>(null);

  useEffect(() => {
    generateRound();
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          clearInterval(timer);
          playGameSound('win');
          setGameOver(true);
          return 0;
        }
        return Math.max(0, t - 0.1);
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const generateRound = () => {
    const subset = KIDS_FLASHCARDS.sort(() => Math.random() - 0.5).slice(0, 4);
    const correct = subset[Math.floor(Math.random() * subset.length)];
    setTarget(correct);
    setOptions(subset);
    setFeedbackState(null);
  };

  const handleTap = (item: any, idx: number) => {
    if (gameOver || feedbackState) return;

    if (item.english === target.english) {
      playGameSound('success');
      setScore(s => s + (10 * (1 + Math.floor(combo / 3))));
      setCombo(c => c + 1);
      setFeedbackState({ idx, status: 'correct' });
      setTimeout(generateRound, 400);
    } else {
      playGameSound('error');
      setScore(s => Math.max(0, s - 5));
      setCombo(0);
      setFeedbackState({ idx, status: 'wrong' });
      setTimeout(() => setFeedbackState(null), 400);
    }
  };

  const progressColor = timeLeft > 15 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-3xl p-4 md:p-8 shadow-xl border-4 border-blue-100 min-h-[500px] flex flex-col relative overflow-hidden max-w-2xl mx-auto">
      {gameOver && (
        <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center animate-in zoom-in">
          <Trophy size={80} className="text-yellow-500 mb-4 animate-bounce drop-shadow-lg" />
          <h2 className="text-4xl font-kids font-bold text-gray-800 mb-2">Time's Up!</h2>
          <div className="text-2xl font-bold text-blue-600 mb-6 bg-blue-50 px-6 py-2 rounded-full border border-blue-100">Score: {score}</div>
          <button onClick={() => window.location.reload()} className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-600 active:scale-95 transition-all">Play Again</button>
          <button onClick={onBack} className="mt-6 text-gray-500 font-bold text-sm hover:text-gray-700">Exit</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ArrowLeft size={24} className="text-gray-700" /></button>
        <div className="flex flex-col items-end">
             <div className="font-kids font-bold text-2xl text-blue-600 drop-shadow-sm">{score} pts</div>
             {combo > 1 && <div className="text-xs font-bold text-orange-500 animate-pulse">x{1 + Math.floor(combo/3)} Combo!</div>}
        </div>
      </div>

      <div className="w-full h-4 bg-gray-100 rounded-full mb-6 overflow-hidden border border-gray-200">
          <div className={`h-full ${progressColor} transition-all duration-100 ease-linear`} style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-8 relative">
          <p className="text-gray-500 text-sm md:text-base font-bold uppercase mb-2 tracking-widest">Tap the image for</p>
          <h2 className="text-5xl md:text-6xl font-kids font-bold text-gray-800 animate-in slide-in-from-top-2 key={target?.english} drop-shadow-sm">
              {target?.igbo}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-sm md:max-w-md">
          {options.map((opt, i) => {
             const isFeedback = feedbackState?.idx === i;
             const statusColor = isFeedback ? (feedbackState.status === 'correct' ? 'border-green-500 scale-105' : 'border-red-500 shake') : 'border-gray-200';
             
             return (
                <button 
                  key={i} 
                  onClick={() => handleTap(opt, i)}
                  className={`aspect-square rounded-2xl overflow-hidden border-4 ${statusColor} bg-white shadow-sm active:scale-95 transition-all duration-200 relative group hover:shadow-md`}
                >
                  <img src={opt.image} className="w-full h-full object-cover" alt="" />
                  {isFeedback && feedbackState.status === 'correct' && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="text-white w-12 h-12 drop-shadow-md" />
                      </div>
                  )}
                </button>
             );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Confetti Component ---
const ConfettiOverlay = ({ onRestart }: { onRestart?: () => void }) => (
  <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center animate-in zoom-in p-6 text-center">
    <div className="mb-6 relative">
        <Sparkles size={80} className="text-yellow-400 animate-spin-slow absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <Star size={60} className="text-orange-400 animate-bounce absolute top-4 right-[-20px]" fill="currentColor"/>
        <Trophy size={100} className="text-purple-500 relative z-10 drop-shadow-xl" />
    </div>
    
    <h3 className="font-kids font-bold text-4xl text-pink-500 mb-2">Great Job!</h3>
    <p className="font-bold text-gray-500 text-lg mb-8">O mara nma!</p>
    {onRestart && <button onClick={onRestart} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">Play Again</button>}
  </div>
);

// --- Kids Dashboard ---
const KidsDashboard = () => {
  const [view, setView] = useState<'menu' | 'words' | 'game_sentence' | 'game_memory' | 'game_speed'>('menu');
  const [currentCard, setCurrentCard] = useState(0);
  const nextCard = () => { playGameSound('click'); setCurrentCard((p) => (p + 1) % KIDS_FLASHCARDS.length); };
  const prevCard = () => { playGameSound('click'); setCurrentCard((p) => (p - 1 + KIDS_FLASHCARDS.length) % KIDS_FLASHCARDS.length); };
  const card = KIDS_FLASHCARDS[currentCard];
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);
  const sentenceGame = KIDS_GAMES[0];
  const [availableBlocks, setAvailableBlocks] = useState<string[]>(sentenceGame.example_round.scrambled_blocks);
  const [gameWon, setGameWon] = useState(false);
  const navigate = useNavigate();

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
      }
    }
  };

  const resetSentenceGame = () => {
    setBuiltSentence([]);
    setAvailableBlocks(sentenceGame.example_round.scrambled_blocks);
    setGameWon(false);
  };

  return (
    <Layout title="Kids Corner" showBack={true} isKidsMode hideBottomNav>
       {/* Explicit Back handler for menu view */}
       {view === 'menu' && (
           <div className="fixed top-3 left-4 z-50">
               <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full shadow-md border-2 border-gray-100 hover:bg-gray-50">
                   <ArrowLeft className="text-gray-700" size={24}/>
               </button>
           </div>
       )}

      {view === 'menu' && (
        <div className="space-y-6 pt-8">
           <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-yellow-200 flex items-center gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
             <div className="bg-yellow-100 p-4 rounded-full text-yellow-600 shadow-inner"><Gamepad2 size={36}/></div>
             <div>
               <h2 className="font-kids text-2xl md:text-3xl font-bold text-gray-800 leading-tight">Hello, Champ!</h2>
               <p className="text-gray-500 text-sm md:text-base">Let's play and learn!</p>
             </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={() => setView('words')} className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-200 flex items-center justify-between group transition-all active:scale-95 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1">
               <div className="flex items-center gap-5">
                 <div className="bg-white/20 p-3 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform"><BookOpen size={28}/></div>
                 <div className="text-left">
                   <h3 className="font-kids text-xl font-bold tracking-wide">Flashcards</h3>
                   <p className="text-blue-100 text-xs font-medium">Learn new words</p>
                 </div>
               </div>
               <div className="bg-white/20 p-2 rounded-full"><ChevronRight className="group-hover:translate-x-1 transition-transform"/></div>
             </button>
             <button onClick={() => setView('game_sentence')} className="bg-pink-500 hover:bg-pink-600 text-white p-6 rounded-3xl shadow-lg shadow-pink-200 flex items-center justify-between group transition-all active:scale-95 border-b-4 border-pink-700 active:border-b-0 active:translate-y-1">
               <div className="flex items-center gap-5">
                 <div className="bg-white/20 p-3 rounded-2xl -rotate-3 group-hover:rotate-0 transition-transform"><Puzzle size={28}/></div>
                 <div className="text-left">
                   <h3 className="font-kids text-xl font-bold tracking-wide">Sentence Puzzle</h3>
                   <p className="text-pink-100 text-xs font-medium">Build sentences</p>
                 </div>
               </div>
               <div className="bg-white/20 p-2 rounded-full"><ChevronRight className="group-hover:translate-x-1 transition-transform"/></div>
             </button>
             <button onClick={() => setView('game_memory')} className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-3xl shadow-lg shadow-purple-200 flex items-center justify-between group transition-all active:scale-95 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">
               <div className="flex items-center gap-5">
                 <div className="bg-white/20 p-3 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform"><Sparkles size={28}/></div>
                 <div className="text-left">
                   <h3 className="font-kids text-xl font-bold tracking-wide">Memory Match</h3>
                   <p className="text-purple-100 text-xs font-medium">Find the pairs</p>
                 </div>
               </div>
               <div className="bg-white/20 p-2 rounded-full"><ChevronRight className="group-hover:translate-x-1 transition-transform"/></div>
             </button>
             <button onClick={() => setView('game_speed')} className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-3xl shadow-lg shadow-orange-200 flex items-center justify-between group transition-all active:scale-95 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1">
               <div className="flex items-center gap-5">
                 <div className="bg-white/20 p-3 rounded-2xl -rotate-3 group-hover:rotate-0 transition-transform"><Zap size={28}/></div>
                 <div className="text-left">
                   <h3 className="font-kids text-xl font-bold tracking-wide">Speed Tap</h3>
                   <p className="text-orange-100 text-xs font-medium">Race against time</p>
                 </div>
               </div>
               <div className="bg-white/20 p-2 rounded-full"><ChevronRight className="group-hover:translate-x-1 transition-transform"/></div>
             </button>
           </div>
        </div>
      )}

      {view === 'game_memory' && <MemoryGame onBack={() => setView('menu')} />}
      {view === 'game_speed' && <SpeedTapGame onBack={() => setView('menu')} />}

      {view === 'words' && (
        <div className="flex flex-col items-center">
          <button onClick={() => setView('menu')} className="self-start mb-4 text-blue-500 font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded-full"><ArrowLeft size={16}/> Back</button>
          <div className="w-full max-w-sm md:max-w-md aspect-[4/5] bg-white rounded-3xl shadow-xl border-4 border-yellow-300 p-6 flex flex-col items-center justify-between relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
             <div className="absolute top-0 left-0 w-full h-3 bg-blue-400"></div>
             <div className="w-full flex justify-between items-center text-gray-400 text-sm font-bold">
               <span className="bg-gray-100 px-2 py-1 rounded-md">{card.english}</span>
               <button onClick={async () => { const b64 = await generateIgboSpeech(card.igbo); if(b64) playPCMAudio(b64); }} className="p-3 hover:bg-blue-50 rounded-full border border-gray-100 shadow-sm"><Volume2 size={24} className="text-blue-500" /></button>
             </div>
             <div className="relative flex-1 flex items-center justify-center w-full">
                <div className="absolute inset-0 bg-yellow-200 rounded-full blur-2xl opacity-20 scale-150"></div>
                <img src={card.image} alt={card.english} className="w-48 h-48 md:w-64 md:h-64 object-contain animate-in zoom-in duration-500 drop-shadow-lg relative z-10" />
             </div>
             <div className="text-center w-full">
               <h2 className="text-5xl md:text-6xl font-kids font-bold text-blue-600 mb-2 drop-shadow-sm">{card.igbo}</h2>
               <div className="h-1 w-16 bg-blue-100 mx-auto rounded-full"></div>
             </div>
          </div>
          <div className="flex items-center gap-6 mt-8">
            <button onClick={prevCard} className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-95 transition-all border border-gray-100"><ChevronRight size={36} className="rotate-180" /></button>
            <button onClick={nextCard} className="w-16 h-16 bg-blue-500 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-blue-600"><ChevronRight size={36} /></button>
          </div>
        </div>
      )}

      {view === 'game_sentence' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-pink-100 relative overflow-hidden min-h-[450px] flex flex-col max-w-2xl mx-auto">
           <button onClick={() => setView('menu')} className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full z-10 hover:bg-gray-200"><ArrowLeft size={20}/></button>
           {gameWon && <ConfettiOverlay onRestart={resetSentenceGame} />}
           <div className="text-center mb-6 mt-6">
             <div className="inline-block bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold mb-2">PUZZLE TIME</div>
             <h3 className="font-kids font-bold text-2xl md:text-3xl text-pink-500 mb-1">Sentence Builder</h3>
             <p className="text-gray-500 text-sm md:text-base">Make: <span className="text-gray-800 font-bold bg-gray-100 px-1 rounded">"{sentenceGame.example_round.target_sentence}"</span></p>
           </div>
           <div className="bg-gray-50 rounded-2xl p-6 min-h-[120px] flex gap-3 flex-wrap items-center justify-center mb-8 border-2 border-dashed border-gray-300 relative">
              {builtSentence.length === 0 && (
                  <div className="text-gray-300 text-sm font-bold flex flex-col items-center animate-pulse">
                      <Puzzle size={32} className="mb-2" />
                      <span>Tap blocks below to build!</span>
                  </div>
              )}
              {builtSentence.map((word, i) => (
                <div key={i} className="bg-white px-5 py-3 rounded-xl shadow-md font-bold text-gray-700 animate-in zoom-in border border-gray-100 text-lg md:text-xl flex items-center gap-2">
                    {word}
                </div>
              ))}
           </div>
           <div className="flex gap-4 justify-center flex-wrap mt-auto">
             {availableBlocks.map((word, i) => (
               <button 
                  key={i} 
                  onClick={() => handleBlockClick(word)} 
                  className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold px-6 py-4 rounded-2xl shadow-md border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all text-lg md:text-xl animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 100}ms` }}
               >
                 {word}
               </button>
             ))}
           </div>
           <div className="mt-8 flex justify-center">
             <button onClick={resetSentenceGame} className="text-gray-400 flex items-center gap-2 text-sm font-bold hover:text-pink-500 transition-colors bg-gray-50 px-4 py-2 rounded-full"><RefreshCcw size={16} /> Start Over</button>
           </div>
        </div>
      )}
    </Layout>
  );
};

// --- Alphabet Sound Board ---
const AlphabetBoard = () => {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const playLetter = async (letter: string) => {
    setPlayingKey(letter);
    playGameSound('click');
    const b64 = await generateIgboSpeech(letter);
    if (b64) await playPCMAudio(b64);
    setTimeout(() => setPlayingKey(null), 500);
  };
  return (
    <Layout title="Igbo Alphabet" showBack backPath="/">
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border-l-4 border-teal-500">
        <h3 className="font-bold text-gray-800 mb-1">Abidii Igbo</h3>
        <p className="text-sm text-gray-500">Tap a letter to hear how it sounds.</p>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {IGBO_ALPHABET_FULL.map((letter) => (
          <button
            key={letter}
            onClick={() => playLetter(letter)}
            className={`aspect-square rounded-xl flex items-center justify-center text-xl font-bold transition-all shadow-sm border-2 ${playingKey === letter ? 'bg-teal-500 text-white border-teal-600 scale-95' : 'bg-white text-gray-800 border-gray-100 hover:border-teal-300'}`}
          >
            {playingKey === letter ? <Volume2 size={24} className="animate-pulse" /> : letter}
          </button>
        ))}
      </div>
    </Layout>
  );
};

// --- Adult Dashboard ---
const AdultDashboard = () => {
  const navigate = useNavigate();
  return (
    <Layout title="Curriculum" showBack backPath="/">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADULT_CURRICULUM.map((level) => (
          <div 
            key={level.level_id}
            onClick={() => level.status !== 'locked' && navigate(`/adults/level/${level.level_id}`)}
            className={`relative p-5 rounded-xl border-2 flex items-center justify-between transition-colors ${level.status === 'locked' ? 'bg-gray-50 border-gray-200 opacity-70 cursor-not-allowed' : 'bg-white border-primary/20 hover:border-primary cursor-pointer shadow-sm hover:shadow-md'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${level.status === 'completed' ? 'bg-green-100 text-green-600' : level.status === 'in_progress' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                {level.status === 'completed' ? <CheckCircle size={20} /> : level.level_id}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Level {level.level_id}</div>
                <div className="font-bold text-gray-800 text-lg leading-tight truncate">{level.title}</div>
                {level.description && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{level.description}</div>}
              </div>
            </div>
            <div>{level.status === 'locked' ? <Lock size={20} className="text-gray-300" /> : <ChevronRight size={20} className="text-primary" />}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

// --- Lesson View ---
const LessonView = () => {
  const { id } = useParams<{id: string}>();
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn');
  const [showImages, setShowImages] = useState(true);
  const [quizFeedback, setQuizFeedback] = useState<{msg: string, type: 'success' | 'error' | null}>({ msg: '', type: null });
  const levelId = parseInt(id || '1');
  const level = ADULT_CURRICULUM.find(l => l.level_id === levelId);
  const vocabLesson = level?.lessons?.find(l => l.type === 'vocabulary');
  const quizLesson = level?.lessons?.find(l => l.type === 'quiz_section');

  const handleQuizAnswer = (correct: boolean) => {
    playGameSound(correct ? 'success' : 'error');
    setQuizFeedback({ msg: correct ? 'Correct! (O doro anya)' : 'Try again (Nwaa ozo)', type: correct ? 'success' : 'error' });
    setTimeout(() => setQuizFeedback({ msg: '', type: null }), 2000);
  };

  if (!level) return <Layout title="Error" showBack backPath="/adults"><div>Level not found</div></Layout>;

  return (
    <Layout title={level.title} showBack backPath="/adults">
      <div className="flex bg-gray-200 p-1 rounded-lg mb-6 max-w-md mx-auto">
        <button onClick={() => setActiveTab('learn')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'learn' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>Learn Vocabulary</button>
        <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'quiz' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>Quiz</button>
      </div>

      {activeTab === 'learn' && vocabLesson && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={() => setShowImages(!showImages)} className="text-xs flex items-center gap-1 text-primary font-medium"><ImageIcon size={14} /> {showImages ? 'Hide' : 'Show'} Images</button></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vocabLesson.data?.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                {showImages && item.image && <img src={item.image} alt={item.english} className="w-16 h-16 rounded-lg object-cover bg-gray-100 border border-gray-100" />}
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-bold text-gray-800 truncate">{item.igbo}</div>
                  <div className="text-gray-500 text-sm truncate">{item.english}</div>
                </div>
                <button onClick={async () => { const b64 = await generateIgboSpeech(item.igbo); if(b64) playPCMAudio(b64); }} className="p-3 rounded-full bg-orange-50 text-primary hover:bg-orange-100 shrink-0"><Volume2 size={20} /></button>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
             <button onClick={() => setActiveTab('quiz')} className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all">Ready for Quiz?</button>
          </div>
        </div>
      )}

      {activeTab === 'quiz' && quizLesson && (
        <div className="space-y-6 pb-12 relative max-w-2xl mx-auto">
          {quizFeedback.msg && (
             <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full shadow-lg font-bold text-white animate-in fade-in slide-in-from-top-2 ${quizFeedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{quizFeedback.msg}</div>
          )}
          {quizLesson.activities?.map((quiz, idx) => (
            <div key={idx} className="bg-white p-5 md:p-8 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center gap-2 mb-3"><span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded">Q{idx + 1}</span></div>
              <p className="font-bold text-gray-900 text-lg md:text-xl mb-6">{quiz.question || quiz.instruction}</p>
              {quiz.quiz_type === 'multiple_choice_3_options' && (
                <div className="space-y-3">
                  {quiz.options?.map((opt, oIdx) => (
                    <button key={oIdx} className="w-full text-left p-4 rounded-lg border-2 border-gray-100 hover:border-primary hover:bg-orange-50 font-medium text-gray-900 bg-gray-50 transition-colors" onClick={() => handleQuizAnswer(opt === quiz.correct_answer)}>{opt}</button>
                  ))}
                </div>
              )}
              {quiz.quiz_type === 'match_picture_to_word' && (
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                   {quiz.options?.map((imgSrc, iIdx) => (
                     <button key={iIdx} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary shadow-sm hover:shadow-md transition-all active:scale-95" onClick={() => handleQuizAnswer(imgSrc === quiz.correct_answer)}>
                       <img src={imgSrc} alt="option" className="w-full h-full object-cover" />
                     </button>
                   ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

// --- Library Component ---
const Library = () => {
  const [viewingBook, setViewingBook] = useState<string | null>(null);
  return (
    <Layout title="Library" showBack backPath="/">
       {viewingBook ? (
         <div className="bg-white rounded-xl shadow-lg p-6 min-h-[50vh] flex flex-col items-center justify-center animate-in zoom-in-95 max-w-2xl mx-auto">
           <BookOpen size={48} className="text-gray-300 mb-4" />
           <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{viewingBook}</h3>
           <p className="text-gray-400 text-center mb-6">Preview Only</p>
           <button onClick={() => setViewingBook(null)} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 mt-4">Close Book</button>
         </div>
       ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {LIBRARY_BOOKS.map((book, idx) => (
            <button key={idx} onClick={() => setViewingBook(book.title)} className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 text-left active:scale-95 transition-transform hover:shadow-md">
              <div className="aspect-[3/4] bg-gray-200 rounded-md mb-3 overflow-hidden relative group">
                <img src={book.cover || ""} alt={book.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight mb-1 truncate">{book.title}</h3>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 inline-block">{book.type}</span>
            </button>
          ))}
        </div>
       )}
    </Layout>
  );
}

// --- Video Library ---
const VideoLibrary = () => {
  const [activeVideo, setActiveVideo] = useState<VideoResource | null>(null);
  return (
    <Layout title="Video Library" showBack backPath="/">
      {activeVideo && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={() => setActiveVideo(null)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="aspect-video bg-black flex items-center justify-center relative">
               <p className="text-white">Playing: {activeVideo.title}</p>
               <Play size={48} className="text-white/50 absolute" />
            </div>
            <div className="p-4 flex justify-between items-center">
              <div><h3 className="font-bold text-lg md:text-xl">{activeVideo.title}</h3></div>
              <button onClick={() => setActiveVideo(null)} className="p-2 bg-red-100 rounded-full hover:bg-red-200 text-red-600 transition-colors"><X size={20}/></button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {VIDEO_RESOURCES.map((video) => (
          <button key={video.id} onClick={() => setActiveVideo(video)} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex gap-4 p-3 hover:border-primary/50 text-left transition-all hover:shadow-md">
             <div className="w-32 md:w-40 aspect-video bg-gray-200 rounded-lg overflow-hidden relative shrink-0">
               <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><PlayCircle size={24} className="text-white opacity-80" /></div>
             </div>
             <div className="flex-1 py-1 min-w-0">
               <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded mb-1 inline-block">{video.category}</span>
               <h4 className="font-bold text-gray-800 leading-tight mb-1 truncate">{video.title}</h4>
               <p className="text-xs text-gray-500">{video.duration}</p>
             </div>
          </button>
        ))}
      </div>
    </Layout>
  );
};

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const hasUser = localStorage.getItem('lingbo_user');
  if (!hasUser && !user) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const ProfilePage = () => {
  const { user, updateUser, logout } = useUser();
  const [mode, setMode] = useState<'view' | 'achievements' | 'settings'>('view');
  const [editName, setEditName] = useState(user?.name || '');
  if (!user) return <Navigate to="/" replace />;

  const handleReset = () => { if(confirm("Are you sure?")) logout(); };

  return (
    <Layout title="My Profile" showBack={mode !== 'view'} backPath="/profile">
       {mode === 'view' && (
         <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 text-center">
            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-orange-100 shadow-sm">{user.name.charAt(0).toUpperCase()}</div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500 text-sm">Joined {user.joinedDate}</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => setMode('achievements')} className="w-full bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><Trophy size={20} className="text-yellow-600"/> <span className="font-bold text-gray-700">Achievements</span></div><ChevronRight size={20}/></button>
            <button onClick={() => setMode('settings')} className="w-full bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><Settings size={20} className="text-gray-600"/> <span className="font-bold text-gray-700">Settings</span></div><ChevronRight size={20}/></button>
          </div>
         </div>
       )}
       {mode === 'achievements' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {ACHIEVEMENTS.map((ach) => (
             <div key={ach.id} className={`p-4 rounded-xl border-2 flex items-center gap-4 ${ach.unlocked ? 'bg-white border-yellow-200' : 'bg-gray-50 border-gray-100 grayscale opacity-60'}`}>
               <div className="text-4xl">{ach.icon}</div>
               <div><div className="font-bold text-gray-800">{ach.title}</div><div className="text-xs text-gray-500">{ach.description}</div></div>
               {ach.unlocked && <CheckCircle size={20} className="text-green-500 ml-auto" />}
             </div>
           ))}
         </div>
       )}
       {mode === 'settings' && (
         <div className="space-y-6 max-w-md mx-auto">
            <div><label className="block text-sm font-bold text-gray-700 mb-2">Name</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 border rounded-lg" /></div>
            <button onClick={() => {updateUser({name: editName}); setMode('view');}} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-orange-600">Save Changes</button>
            <hr className="border-gray-200"/>
            <button onClick={handleReset} className="w-full text-red-500 font-bold p-4 bg-red-50 rounded-xl hover:bg-red-100">Reset Progress</button>
            <button onClick={logout} className="w-full text-gray-500 font-bold p-4 hover:text-gray-700">Log Out</button>
         </div>
       )}
    </Layout>
  );
};

// --- Speak Practice (Revised UI) ---
const TextChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: '1', role: 'model', text: 'Nno! I am Chike, your Igbo tutor.' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if(!input.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: input };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setIsLoading(true);
    const reply = await generateTutorResponse(userMsg.text);
    setMessages(p => [...p, { id: Date.now().toString(), role: 'model', text: reply }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative">
      <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-3 shadow-sm z-10">
        <div className="relative">
           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold shadow-md">C</div>
           <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <div>
           <div className="font-bold text-gray-800 leading-tight">Chike</div>
           <div className="text-xs text-gray-400 font-medium">Native Tutor</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-6 p-5 bg-[url('https://www.transparenttextures.com/patterns/subtle-dots.png')] bg-gray-50">
        {messages.map(m => (
          <div key={m.id} className={`flex items-end gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {m.role === 'model' && (
               <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0 mb-1 shadow-sm">C</div>
            )}
            <div className={`px-5 py-3 rounded-2xl max-w-[80%] md:max-w-[70%] text-sm md:text-base shadow-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 text-xs ml-12">
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></span>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <input 
             value={input} 
             onChange={e => setInput(e.target.value)} 
             onKeyDown={e => e.key === 'Enter' && handleSend()}
             className="flex-1 bg-transparent border-none px-4 py-2 outline-none text-gray-700 placeholder:text-gray-400" 
             placeholder="Type a message..." 
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-transform active:scale-95">
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionRef = useRef<Promise<any> | null>(null);
  
  const startLiveSession = async () => {
    try {
      const ai = getGeminiClient();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: { 
            responseModalities: [Modality.AUDIO], 
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: "You are 'Chike', a native Igbo language tutor from Nigeria. Speak with a distinct, clear Nigerian accent when speaking English to provide an authentic experience. When speaking Igbo, use the standard Central Igbo dialect, enunciate clearly, and maintain a patient, encouraging tone. Correct the user's pronunciation and grammar gently."
        },
        callbacks: {
          onopen: () => {
             setIsConnected(true);
             processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                const b64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
                sessionPromise.then(s => s.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: b64 } }));
             };
             source.connect(processor);
             processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
               setIsSpeaking(true);
               await playPCMAudio(audio);
               setIsSpeaking(false);
            }
          },
          onclose: () => setIsConnected(false)
        }
      });
      sessionRef.current = sessionPromise;
    } catch(e) { console.error(e); alert("Mic error or API key missing."); }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
      
      <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-10 transition-all duration-500 relative ${isConnected ? 'bg-orange-50' : 'bg-gray-50'}`}>
         {isConnected && (
           <>
             <div className={`absolute inset-0 rounded-full border-4 border-primary/30 ${isSpeaking ? 'animate-ping' : ''}`}></div>
             <div className={`absolute inset-0 rounded-full border-4 border-primary/20 ${isSpeaking ? 'animate-pulse delay-75' : ''}`}></div>
           </>
         )}
         <div className={`w-32 h-32 rounded-full flex items-center justify-center z-10 shadow-xl transition-colors ${isConnected ? 'bg-gradient-to-br from-primary to-orange-600 text-white' : 'bg-white text-gray-300 border-4 border-gray-100'}`}>
            {isConnected ? <AudioWaveform size={48} /> : <Mic size={48} />}
         </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-2">{isConnected ? (isSpeaking ? "Chike is speaking..." : "Listening...") : "Start Conversation"}</h3>
      <p className="text-gray-500 mb-8 max-w-xs">{isConnected ? "Practice your Igbo pronunciation naturally." : "Connect to Chike for a real-time voice chat."}</p>
      
      <button onClick={isConnected ? () => window.location.reload() : startLiveSession} className={`px-8 py-4 rounded-full font-bold text-white text-lg shadow-lg hover:scale-105 transition-transform active:scale-95 ${isConnected ? 'bg-red-500 shadow-red-200' : 'bg-primary shadow-orange-200'}`}>
        {isConnected ? <span className="flex items-center gap-2"><StopCircle /> End Session</span> : 'Start Live Chat'}
      </button>
    </div>
  );
};

const PronunciationCoach = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.current.ondataavailable = e => chunks.push(e.data);
      recorder.current.onstop = async () => {
        setIsAnalyzing(true);
        const blob = new Blob(chunks, {type: 'audio/webm'});
        const b64 = await blobToBase64(blob);
        const txt = await transcribeUserAudio(b64);
        const analysis = await analyzePronunciation("Kedu ka i mere?", txt);
        setResult(analysis);
        setIsAnalyzing(false);
      };
      recorder.current.start();
      setIsRecording(true);
    } catch(e) {
      console.error(e);
      alert("Microphone permission required");
    }
  };
  const stop = () => { recorder.current?.stop(); setIsRecording(false); };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 text-center min-h-[50vh] flex flex-col items-center justify-center">
      <div className="mb-8">
          <h3 className="text-4xl md:text-5xl font-bold mb-2 text-gray-800">Kedu ka i mere?</h3>
          <p className="text-gray-400 font-medium">"How are you?"</p>
      </div>

      <button 
        onMouseDown={start}
        onMouseUp={stop}
        onTouchStart={start}
        onTouchEnd={stop}
        disabled={isAnalyzing}
        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${isRecording ? 'bg-red-500 shadow-red-300 scale-110' : 'bg-primary shadow-orange-200'} ${isAnalyzing ? 'opacity-50 cursor-wait' : ''}`}
      >
        {isAnalyzing ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <Mic size={40} className="text-white" />}
      </button>
      
      <p className="mt-6 text-gray-400 font-medium h-6">{isRecording ? "Recording..." : isAnalyzing ? "Analyzing..." : "Hold to Speak"}</p>

      {result && (
        <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-200 w-full animate-in slide-in-from-bottom-5">
           <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`text-3xl font-bold ${result.score > 80 ? 'text-green-500' : result.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>{result.score}%</div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">Match Score</div>
           </div>
           
           <div className="grid grid-cols-2 gap-4 text-left mb-4 text-sm">
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase">You Said (Igbo)</div>
                <div className="font-medium text-gray-800">{result.user_said_igbo}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase">Meaning</div>
                <div className="font-medium text-gray-800">{result.user_said_english}</div>
              </div>
           </div>
           
           <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic">
             "{result.feedback}"
           </div>
        </div>
      )}
    </div>
  );
};

const SpeakPractice = () => {
  const [tab, setTab] = useState<'chat' | 'live' | 'coach'>('chat');
  
  return (
    <Layout title="AI Tutor" showBack backPath="/">
       <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
         <button onClick={() => setTab('chat')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${tab === 'chat' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Chat</button>
         <button onClick={() => setTab('live')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${tab === 'live' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Live</button>
         <button onClick={() => setTab('coach')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${tab === 'coach' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Pronounce</button>
       </div>
       
       <div className="animate-in fade-in duration-300">
         {tab === 'chat' && <TextChat />}
         {tab === 'live' && <LiveChat />}
         {tab === 'coach' && <PronunciationCoach />}
       </div>
    </Layout>
  );
};

const App = () => {
  return (
    <UserProvider>
      <HashRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/alphabet" element={<RequireAuth><AlphabetBoard /></RequireAuth>} />
          <Route path="/adults" element={<RequireAuth><AdultDashboard /></RequireAuth>} />
          <Route path="/adults/level/:id" element={<RequireAuth><LessonView /></RequireAuth>} />
          <Route path="/kids" element={<RequireAuth><KidsDashboard /></RequireAuth>} />
          <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
          <Route path="/videos" element={<RequireAuth><VideoLibrary /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/practice" element={<RequireAuth><SpeakPractice /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </UserProvider>
  );
};

export default App;