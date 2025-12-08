
import React, { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ArrowLeft, ChevronRight, PlayCircle, X } from 'lucide-react';
import Layout from '../components/Layout';
import { IGBO_ALPHABET_FULL, IGBO_NUMBERS, LIBRARY_BOOKS, WORKBOOKS, VIDEO_RESOURCES } from '../constants';
import { playPCMAudio } from '../utils/audioUtils';
import { generateIgboSpeech } from '../services/geminiService';
import { VideoResource } from '../types';

export const AlphabetBoard = () => {
  return (
    <Layout title="Abidii (Alphabet)" showBack>
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
  return (
    <Layout title="Onuogugu (Numbers)" showBack>
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

export const Library = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'books' | 'workbooks'>('books');
  
  return (
    <Layout title="Library" showBack>
      <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
        <button onClick={() => setActiveTab('books')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${activeTab === 'books' ? 'bg-white shadow text-primary' : ''}`}>Story Books</button>
        <button onClick={() => setActiveTab('workbooks')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${activeTab === 'workbooks' ? 'bg-white shadow text-primary' : ''}`}>Workbooks</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activeTab === 'books' ? LIBRARY_BOOKS.map((book, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3">
             <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
               <img src={book.cover} className="w-full h-full object-cover" alt={book.title}/>
             </div>
             <div>
               <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{book.title}</h4>
               <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{book.type}</span>
             </div>
          </div>
        )) : WORKBOOKS.map((wb) => (
          <button key={wb.id} onClick={() => navigate(`/library/workbook/${wb.id}`)} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3 text-left hover:shadow-md transition-all">
             <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
               <img src={wb.cover} className="w-full h-full object-cover" alt={wb.title}/>
               <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">NEW</div>
             </div>
             <div>
               <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{wb.title}</h4>
               <p className="text-xs text-gray-400">{wb.pages} Pages</p>
             </div>
          </button>
        ))}
      </div>
    </Layout>
  );
};

export const WorkbookViewer = () => {
  const { id } = useParams();
  const book = WORKBOOKS.find(w => w.id === id);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  if (!book) return <Navigate to="/library" />;

  return (
     <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        <div className="flex justify-between items-center p-4 text-white">
           <button onClick={() => navigate(-1)}><ArrowLeft /></button>
           <span className="font-bold">{book.title}</span>
           <span className="text-sm text-gray-400">{page} / {book.pages}</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-800 relative">
           <div className="w-full max-w-md aspect-[3/4] bg-white rounded shadow-lg flex items-center justify-center relative overflow-hidden">
              {/* Simulated Page Content */}
              <div className="text-center p-8">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">Page {page}</h2>
                 <p className="text-gray-500">This is a simulated view of the workbook content.</p>
                 <div className="mt-8 border-2 border-dashed border-gray-300 h-64 w-full rounded flex items-center justify-center text-gray-300">Content Placeholder</div>
              </div>
           </div>
           {page > 1 && <button onClick={() => setPage(p => p - 1)} className="absolute left-4 p-4 bg-black/50 rounded-full text-white hover:bg-black/70"><ChevronRight className="rotate-180" /></button>}
           {page < book.pages && <button onClick={() => setPage(p => p + 1)} className="absolute right-4 p-4 bg-black/50 rounded-full text-white hover:bg-black/70"><ChevronRight /></button>}
        </div>
     </div>
  );
};

export const VideoLibrary = () => {
  const [playingVideo, setPlayingVideo] = useState<VideoResource | null>(null);
  
  return (
    <Layout title="Videos" showBack>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {VIDEO_RESOURCES.map((v) => (
           <button onClick={() => setPlayingVideo(v)} key={v.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-4 text-left hover:shadow-md transition-all group">
             <div className="w-32 aspect-video bg-gray-200 rounded-lg relative overflow-hidden">
               <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30"><PlayCircle className="text-white drop-shadow-md"/></div>
             </div>
             <div><h4 className="font-bold text-sm text-gray-800 mb-1">{v.title}</h4><span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{v.duration}</span></div>
           </button>
         ))}
       </div>
       {playingVideo && createPortal(
         <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4" onClick={() => setPlayingVideo(null)}>
           <div className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1`} title={playingVideo.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
             <button onClick={() => setPlayingVideo(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors"><X size={24}/></button>
           </div>
           <h3 className="text-white font-bold text-xl mt-4">{playingVideo.title}</h3>
         </div>,
         document.body
       )}
    </Layout>
  );
};
