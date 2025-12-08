
import React from 'react';
import Layout from '../components/Layout';
import { IGBO_ALPHABET_FULL, IGBO_NUMBERS } from '../constants';
import { playPCMAudio } from '../utils/audioUtils';
import { generateIgboSpeech } from '../services/geminiService';
import { useUser } from '../context/UserContext';

export const AlphabetBoard = () => {
  const { activeProfile } = useUser();
  const isKid = activeProfile?.type === 'kid';

  return (
    <Layout title="Abidii (Alphabet)" showBack backPath={isKid ? "/kids" : "/hub"} isKidsMode={isKid} hideBottomNav={isKid}>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {IGBO_ALPHABET_FULL.map((char) => (
          <button
            key={char}
            onClick={async () => {
               const b64 = await generateIgboSpeech(char);
               if (b64) playPCMAudio(b64);
            }}
            className="aspect-square bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl font-bold text-gray-700 hover:bg-primary hover:text-white hover:scale-105 transition-all"
          >
            {char}
          </button>
        ))}
      </div>
    </Layout>
  );
};

export const NumbersBoard = () => {
  const { activeProfile } = useUser();
  const isKid = activeProfile?.type === 'kid';

  return (
    <Layout title="Onuogugu (Numbers)" showBack backPath={isKid ? "/kids" : "/hub"} isKidsMode={isKid} hideBottomNav={isKid}>
      <div className="grid grid-cols-2 gap-4">
        {IGBO_NUMBERS.map((item) => (
          <button
            key={item.number}
            onClick={async () => {
               const b64 = await generateIgboSpeech(item.word);
               if (b64) playPCMAudio(b64);
            }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-primary transition-all group"
          >
            <span className="text-3xl font-bold text-blue-500 group-hover:scale-110 transition-transform">{item.number}</span>
            <span className="font-bold text-gray-700 text-lg">{item.word}</span>
          </button>
        ))}
      </div>
    </Layout>
  );
};
