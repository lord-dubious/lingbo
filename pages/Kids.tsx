
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gamepad2, 
  PlayCircle, 
  Mic, 
  Image as ImageIcon,
  Type,
  Hash,
  Pencil,
  Puzzle,
  Sparkles,
  Timer,
  Play
} from 'lucide-react';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';

// --- Kids Dashboard ---
export const KidsDashboard = () => {
  const navigate = useNavigate();
  const { activeProfile } = useUser();

  const menu = [
    { label: "Words", sub: "Flashcards", icon: ImageIcon, bg: "bg-pink-400", border: "border-pink-600", path: "/kids/game/words" },
    { label: "Games", sub: "Play Time", icon: Gamepad2, bg: "bg-blue-400", border: "border-blue-600", path: "/kids/games" },
    { label: "Write", sub: "Trace Book", icon: Pencil, bg: "bg-orange-400", border: "border-orange-600", path: "/kids/trace" }, 
    { label: "ABC", sub: "Alphabet", icon: Type, bg: "bg-green-400", border: "border-green-600", path: "/alphabet" },
    { label: "123", sub: "Numbers", icon: Hash, bg: "bg-yellow-400", border: "border-yellow-600", path: "/numbers" },
    { label: "Watch", sub: "Videos", icon: PlayCircle, bg: "bg-red-400", border: "border-red-600", path: "/videos" },
  ];

  return (
    <Layout title="Kids Corner" showBack backPath="/hub" isKidsMode hideBottomNav>
       <div className="flex flex-col items-center pb-8">
          {/* Big Greeting */}
          <div className="w-full bg-white/60 backdrop-blur-sm p-4 rounded-3xl mb-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 border-2 border-white/50 shadow-sm">
             <div className="text-5xl drop-shadow-sm animate-bounce-slow">{activeProfile?.avatar || '🐻'}</div>
             <div>
                <h2 className="font-kids font-bold text-3xl text-gray-800 tracking-wide">Hi, {activeProfile?.name}!</h2>
                <p className="font-bold text-gray-500 text-sm">What do you want to do?</p>
             </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
             {menu.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className={`
                    ${item.bg} aspect-square rounded-3xl relative overflow-hidden
                    border-b-8 ${item.border} active:border-b-0 active:translate-y-2
                    transition-all group flex flex-col items-center justify-center gap-2
                    shadow-xl hover:brightness-105
                  `}
                >
                   {/* Background pattern */}
                   <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full" />
                   <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full" />
                   
                   <div className="relative z-10 p-2 group-hover:scale-110 transition-transform duration-300 ease-out">
                     <item.icon size={56} className="text-white drop-shadow-md" />
                   </div>
                   <div className="text-center z-10">
                       <span className="block font-kids font-bold text-2xl text-white drop-shadow-sm tracking-wide leading-none">{item.label}</span>
                       <span className="block text-xs font-bold text-white/90 uppercase tracking-wider mt-1">{item.sub}</span>
                   </div>
                </button>
             ))}
          </div>
       </div>
    </Layout>
  );
};

// --- Kids Game Menu (Fixes missing route) ---
export const KidsGameMenu = () => {
  const navigate = useNavigate();
  const games = [
      { title: "Sentence Puzzle", icon: Puzzle, color: "bg-orange-400", border: "border-orange-600", path: "/kids/game/sentence" },
      { title: "Memory Match", icon: Sparkles, color: "bg-cyan-400", border: "border-cyan-600", path: "/kids/game/memory" },
      { title: "Speed Tap", icon: Timer, color: "bg-indigo-400", border: "border-indigo-600", path: "/kids/game/speed" },
      { title: "Word Flash", icon: ImageIcon, color: "bg-pink-400", border: "border-pink-600", path: "/kids/game/words" }
  ];

  return (
      <Layout title="Games" showBack backPath="/kids" isKidsMode hideBottomNav>
          <div className="space-y-4 p-2 animate-in slide-in-from-right-4 duration-300">
              {games.map((g, i) => (
                  <button
                      key={i}
                      onClick={() => navigate(g.path)}
                      className={`
                          w-full ${g.color} rounded-3xl p-6
                          border-b-8 ${g.border} active:border-b-0 active:translate-y-2
                          transition-all flex items-center gap-6 shadow-lg group
                      `}
                  >
                      <div className="bg-white/25 p-4 rounded-2xl group-hover:rotate-12 transition-transform">
                          <g.icon size={32} className="text-white" />
                      </div>
                      <div className="text-left flex-1">
                          <h3 className="font-kids font-bold text-2xl text-white">{g.title}</h3>
                          <p className="text-white/80 font-bold text-sm">Tap to play!</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full">
                          <Play size={24} className="text-white fill-white" />
                      </div>
                  </button>
              ))}
          </div>
      </Layout>
  );
};
