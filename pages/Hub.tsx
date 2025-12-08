
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Calendar, Sparkles, Loader2, Volume2, GraduationCap, ChevronRight, Users, Smile } from 'lucide-react';
import { KIDS_FLASHCARDS } from '../constants';
import { playPCMAudio } from '../utils/audioUtils';
import { generateIgboSpeech } from '../services/geminiService';
import ProfileSelector from '../components/ProfileSelector';
import { ProfileType } from '../types';

const Hub = () => {
  const [showProfileSelector, setShowProfileSelector] = useState<ProfileType | null>(null);
  const [dailyWord, setDailyWord] = useState(KIDS_FLASHCARDS[0]);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    const day = new Date().getDate();
    setDailyWord(KIDS_FLASHCARDS[day % KIDS_FLASHCARDS.length]);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Ututu ọma (Good Morning)";
    if (hour < 18) return "Ehihie ọma (Good Afternoon)";
    return "Mgbede ọma (Good Evening)";
  };

  const handlePlayWord = async () => {
    if (audioLoading) return;
    setAudioLoading(true);
    try {
        const b64 = await generateIgboSpeech(dailyWord.igbo);
        if (b64) {
             await playPCMAudio(b64);
        }
    } catch (e) {
        console.error("Failed to play audio", e);
    } finally {
        setAudioLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral p-4 md:p-6 pb-24">
      {showProfileSelector && <ProfileSelector type={showProfileSelector} onClose={() => setShowProfileSelector(null)} />}
      
      <header className="max-w-4xl mx-auto flex items-center justify-between py-4 mb-6">
        <div className="flex items-center gap-2">
           <img src="/assets/images/lingbo_logo_main.png" alt="Lingbo" className="h-8 object-contain" />
           <span className="font-bold text-xl text-gray-800 tracking-tight">Lingbo</span>
        </div>
        <Link to="/profile" className="p-2 bg-white rounded-full border border-gray-200 text-gray-600 hover:text-primary transition-colors"><Settings size={20} /></Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-800 mb-1">{getGreeting()}</h1>
           <p className="text-gray-500">Let's learn something new today.</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
           </div>
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 p-1.5 rounded-lg"><Calendar size={16} /></div>
                    <span className="text-sm font-bold uppercase tracking-wider text-white/90">Daily Word</span>
                 </div>
                 <h2 className="text-4xl font-bold mb-1">{dailyWord.igbo}</h2>
                 <p className="text-xl text-white/90">{dailyWord.english}</p>
              </div>
              <button 
                 onClick={handlePlayWord} 
                 className="w-14 h-14 bg-white text-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                 disabled={audioLoading}
              >
                 {audioLoading ? <Loader2 size={24} className="animate-spin" /> : <Volume2 size={28} />}
              </button>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button onClick={() => setShowProfileSelector('adult')} className="group bg-white rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all border border-gray-100 text-left">
            <div className="bg-gray-50 rounded-[20px] p-6 h-full border border-white group-hover:bg-orange-50/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-orange-500 border border-gray-100 group-hover:scale-110 transition-transform">
                  <GraduationCap size={24} />
                </div>
                <div className="bg-gray-200 text-gray-600 p-1.5 rounded-full"><ChevronRight size={16}/></div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Adult Learning</h2>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">Structured lessons, grammar rules, and cultural deep dives.</p>
              <div className="flex -space-x-2 overflow-hidden">
                 <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                 <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                 <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">+3</div>
              </div>
            </div>
          </button>

          <button onClick={() => setShowProfileSelector('kid')} className="group bg-white rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all border border-gray-100 text-left">
            <div className="bg-yellow-50/50 rounded-[20px] p-6 h-full border border-white group-hover:bg-yellow-100/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-yellow-500 border border-gray-100 group-hover:scale-110 transition-transform">
                  <Smile size={24} />
                </div>
                <div className="bg-yellow-200 text-yellow-700 p-1.5 rounded-full"><ChevronRight size={16}/></div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Kids Corner</h2>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">Interactive games, tracing books, and stories for children.</p>
              <div className="flex items-center gap-2">
                 <span className="px-2 py-1 bg-white rounded-md text-xs font-bold text-gray-400 border border-gray-100">Games</span>
                 <span className="px-2 py-1 bg-white rounded-md text-xs font-bold text-gray-400 border border-gray-100">Stories</span>
                 <span className="px-2 py-1 bg-white rounded-md text-xs font-bold text-gray-400 border border-gray-100">ABC</span>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Hub;
