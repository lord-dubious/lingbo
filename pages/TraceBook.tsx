
import React, { useState, useEffect, useRef } from 'react';
import { Type, Pencil, ChevronRight, Volume2, Eraser, CheckCircle, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { IGBO_ALPHABET_FULL } from '../constants';
import { generateIgboSpeech, gradeHandwriting } from '../services/geminiService';
import { playPCMAudio, playGameSound } from '../utils/audioUtils';
import { ConfettiOverlay } from '../components/ConfettiOverlay';
import { useUser } from '../context/UserContext';
import TutorialOverlay from '../components/TutorialOverlay';

// --- Canvas Tracer ---
const CanvasTracer = ({ text, subtext }: { text: string, subtext?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<{ score: number, feedback: string } | null>(null);

  useEffect(() => {
    setHasDrawn(false);
    setGradeResult(null);
    setGrading(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
       canvas.width = rect.width * dpr;
       canvas.height = rect.height * dpr;
       canvas.style.width = `${rect.width}px`;
       canvas.style.height = `${rect.height}px`;
       ctx.scale(dpr, dpr);
    }

    drawTemplate(ctx, rect?.width || 300, rect?.height || 300, text);
  }, [text]);

  const drawTemplate = (ctx: CanvasRenderingContext2D, w: number, h: number, txt: string) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, h/2);
    ctx.lineTo(w-20, h/2);
    ctx.stroke();

    ctx.font = `bold ${h * 0.55}px "Fredoka", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([8, 8]);
    ctx.strokeText(txt, w/2, h/2);
    ctx.setLineDash([]); 
  };

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (gradeResult) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#3b82f6';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || gradeResult) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.closePath();
  };

  const clear = () => {
     setGradeResult(null);
     setHasDrawn(false);
     const canvas = canvasRef.current;
     if (canvas) {
       const ctx = canvas.getContext('2d');
       const rect = canvas.getBoundingClientRect();
       if (ctx) drawTemplate(ctx, rect.width, rect.height, text);
     }
  };

  const handleGrade = async () => {
      if (!canvasRef.current || !hasDrawn) return;
      setGrading(true);
      try {
          const base64 = canvasRef.current.toDataURL('image/png').split(',')[1];
          const result = await gradeHandwriting(base64, text);
          if (result) {
              setGradeResult(result);
              if (result.score > 70) playGameSound('win');
              else playGameSound('success');
          }
      } catch (e) {
          console.error(e);
      } finally {
          setGrading(false);
      }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto relative">
       {gradeResult && gradeResult.score > 80 && (
           <ConfettiOverlay 
              title="Amazing!" 
              subtitle={gradeResult.feedback} 
              onRestart={clear} 
            />
       )}
       
       {/* Added touch-none to prevent scrolling while drawing */}
       <div className="bg-white p-2 rounded-3xl shadow-xl border-4 border-blue-100 w-full aspect-[4/3] relative touch-none overflow-hidden select-none">
          <canvas 
             ref={canvasRef}
             onMouseDown={startDrawing}
             onMouseMove={draw}
             onMouseUp={stopDrawing}
             onMouseLeave={stopDrawing}
             onTouchStart={startDrawing}
             onTouchMove={draw}
             onTouchEnd={stopDrawing}
             className="w-full h-full rounded-2xl cursor-crosshair bg-white touch-none"
          />
          
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button onClick={clear} className="p-3 bg-gray-100 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors shadow-sm active:scale-90" title="Clear">
                <Eraser size={24} />
            </button>
          </div>

          {grading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in z-20">
                  <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                  <p className="font-kids font-bold text-xl text-blue-600">Checking...</p>
              </div>
          )}

          {gradeResult && gradeResult.score <= 80 && (
              <div className="absolute inset-x-0 bottom-0 bg-white/95 p-4 border-t-2 border-yellow-100 animate-in slide-in-from-bottom z-20">
                  <div className="flex items-center gap-3">
                      <div className="text-3xl">💪</div>
                      <div>
                          <p className="font-bold text-gray-800">{gradeResult.feedback}</p>
                          <button onClick={clear} className="text-blue-500 font-bold text-sm mt-1">Try Again</button>
                      </div>
                  </div>
              </div>
          )}
       </div>

       <div className="w-full flex justify-between items-center mt-6 px-2">
           <div>
               {subtext && <p className="font-bold text-gray-400 text-lg">{subtext}</p>}
           </div>
           
           <button 
             onClick={handleGrade}
             disabled={!hasDrawn || grading || !!gradeResult}
             className={`
                flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all active:scale-95
                ${hasDrawn && !gradeResult 
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-200' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
             `}
           >
              {grading ? 'Checking...' : (gradeResult ? 'Done' : 'Check')}
              {!grading && !gradeResult && <CheckCircle size={24} />}
           </button>
       </div>
    </div>
  );
};

const TraceBook = () => {
  const [mode, setMode] = useState<'letters' | 'sentences' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { activeProfile, markTutorialSeen } = useUser();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (activeProfile && (!activeProfile.progress?.tutorialsSeen?.includes('trace_book'))) {
        setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
      setShowTutorial(false);
      markTutorialSeen('trace_book');
  };

  const letters = IGBO_ALPHABET_FULL;
  const sentences = [
    { text: "Nno", meaning: "Welcome" },
    { text: "Eke", meaning: "Python" },
    { text: "Ulo", meaning: "House" },
    { text: "Biko", meaning: "Please" },
    { text: "Mmiri", meaning: "Water" }
  ];

  const currentItem = mode === 'letters' ? letters[currentIndex] : sentences[currentIndex]?.text;
  const currentMeaning = mode === 'sentences' ? sentences[currentIndex]?.meaning : `Letter ${currentItem}`;

  const handleNext = () => {
    if (mode === 'letters') setCurrentIndex(prev => (prev + 1) % letters.length);
    else setCurrentIndex(prev => (prev + 1) % sentences.length);
  };

  const handlePrev = () => {
    if (mode === 'letters') setCurrentIndex(prev => (prev - 1 + letters.length) % letters.length);
    else setCurrentIndex(prev => (prev - 1 + sentences.length) % sentences.length);
  };

  if (!mode) {
    return (
      <Layout title="Trace Book" showBack backPath="/kids" isKidsMode hideBottomNav>
         <div className="grid gap-6 p-4 animate-in slide-in-from-bottom-4">
            <button onClick={() => setMode('letters')} className="bg-purple-400 p-8 rounded-3xl border-b-8 border-purple-600 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center gap-4 group">
               <div className="bg-white/20 p-4 rounded-2xl group-hover:rotate-6 transition-transform"><Type size={48} className="text-white"/></div>
               <span className="font-kids font-bold text-3xl text-white">ABC Letters</span>
               <span className="text-purple-100 font-bold">Learn the Alphabet</span>
            </button>
            <button onClick={() => setMode('sentences')} className="bg-pink-400 p-8 rounded-3xl border-b-8 border-pink-600 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center gap-4 group">
               <div className="bg-white/20 p-4 rounded-2xl group-hover:-rotate-6 transition-transform"><Pencil size={48} className="text-white"/></div>
               <span className="font-kids font-bold text-3xl text-white">Igbo Words</span>
               <span className="text-pink-100 font-bold">Write simple words</span>
            </button>
         </div>
      </Layout>
    );
  }

  return (
    <Layout title={mode === 'letters' ? 'Trace Letters' : 'Trace Words'} showBack onBack={() => setMode(null)} isKidsMode hideBottomNav>
       {showTutorial && (
           <TutorialOverlay 
               type="trace" 
               message="Trace the letters on the screen with your finger!" 
               onComplete={handleTutorialComplete} 
           />
       )}
       <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full max-w-lg px-2">
             <button onClick={handlePrev} className="p-4 bg-white rounded-2xl shadow-sm border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 text-gray-400 hover:text-blue-500 transition-all"><ChevronRight className="rotate-180" size={32}/></button>
             
             <button 
                onClick={() => generateIgboSpeech(currentItem).then(b => b && playPCMAudio(b))}
                className="flex flex-col items-center group active:scale-95 transition-transform"
             >
                 <div className="text-6xl font-kids font-bold text-gray-700 mb-1">{currentItem}</div>
                 <div className="flex items-center gap-1 text-blue-500 text-sm font-bold bg-blue-50 px-2 py-1 rounded-lg">
                    <Volume2 size={14} /> Listen
                 </div>
             </button>

             <button onClick={handleNext} className="p-4 bg-white rounded-2xl shadow-sm border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 text-gray-400 hover:text-blue-500 transition-all"><ChevronRight size={32}/></button>
          </div>
          
          <CanvasTracer text={currentItem} subtext={currentMeaning} />
          
          <div className="text-center text-gray-400 font-bold text-sm bg-gray-100 px-4 py-2 rounded-full">
             {currentIndex + 1} / {mode === 'letters' ? letters.length : sentences.length}
          </div>
       </div>
    </Layout>
  );
};

export default TraceBook;
