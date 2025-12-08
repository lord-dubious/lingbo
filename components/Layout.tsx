
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, User, Bell, Home, BookOpen, Mic, Library, ChevronLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backPath?: string; // Explicit back path
  onBack?: () => void; // Custom back handler
  isKidsMode?: boolean;
  hideBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBack = false, 
  backPath,
  onBack,
  isKidsMode = false, 
  hideBottomNav = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (showBack) {
      if (onBack) {
        onBack();
      } else if (backPath) {
        navigate(backPath);
      } else {
        navigate(-1);
      }
    }
  };

  // Helper to determine active tab
  const getActiveTab = (path: string) => {
    if (path === '/' || path.startsWith('/home')) return 'home';
    if (path.startsWith('/adults')) return 'learn';
    if (path.startsWith('/practice')) return 'practice';
    if (path.startsWith('/library')) return 'library';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab(location.pathname);
  const LOGO_URL = "/assets/images/lingbo_logo_main.png";

  return (
    <div className={`min-h-screen ${isKidsMode ? 'bg-yellow-50' : 'bg-gray-50'} font-sans transition-colors duration-300 pb-[env(safe-area-inset-bottom)]`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${isKidsMode ? 'bg-yellow-400' : 'bg-white'} shadow-sm px-4 py-3 flex items-center justify-between transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          {/* Back Button for Adults (Top Left) */}
          {showBack && !isKidsMode && (
            <button onClick={handleBack} className="p-2 hover:bg-black/5 rounded-full transition-colors" aria-label="Go Back">
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
          )}
          
          <Link to="/" className="flex items-center gap-3 group">
            {(!showBack || isKidsMode) && (
              <img 
                src={LOGO_URL} 
                alt="Lingbo Logo" 
                className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('fallback-logo');
                }}
              />
            )}
            <h1 className={`font-bold text-lg ${isKidsMode ? 'font-kids text-blue-700 tracking-wide' : 'text-gray-800'}`}>
              {title || 'Lingbo'}
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {!isKidsMode && <Bell size={20} className="text-gray-500 hover:text-primary cursor-pointer transition-colors" />}
          <Link to="/profile" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 hover:border-primary transition-colors">
             <User size={18} className="text-gray-500" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className={`w-full max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto p-4 md:p-6 animate-in fade-in duration-300 ${(!isKidsMode && !hideBottomNav) ? 'pb-28' : 'pb-6'}`}>
        {children}
      </main>

      {/* Kids Mode: Bottom-Left Back Button (Accessible) */}
      {isKidsMode && showBack && (
        <button 
          onClick={handleBack}
          className="fixed bottom-6 left-6 z-50 bg-white border-4 border-yellow-300 text-yellow-600 rounded-full p-4 shadow-xl hover:scale-110 active:scale-90 transition-transform"
          aria-label="Back"
        >
          <ChevronLeft size={32} strokeWidth={3} />
        </button>
      )}

      {/* Adult Mode: Bottom Navigation */}
      {!isKidsMode && !hideBottomNav && (
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))] px-4 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto grid grid-cols-5 items-end">
            
            <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-gray-400'} hover:text-primary`}>
              <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            
            <Link to="/adults" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'learn' ? 'text-primary' : 'text-gray-400'} hover:text-primary`}>
              <BookOpen size={24} strokeWidth={activeTab === 'learn' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Learn</span>
            </Link>

            <Link to="/practice" className="relative flex flex-col items-center group">
               <div className={`absolute -top-10 p-3.5 rounded-full shadow-lg border-4 border-gray-50 transition-all active:scale-95 group-hover:scale-105 group-hover:-translate-y-1
                 ${activeTab === 'practice' 
                   ? 'bg-primary text-white shadow-orange-200 ring-4 ring-orange-100' 
                   : 'bg-white text-gray-400 border-gray-100 group-hover:text-primary group-hover:border-primary/20'
                 }`}>
                 <Mic size={28} strokeWidth={activeTab === 'practice' ? 2.5 : 2} />
               </div>
               <div className="h-6"></div> 
               <span className={`text-[10px] font-medium mt-1 transition-colors ${activeTab === 'practice' ? 'text-primary' : 'text-gray-400'}`}>
                 Tutor
               </span>
            </Link>

             <Link to="/library" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'library' ? 'text-primary' : 'text-gray-400'} hover:text-primary`}>
              <Library size={24} strokeWidth={activeTab === 'library' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Library</span>
            </Link>

            <Link to="/profile" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-gray-400'} hover:text-primary`}>
              <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Profile</span>
            </Link>

          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
