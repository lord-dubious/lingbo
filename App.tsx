
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import IgboKeyboard from './components/IgboKeyboard';
import RequireAuth from './components/RequireAuth';
import { UserProvider } from './context/UserContext';

// Pages
import Onboarding from './pages/Onboarding';
import Hub from './pages/Hub';
import { AdultDashboard, LessonView } from './pages/Adults';
import { KidsDashboard, KidsGameMenu } from './pages/Kids';
import { FlashcardWrapper, SentenceGameWrapper, MemoryGameWrapper, SpeedGameWrapper } from './pages/KidsGames';
import TraceBook from './pages/TraceBook';
import { Library, WorkbookViewer, VideoLibrary, AlphabetBoard, NumbersBoard } from './pages/Resources';
import { SpeakPractice } from './pages/Practice';
import ProfilePage from './pages/ProfilePage';

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
          <Route path="/kids/games" element={<RequireAuth><KidsGameMenu /></RequireAuth>} /> 
          
          <Route path="/kids/game/words" element={<RequireAuth><FlashcardWrapper /></RequireAuth>} />
          <Route path="/kids/game/sentence" element={<RequireAuth><SentenceGameWrapper /></RequireAuth>} />
          <Route path="/kids/game/memory" element={<RequireAuth><MemoryGameWrapper /></RequireAuth>} />
          <Route path="/kids/game/speed" element={<RequireAuth><SpeedGameWrapper /></RequireAuth>} />
          
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
    </UserProvider>
  );
};

export default App;
