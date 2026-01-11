import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface WishFormProps {
  onSubmit: (wish: string) => void;
  disabled: boolean;
}

const WishForm: React.FC<WishFormProps> = ({ onSubmit, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md relative z-10 px-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 shadow-2xl">
          <Sparkles className="ml-3 text-yellow-400 w-5 h-5 animate-pulse" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder="Make a wish for 2026..."
            className="flex-1 bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 px-3 py-2 outline-none font-medium"
            maxLength={100} 
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={`p-2 rounded-md transition-colors ${
              disabled || !input.trim()
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="text-center text-slate-500 text-xs mt-2">
        Tip: Type a full sentence! We'll light it up word by word.
      </p>
    </form>
  );
};

export default WishForm;