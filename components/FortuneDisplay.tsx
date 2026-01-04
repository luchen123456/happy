import React from 'react';

interface FortuneDisplayProps {
  fortune: string;
  isVisible: boolean;
  onReset: () => void;
}

const FortuneDisplay: React.FC<FortuneDisplayProps> = ({ fortune, isVisible, onReset }) => {
  if (!isVisible && !fortune) return null;

  return (
    <div
      className={`fixed bottom-10 left-0 right-0 z-20 flex justify-center items-end px-6 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-2xl w-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.3)] text-center relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500 rounded-full blur-[50px] opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-pink-500 rounded-full blur-[50px] opacity-20"></div>

        <h3 className="font-cinzel text-xl text-purple-300 mb-4 tracking-widest uppercase">
          2026 Oracle Prediction
        </h3>
        
        <p className="text-lg md:text-xl text-white font-light leading-relaxed italic">
          "{fortune}"
        </p>

        <button
          onClick={onReset}
          className="mt-6 px-6 py-2 rounded-full border border-slate-600 text-slate-300 hover:text-white hover:border-white hover:bg-white/5 transition-all text-sm uppercase tracking-wider"
        >
          Make Another Wish
        </button>
      </div>
    </div>
  );
};

export default FortuneDisplay;
