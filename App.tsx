
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import IgboKeyboard from './components/IgboKeyboard';
import RequireAuth from './components/RequireAuth';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import Onboarding from './pages/Onboarding';
import Hub from './pages/Hub';
import { AdultDashboard, LessonView } from './pages/Adults';
import { KidsDashboard, KidsGameMenu } from './pages/Kids';
import TraceBook from './pages/TraceBook';
import { AlphabetBoard, NumbersBoard } from './pages/ReferenceTools';
import { Library, WorkbookViewer, VideoLibrary } from './pages/MediaLibrary';
import { SpeakPractice } from './pages/Practice';
import ProfilePage from './pages/ProfilePage';

// Games
import WordFlash from './components/games/WordFlash';
import SentencePuzzle from './components/games/SentencePuzzle';
import MemoryMatch from './components/games/MemoryMatch';
import SpeedTap from './components/games/SpeedTap';

const App = () => {
  return (
    <UserProvider>
      <ToastProvider>
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
            <Route path="/kids/games" element={<RequireAuth><KidsGameMenu /></RequireAuth>} /> 
            
            <Route path="/kids/game/words" element={<RequireAuth><WordFlash /></RequireAuth>} />
            <Route path="/kids/game/sentence" element={<RequireAuth><SentencePuzzle /></RequireAuth>} />
            <Route path="/kids/game/memory" element={<RequireAuth><MemoryMatch /></RequireAuth>} />
            <Route path="/kids/game/speed" element={<RequireAuth><SpeedTap /></RequireAuth>} />
            
            <Route path="/kids/trace" element={<RequireAuth><TraceBook /></RequireAuth>} />
            
            {/* Shared Features */}
            <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
            <Route path="/library/workbook/:id" element={<RequireAuth><WorkbookViewer /></RequireAuth>} />
            <Route path="/videos" element={<RequireAuth><VideoLibrary /></RequireAuth>} />
            <Route path="/practice" element={<RequireAuth><SpeakPractice /></RequireAuth>} />
            <Route path="/alphabet" element={<RequireAuth><AlphabetBoard /></RequireAuth>} />
            <Route path="/numbers" element={<RequireAuth><NumbersBoard /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            
            <Route path="*" element={<Navigate to="/hub" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </UserProvider>
  );
};

export default App;
