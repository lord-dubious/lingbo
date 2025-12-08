
import React, { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ArrowLeft, ChevronRight, PlayCircle, X, Book } from 'lucide-react';
import Layout from '../components/Layout';
import { LIBRARY_BOOKS, WORKBOOKS, VIDEO_RESOURCES } from '../constants';
import { useUser } from '../context/UserContext';
import { VideoResource, BookResource } from '../types';

export const Library = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'books' | 'workbooks'>('books');
  const [readingBook, setReadingBook] = useState<BookResource | null>(null);
  const { activeProfile } = useUser();
  const isKid = activeProfile?.type === 'kid';
  
  return (
    <Layout title="Library" showBack backPath={isKid ? "/kids" : "/hub"} isKidsMode={isKid} hideBottomNav={isKid}>
      <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
        <button onClick={() => setActiveTab('books')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${activeTab === 'books' ? 'bg-white shadow text-primary' : ''}`}>Story Books</button>
        <button onClick={() => setActiveTab('workbooks')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${activeTab === 'workbooks' ? 'bg-white shadow text-primary' : ''}`}>Workbooks</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activeTab === 'books' ? LIBRARY_BOOKS.map((book, i) => (
          <button key={i} onClick={() => setReadingBook(book)} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-lg transition-all text-left group">
             <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
               <img src={book.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={book.title}/>
               <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Book className="text-white drop-shadow-md" size={32} />
               </div>
             </div>
             <div>
               <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{book.title}</h4>
               <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{book.type}</span>
             </div>
          </button>
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

      {readingBook && createPortal(
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in duration-300 relative">
                  <button onClick={() => setReadingBook(null)} className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
                  
                  <div className="bg-orange-50 p-6 border-b border-orange-100">
                      <h2 className="text-2xl font-bold text-gray-800">{readingBook.title}</h2>
                      <p className="text-gray-500 text-sm">Interactive Story</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 font-serif text-lg leading-relaxed text-gray-700">
                      <div className="float-left w-1/3 mr-6 mb-4 rounded-xl overflow-hidden shadow-md">
                          <img src={readingBook.cover} className="w-full h-auto" />
                      </div>
                      <p className="mb-4">Once upon a time in a small village in Igboland, there lived a very clever tortoise named Mbe.</p>
                      <p className="mb-4">One day, Mbe decided he wanted to be the wisest creature in the whole world. He began to collect all the wisdom he could find and put it into a gourd (calabash).</p>
                      <p className="mb-4">"If I have all the wisdom," he thought, "I will be king!"</p>
                      <p className="mb-4">He traveled far and wide, asking elders for proverbs, watching how farmers planted yams, and learning the songs of the birds.</p>
                      <p className="italic text-gray-400 mt-8 text-center text-sm">To be continued...</p>
                  </div>

                  <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50">
                      <button className="text-gray-400 font-bold px-4 py-2 hover:bg-gray-200 rounded-lg" disabled>Previous</button>
                      <button className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-600 shadow-md">Next Page</button>
                  </div>
              </div>
          </div>,
          document.body
      )}

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
  const { activeProfile } = useUser();
  const isKid = activeProfile?.type === 'kid';
  
  return (
    <Layout title="Videos" showBack backPath={isKid ? "/kids" : "/hub"} isKidsMode={isKid} hideBottomNav={isKid}>
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
