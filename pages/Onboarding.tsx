
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const { addProfile } = useUser();
  const navigate = useNavigate();

  const handleFinish = () => {
    if (name.trim()) {
      addProfile(name, 'adult');
      navigate('/hub');
    }
  };

  const slides = [
    { 
      title: "Nnọ! Welcome", 
      subtitle: "A language for generations.",
      desc: "Your journey to mastering the Igbo Language starts here", 
      image: "/assets/images/lingbo_logo_main.png"
    },
    { 
      title: "Learn Naturally", 
      subtitle: "",
      desc: "Discover the language through stories, everyday words, and gentle practice. Learn The Igbo Way.", 
      icon: "🌿",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    { 
      title: "Your Name", 
      subtitle: "",
      desc: "Let's personalize your experience.", 
      icon: "👋",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      isInput: true 
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center relative">
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="absolute top-6 left-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          {slides[step].image ? (
            <img src={slides[step].image} alt="Lingbo" className="w-48 h-48 object-contain mx-auto animate-in zoom-in duration-500" />
          ) : (
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${slides[step].iconBg} ${slides[step].iconColor} mx-auto animate-in zoom-in duration-500 shadow-lg`}>
              <div className="text-6xl">{slides[step].icon}</div>
            </div>
          )}
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slides[step].title}</h2>
        {slides[step].subtitle && <h3 className="text-lg text-primary font-medium mb-4">{slides[step].subtitle}</h3>}
        <p className="text-gray-500 text-lg mb-8 max-w-xs mx-auto">{slides[step].desc}</p>

        {slides[step].isInput && (
          <div className="w-full mb-8 animate-in slide-in-from-bottom-8 delay-100">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-gray-600 text-white font-bold placeholder:text-gray-300 text-center text-xl outline-none focus:ring-4 focus:ring-primary/30 shadow-lg transition-all"
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-sm mt-auto">
        {step < 2 ? (
          <button onClick={() => setStep(step + 1)} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors text-lg shadow-lg hover:shadow-xl shadow-orange-200">
            Next
          </button>
        ) : (
          <button onClick={handleFinish} disabled={!name.trim()} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-lg hover:shadow-xl shadow-orange-200">
            Get Started
          </button>
        )}
        <div className="flex gap-2 justify-center mt-8">
          {slides.map((_, i) => (
             <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
