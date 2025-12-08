
import React, { useState, useRef } from 'react';
import { Mic } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { transcribeUserAudio, analyzePronunciation, blobToBase64 } from '../../services/geminiService';

const PronunciationCoach = () => {
   const [isRecording, setIsRecording] = useState(false);
   const [transcript, setTranscript] = useState('');
   const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
   const [targetPhrase, setTargetPhrase] = useState("Kedu ka i mere?"); 
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const chunksRef = useRef<Blob[]>([]);

   const phrases = ["Ututu ọma", "Kedu ka i mere?", "Nnọ", "Biko", "Daalu", "Aham bu Chike"];

   const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = e => chunksRef.current.push(e.data);
        mr.onstop = async () => {
           const blob = new Blob(chunksRef.current, { type: 'audio/wav' }); 
           const b64 = await blobToBase64(blob);
           const trans = await transcribeUserAudio(b64, blob.type);
           setTranscript(trans);
           const res = await analyzePronunciation(targetPhrase, trans);
           setAnalysis(res);
        };
        mr.start();
        setIsRecording(true);
        mediaRecorderRef.current = mr;
      } catch (e) {
        console.error("Mic error", e);
        alert("Microphone access denied.");
      }
   };

   const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
         mediaRecorderRef.current.stop();
         setIsRecording(false);
         mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
   };

   return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
         <div className="mb-6 text-center">
            <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Practice Phrase</h3>
            <div className="text-2xl font-bold text-gray-800 mb-4">{targetPhrase}</div>
            <div className="flex gap-2 justify-center flex-wrap">
               {phrases.map(p => (
                  <button key={p} onClick={() => { setTargetPhrase(p); setAnalysis(null); setTranscript(''); }} className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${targetPhrase === p ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{p}</button>
               ))}
            </div>
         </div>

         <div className="flex justify-center mb-8">
            <button 
               onMouseDown={startRecording} 
               onMouseUp={stopRecording} 
               onTouchStart={startRecording}
               onTouchEnd={stopRecording}
               className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${isRecording ? 'bg-red-500 scale-110 ring-8 ring-red-100' : 'bg-primary hover:bg-orange-600'}`}
            >
               <Mic size={40} className="text-white" />
            </button>
         </div>
         <p className="text-center text-gray-400 text-sm mb-6">{isRecording ? 'Listening...' : 'Hold to Speak'}</p>

         {transcript && (
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
               <div className="text-xs font-bold text-gray-400 uppercase mb-1">We heard:</div>
               <div className="text-gray-800 italic">"{transcript}"</div>
            </div>
         )}

         {analysis && (
            <div className={`p-4 rounded-xl border-l-4 ${analysis.score > 70 ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
               <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800">Feedback</h4>
                  <span className={`font-bold px-2 py-1 rounded text-sm ${analysis.score > 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{analysis.score}% Match</span>
               </div>
               <p className="text-sm text-gray-600 mb-2">{analysis.feedback}</p>
               <div className="text-xs text-gray-500">
                  <span className="font-bold">You said (Igbo):</span> {analysis.user_said_igbo}
               </div>
            </div>
         )}
      </div>
   );
};

export default PronunciationCoach;
