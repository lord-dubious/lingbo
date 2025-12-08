
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Lightbulb, BookOpen, Lock, ChevronRight, CheckCircle, Trophy, Volume2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';
import { ADULT_CURRICULUM, FUN_FACTS } from '../constants';
import { playPCMAudio, playGameSound } from '../utils/audioUtils';
import { generateIgboSpeech } from '../services/geminiService';

export const AdultDashboard = () => {
  const navigate = useNavigate();
  const { activeProfile } = useUser();
  const [funFact, setFunFact] = useState(FUN_FACTS[0]);

  useEffect(() => {
    setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  }, []);

  return (
    <Layout title="Curriculum" showBack backPath="/hub">
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-orange-50 p-6 rounded-2xl border border-orange-100">
           <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Nnọ, {activeProfile?.name || 'Friend'}!</h2>
              <p className="text-gray-600 text-sm">Ready to continue your learning?</p>
           </div>
           <div className="text-4xl">{activeProfile?.avatar}</div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
           <Lightbulb size={24} className="text-blue-500 shrink-0 mt-1" />
           <div>
              <h4 className="font-bold text-blue-700 text-sm mb-1">Did You Know?</h4>
              <p className="text-blue-900 text-sm leading-relaxed">{funFact}</p>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-primary"/> Reference Materials</h3>
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

export const LessonView = () => {
  const { id } = useParams();
  const level = ADULT_CURRICULUM.find(l => l.level_id === Number(id));
  const [activeTab, setActiveTab] = useState<'vocab' | 'quiz'>('vocab');
  const [quizScore, setQuizScore] = useState(0);

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
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
             {vocabLesson.data?.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                   <img src={item.image} className="w-16 h-16 rounded-lg object-cover bg-gray-200" alt={item.english} />
                   <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-800">{item.igbo}</h4>
                      <p className="text-gray-500 text-sm">{item.english}</p>
                   </div>
                   <button onClick={async () => { const b64 = await generateIgboSpeech(item.igbo); if(b64) playPCMAudio(b64); }} className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary/20"><Volume2 size={20}/></button>
                </div>
             ))}
          </div>
       )}

       {activeTab === 'quiz' && quizLesson && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
             <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100"><Trophy className="inline mb-1 text-orange-500" size={20}/> <span className="font-bold text-orange-700">Quiz Score: {quizScore}</span></div>
             {quizLesson.activities?.map((q, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <h4 className="font-bold text-gray-800 mb-4">Q{i+1}: {q.question || q.instruction}</h4>
                   {q.quiz_type === 'multiple_choice_3_options' && (
                      <div className="space-y-2">
                         {q.options?.map(opt => (
                            <button key={opt} onClick={() => { if(opt === q.correct_answer) { playGameSound('success'); setQuizScore(s=>s+10); } else playGameSound('error'); }} className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 hover:border-primary font-medium text-gray-700">{opt}</button>
                         ))}
                      </div>
                   )}
                   {q.quiz_type === 'match_picture_to_word' && (
                      <div className="grid grid-cols-3 gap-2">
                         {q.options?.map(opt => (
                            <button key={opt} onClick={() => { if(opt === q.correct_answer) { playGameSound('success'); setQuizScore(s=>s+10); } else playGameSound('error'); }} className="aspect-square border rounded-lg overflow-hidden hover:border-primary"><img src={opt} className="w-full h-full object-cover"/></button>
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
