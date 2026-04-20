import { useState } from 'react'
import NeonWheel from './components/NeonWheel'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Coins } from 'lucide-react'

const SEGMENTS = [
  { id: 1, label: '500€', color: '#FFD700', textColor: '#000' }, // Gold
  { id: 2, label: '0€', color: '#1C1C24', textColor: '#39FF14' },
  { id: 3, label: '50€', color: '#39FF14', textColor: '#000' }, // Neon Green
  { id: 4, label: '0€', color: '#1C1C24', textColor: '#FF00FF' },
  { id: 5, label: '100€', color: '#00FFFF', textColor: '#000' }, // Cyan
  { id: 6, label: '0€', color: '#1C1C24', textColor: '#39FF14' },
  { id: 7, label: '20€', color: '#FF00FF', textColor: '#000' }, // Pink
  { id: 8, label: '0€', color: '#1C1C24', textColor: '#00FFFF' },
  { id: 9, label: '10€', color: '#BC13FE', textColor: '#fff' }, // Purple
  { id: 10, label: '0€', color: '#1C1C24', textColor: '#FF00FF' },
  { id: 11, label: '5€', color: '#FF6600', textColor: '#000' }, // Orange
  { id: 12, label: '0€', color: '#1C1C24', textColor: '#FFD700' },
]

function App() {
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof SEGMENTS[0] | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    setWinnerIndex(null); 

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * SEGMENTS.length);
      setWinnerIndex(randomIndex);
    }, 100);
  };

  const handleSpinEnd = (winner: typeof SEGMENTS[0]) => {
    setIsSpinning(false);
    setResult(winner);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-premium-dark font-modern">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-12 w-full max-w-4xl">
        <header className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter uppercase"
          >
            FORTUNE <span className="text-neon-green">WHEEL</span>
          </motion.h1>
          <div className="h-1 w-24 bg-neon-green mx-auto rounded-full shadow-[0_0_15px_#39FF14]" />
        </header>

        <div className="relative">
          <NeonWheel 
            segments={SEGMENTS} 
            winnerIndex={winnerIndex} 
            onSpinEnd={handleSpinEnd}
            className="scale-90 md:scale-105"
          />
        </div>

        <div className="flex flex-col items-center gap-8">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(57, 255, 20, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpin}
            disabled={isSpinning}
            className={`
              relative px-16 py-6 text-2xl font-black tracking-[0.2em] transition-all duration-300
              flex items-center gap-4 uppercase
              ${isSpinning 
                ? 'bg-premium-gray text-gray-500 cursor-not-allowed border-gray-800' 
                : 'bg-transparent text-white border-neon-green hover:bg-neon-green hover:text-black'
              }
              rounded-full border-4 shadow-[0_0_20px_rgba(57, 255, 20, 0.2)]
            `}
          >
            {isSpinning ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Coins className="w-8 h-8" />
            )}
            {isSpinning ? 'SPINNING...' : 'SPIN NOW'}
          </motion.button>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -30 }}
                className="flex flex-col items-center"
              >
                <div className="premium-card p-10 flex flex-col items-center border-2 border-white/20">
                  <span className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Result</span>
                  <h3 className="text-7xl font-black text-white" style={{ 
                    color: result.color === '#1C1C24' ? '#fff' : result.color,
                    filter: `drop-shadow(0 0 15px ${result.color === '#1C1C24' ? '#fff' : result.color})`
                  }}>
                    {result.label}
                  </h3>
                  {result.label !== '0€' && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="mt-4 text-neon-green font-bold uppercase tracking-widest text-sm"
                    >
                      Big Win!
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default App
