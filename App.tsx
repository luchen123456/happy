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

  // Helper function to segment text into firework-friendly chunks
  // Strategy: Keep phrases together unless they are too long.
  const segmentText = (text: string): string[] => {
    const cleanText = text.trim();
    if (!cleanText) return [];

    // 1. Split by natural delimiters (punctuation)
    // We treat newlines, commas, periods, etc. as hard stops.
    const rawChunks = cleanText.split(/[,，。.!！?？;；\n]+/).map(t => t.trim()).filter(Boolean);

    const finalSegments: string[] = [];

    for (const chunk of rawChunks) {
      // Calculate a "weight" for length: standard chars=1, wide chars (CJK)=2
      // This approximates visual width better than plain length.
      let weight = 0;
      for (let i = 0; i < chunk.length; i++) {
        weight += chunk.charCodeAt(i) > 255 ? 2 : 1;
      }

      // Thresholds:
      // Short phrase (approx 7 Chinese chars or ~14 English letters) -> Keep together
      // Examples that fit: "Happy New Year", "2026新年快乐", "身体健康万事如意"
      if (weight <= 16) {
        finalSegments.push(chunk);
        continue;
      }

      // If longer, we try to split intelligently but keep groups as large as possible
      if (chunk.includes(' ')) {
        // Assume English/Space-separated structure: split by words, group into phrases
        const words = chunk.split(/\s+/);
        let buffer = "";
        for (const word of words) {
            const temp = buffer ? `${buffer} ${word}` : word;
            // Allow roughly 18 chars for English sub-phrases
            if (temp.length > 18) { 
                if (buffer) finalSegments.push(buffer);
                buffer = word;
            } else {
                buffer = temp;
            }
        }
        if (buffer) finalSegments.push(buffer);
      } else {
        // Assume Chinese/Continuous text
        const IntlAny = Intl as any;
        if (typeof IntlAny !== 'undefined' && IntlAny.Segmenter) {
            const segmenter = new IntlAny.Segmenter('zh', { granularity: 'word' });
            const segments = Array.from(segmenter.segment(chunk)).map((s: any) => s.segment);
            let buffer = "";
            for (const seg of segments) {
                // Check weight of potential new buffer
                const segWeight = seg.split('').reduce((a: number, c: string) => a + (c.charCodeAt(0) > 255 ? 2 : 1), 0);
                const bufferWeight = buffer.split('').reduce((a: number, c: string) => a + (c.charCodeAt(0) > 255 ? 2 : 1), 0);
                
                // Group up to weight ~12 (approx 6 Chinese chars) for sub-segments
                if (bufferWeight + segWeight > 12) { 
                    if (buffer) finalSegments.push(buffer);
                    buffer = seg;
                } else {
                    buffer += buffer ? seg : seg; 
                }
            }
            if (buffer) finalSegments.push(buffer);
        } else {
            // Fallback: fixed width split if no segmenter available
             for(let i=0; i<chunk.length; i+=5) {
                 finalSegments.push(chunk.slice(i, i+5));
             }
        }
      }
    }

    return finalSegments;
  };

  const launchSequence = (words: string[]) => {
    words.forEach((word, index) => {
      // 1.8s interval allows for overlapping fireworks
      // (Rocket flight ~1s + Explosion life ~3s = ~4s total visibility)
      const delay = index * 1800; 
      setTimeout(() => {
        if (fireworkRef.current) {
          fireworkRef.current.launch(word);
        }
      }, delay);
    });
  };

  // Auto-launch welcome fireworks sequence
  useEffect(() => {
    // New sequence: Hello -> 2026 -> Happy New Year!
    const sequence = ['你好', '2026', '新年快乐！'];
    
    // Initial delay before starting the sequence
    const startTimer = setTimeout(() => {
      launchSequence(sequence);
    }, 800);

    return () => clearTimeout(startTimer);
  }, []);

  const handleWishSubmit = async (wish: string) => {
    setIsLoading(true);
    setWishText(wish);
    setFortune('');
    setShowFortune(false);

    // 1. Segment the input and launch sequence
    const segments = segmentText(wish);
    launchSequence(segments);

    // 2. Fetch the fortune in the background based on the FULL wish
    try {
      const generatedFortune = await generateFortune(wish);
      setFortune(generatedFortune);
    } catch (e) {
      setFortune("May your 2026 be as bright as these fireworks.");
    } finally {
      setIsLoading(false);
    }
  };

  // Callback from Canvas when a rocket explodes
  const handleExplosion = () => {
    // Logic handled by timer below
  };

  // Watch for fortune readiness
  useEffect(() => {
    if (!isLoading && fortune && wishText && !showFortune) {
       // Wait a bit longer to let the sequence finish
       const segments = segmentText(wishText);
       // Update duration calculation for 1800ms interval
       const sequenceDuration = segments.length * 1800 + 1000; 
       
       const timer = setTimeout(() => {
         setShowFortune(true);
       }, sequenceDuration); 
       
       return () => clearTimeout(timer);
    }
  }, [isLoading, fortune, wishText, showFortune]);


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