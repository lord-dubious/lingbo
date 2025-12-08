
import React, { useState } from 'react';
import Layout from '../components/Layout';
import TextChat from '../components/practice/TextChat';
import LiveChat from '../components/practice/LiveChat';
import PronunciationCoach from '../components/practice/PronunciationCoach';

export const SpeakPractice = () => {
  const [tab, setTab] = useState('chat');
  return (
    <Layout title="AI Tutor" showBack>
      <div className="flex bg-gray-200 p-1 rounded-xl mb-4">
        <button onClick={()=>setTab('chat')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${tab==='chat'?'bg-white shadow text-primary':''}`}>Chat</button>
        <button onClick={()=>setTab('live')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${tab==='live'?'bg-white shadow text-primary':''}`}>Live</button>
        <button onClick={()=>setTab('coach')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${tab==='coach'?'bg-white shadow text-primary':''}`}>Coach</button>
      </div>
      {tab==='chat'&&<TextChat/>}
      {tab==='live'&&<LiveChat/>}
      {tab==='coach'&&<PronunciationCoach/>}
    </Layout>
  );
};
