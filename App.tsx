import React, { useState, useRef, useEffect } from 'react';
import FireworkCanvas, { FireworkCanvasHandle } from './components/FireworkCanvas';
import SnowCanvas from './components/SnowCanvas';
import WishForm from './components/WishForm';
import FortuneDisplay from './components/FortuneDisplay';
import { generateFortune } from './services/geminiService';
import { Star } from 'lucide-react';

const App: React.FC = () => {
  const fireworkRef = useRef<FireworkCanvasHandle>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fortune, setFortune] = useState<string>('');
  const [showFortune, setShowFortune] = useState(false);
  const [wishText, setWishText] = useState('');

  // Auto-launch welcome fireworks sequence
  useEffect(() => {
    const sequence = ['2026', '祝：', '小宝', '健康', '快乐', '顺利毕业！'];
    const timeoutIds: NodeJS.Timeout[] = [];

    sequence.forEach((text, index) => {
      // Stagger them: first one at 800ms, then every 2200ms to allow previous one to bloom
      const delay = 800 + (index * 2200);
      const id = setTimeout(() => {
        if (fireworkRef.current) {
          fireworkRef.current.launch(text);
        }
      }, delay);
      timeoutIds.push(id);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  const handleWishSubmit = async (wish: string) => {
    setIsLoading(true);
    setWishText(wish);
    setFortune('');
    setShowFortune(false);

    // 1. Launch the firework immediately for instant feedback
    if (fireworkRef.current) {
      fireworkRef.current.launch(wish);
    }

    // 2. Fetch the fortune in the background
    try {
      const generatedFortune = await generateFortune(wish);
      setFortune(generatedFortune);
    } catch (e) {
      setFortune("May your 2026 be as bright as these fireworks.");
    } finally {
      setIsLoading(false);
    }
  };

  // Callback from Canvas when the rocket explodes (approximately 1-1.5s after launch)
  const handleExplosion = () => {
    // Reveal fortune shortly after explosion if we have one ready
    if (fortune) {
      setTimeout(() => {
        setShowFortune(true);
      }, 500);
    } else if (isLoading) {
      // If still loading when exploded, wait for loading to finish then show
    }
  };

  // Watch for fortune readiness if explosion happened while loading
  useEffect(() => {
    if (!isLoading && fortune && wishText) {
       const timer = setTimeout(() => setShowFortune(true), 1500); 
       return () => clearTimeout(timer);
    }
  }, [isLoading, fortune, wishText]);


  const handleReset = () => {
    setShowFortune(false);
    setWishText('');
    setFortune('');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-slate-900">
      
      {/* Background Visuals */}
      {/* Snow sits at the bottom layer (z-0) */}
      <SnowCanvas />
      {/* Fireworks sits on top of snow (z-10), with transparency for trails */}
      <FireworkCanvas ref={fireworkRef} onExplode={handleExplosion} />
      
      {/* Header / Brand */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 pointer-events-none">
        <div className="flex items-center space-x-2">
          <Star className="text-yellow-400 fill-yellow-400 w-6 h-6 animate-spin-slow" />
          <span className="text-white font-cinzel text-xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            NYE 2026
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full z-20 p-4 transition-all duration-500">
        
        {/* Title Section - Fades out when fortune is shown to reduce clutter */}
        <div className={`text-center mb-12 transition-opacity duration-500 ${showFortune ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
          <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-200 to-purple-400 drop-shadow-2xl mb-4">
            Happy New Year
          </h1>
          <p className="text-purple-200/70 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto">
            Ignite your dreams for 2026. <br/>
            Type your wish and watch it light up the sky.
          </p>
        </div>

        {/* Wish Input */}
        <div className={`transition-all duration-500 transform ${showFortune ? 'scale-90 opacity-0 translate-y-10 pointer-events-none' : 'scale-100 opacity-100'}`}>
          <WishForm onSubmit={handleWishSubmit} disabled={isLoading} />
        </div>

      </main>

      {/* Fortune Overlay */}
      <FortuneDisplay 
        fortune={fortune} 
        isVisible={showFortune} 
        onReset={handleReset} 
      />

      {/* Footer */}
      <footer className="absolute bottom-2 w-full text-center text-slate-600 text-[10px] z-20 font-mono pointer-events-none">
        POWERED BY GEMINI 3 FLASH • 2026 EDITION
      </footer>
    </div>
  );
};

export default App;