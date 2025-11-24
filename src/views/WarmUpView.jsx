import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { motion } from 'framer-motion';
import AppContext from '../context/AppContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import { PlayIcon, PauseIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

const WarmUpView = () => {
  const { goBack } = useContext(AppContext); // ✅ Usar goBack
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [mode, setMode] = useState('reading-path');
  const [showControls, setShowControls] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Schulte
  const [schulteNumbers, setSchulteNumbers] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [schulteTime, setSchulteTime] = useState(0);

  // Tachistoscopia
  const [tachistoNumber, setTachistoNumber] = useState('');
  const [showTachisto, setShowTachisto] = useState(false);
  const [tachistoGuess, setTachistoGuess] = useState('');
  const [tachistoCorrect, setTachistoCorrect] = useState(null);

  // Atajos de teclado
  useKeyboardShortcuts({
    onSpace: () => {
      const next = !isPlaying;
      setIsPlaying(next);
      if (next && mode === 'tachisto') startTachisto();
      if (next && mode === 'schulte') generateSchulte();
    },
    onEsc: () => goBack(), // ✅ Usar goBack
    onArrowUp: () => setSpeed(s => Math.min(s + 0.5, 10)),
    onArrowDown: () => setSpeed(s => Math.max(s - 0.5, 1)),
  }, [isPlaying, mode, goBack]);

  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cx = size.width / 2;
  const cy = size.height / 2;

  // === READING PATH PERFECTO ===
  const readingPath = useMemo(() => {
    if (!size.width) return { x: [], y: [] };
    const x = [];
    const y = [];
    const lines = 10;
    const startX1 = size.width * 0.08;
    const endX1 = size.width * 0.42;
    const startX2 = size.width * 0.58;
    const endX2 = size.width * 0.92;
    const startY = size.height * 0.15;
    const lineHeight = size.height * 0.075;

    for (let i = 0; i < lines; i++) {
      const currentY = startY + i * lineHeight;
      x.push(startX1, endX1, startX2, endX2);
      y.push(currentY, currentY, currentY, currentY);
    }
    return { x, y };
  }, [size]);

  // === CÍRCULO E INFINITO ===
  const circlePath = useMemo(() => {
    if (!size.width) return { x: [], y: [] };
    const r = Math.min(size.width, size.height) * 0.35;
    const steps = 100;
    const x = [];
    const y = [];
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      x.push(cx + Math.cos(angle) * r);
      y.push(cy + Math.sin(angle) * r);
    }
    return { x, y };
  }, [size]);

  const infinityPath = useMemo(() => {
    if (!size.width) return { x: [], y: [] };
    const w = size.width * 0.3;
    const h = size.height * 0.18;
    const steps = 140;
    const x = [];
    const y = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const scale = 1.5 / (3 - Math.cos(2 * t));
      const px = scale * Math.cos(t);
      const py = scale * Math.sin(2 * t) / 2;
      x.push(cx + px * w);
      y.push(cy + py * h);
    }
    return { x, y };
  }, [size]);

  // Schulte
  const generateSchulte = () => {
    const nums = Array.from({ length: 25 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setSchulteNumbers(nums);
    setCurrentTarget(1);
    setSchulteTime(0);
  };

  useEffect(() => {
    if (mode === 'schulte') generateSchulte();
  }, [mode]);

  useEffect(() => {
    let id;
    if (isPlaying && mode === 'schulte') {
      id = setInterval(() => setSchulteTime(t => +(t + 0.1).toFixed(1)), 100);
    }
    return () => clearInterval(id);
  }, [isPlaying, mode]);

  // Tachistoscopia con feedback
  const startTachisto = () => {
    const digits = Math.min(4 + Math.floor(speed), 9);
    const num = String(Math.floor(Math.random() * Math.pow(10, digits))).padStart(digits, '0');
    setTachistoNumber(num);
    setShowTachisto(true);
    setTachistoGuess('');
    setTachistoCorrect(null);
    setTimeout(() => setShowTachisto(false), Math.max(800 - speed * 70, 100));
  };

  useEffect(() => {
    let interval;
    if (isPlaying && mode === 'tachisto') {
      const loop = () => {
        startTachisto();
        const visibleTime = Math.max(800 - speed * 70, 100);
        interval = setTimeout(loop, visibleTime + 1800);
      };
      loop();
    }
    return () => clearTimeout(interval);
  }, [isPlaying, mode, speed]);

  // Flip con pausa perfecta
  useEffect(() => {
    if (isPlaying && mode === 'reading-path') {
      const cycleDuration = (30 / speed) * 1000;
      const timer = setTimeout(() => {
        setIsFlipping(true);
        setTimeout(() => {
          setIsFlipping(false);
          setResetKey(k => k + 1);
        }, 1200);
      }, cycleDuration - 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, mode, speed, resetKey]);

  // Animaciones finales
  const ballAnimation = {
    'reading-path': {
      key: resetKey,
      animate: { x: readingPath.x, y: readingPath.y },
      transition: { duration: 30 / speed, repeat: Infinity, ease: "linear" }
    },
    'saccade-horizontal': {
      animate: { x: [cx - size.width * 0.38, cx + size.width * 0.38] },
      transition: { duration: 1.8 / speed, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
    },
    'four-corners': {
      animate: {
        x: [cx - size.width * 0.35, cx + size.width * 0.35, cx + size.width * 0.35, cx - size.width * 0.35],
        y: [cy - size.height * 0.35, cy - size.height * 0.35, cy + size.height * 0.35, cy + size.height * 0.35]
      },
      transition: { duration: 4 / speed, repeat: Infinity, ease: "easeInOut" }
    },
    'infinity-loop': {
      animate: { x: infinityPath.x, y: infinityPath.y },
      transition: { duration: 8 / speed, repeat: Infinity, ease: "linear" }
    },
    'circle-pursuit': {
      animate: { x: circlePath.x, y: circlePath.y },
      transition: { duration: 12 / speed, repeat: Infinity, ease: "linear" }
    },
    'near-far': {
      animate: { scale: [0.6, 2.8, 0.6] },
      transition: { duration: 3 / speed, repeat: Infinity, ease: "easeInOut" }
    },
    'peripheral': {
      animate: { x: [-size.width * 0.42, size.width * 0.42] },
      transition: { duration: 4 / speed, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
    }
  };

  const currentAnim = ballAnimation[mode] || {};

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900/40 to-gray-900 overflow-hidden flex flex-col items-center justify-center p-2 md:p-4">

      {/* Botón Volver - Regresa a la vista anterior */}
      <button
        onClick={() => goBack()} // ✅ Usar goBack
        className="absolute top-4 left-4 z-50 p-3 bg-white/20 backdrop-blur-lg rounded-full text-white hover:bg-white/30 transition-all shadow-xl"
        aria-label="Volver"
      >
        <ArrowLeftIcon className="w-7 h-7" />
      </button>

      {/* Libro */}
      <div ref={containerRef} className="relative w-full max-w-7xl aspect-[3/2] flex shadow-2xl">
        <div className="flex-1 bg-[#fdfbf7] rounded-l-lg border-r-4 border-gray-400 shadow-inner" />
        <div className="flex-1 bg-[#fdfbf7] rounded-r-lg border-l-4 border-gray-400 shadow-inner" />

        <div className="absolute inset-0 z-10">

          {/* Schulte */}
          {mode === 'schulte' && (
            <div className="grid grid-cols-5 gap-3 p-6 md:p-12 h-full content-center">
              {schulteNumbers.map((n, i) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (n === currentTarget) {
                      if (currentTarget === 25) {
                        setIsPlaying(false);
                        alert(`¡Completado en ${schulteTime.toFixed(1)}s!`);
                      } else {
                        setCurrentTarget(t => t + 1);
                      }
                    }
                  }}
                  className={`flex items-center justify-center text-2xl md:text-5xl font-bold rounded-2xl cursor-pointer transition-all aspect-square shadow-xl
                    ${n === currentTarget ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white scale-110 ring-4 ring-blue-400' : 'bg-white/95 text-gray-800 hover:bg-gray-100'}`}
                >
                  {n}
                </motion.div>
              ))}
            </div>
          )}

          {/* Tachistoscopia con feedback */}
          {mode === 'tachisto' && (
            <div className="flex flex-col items-center justify-center h-full gap-12">
              {showTachisto ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl md:text-9xl font-black text-blue-500 tracking-wider">
                  {tachistoNumber}
                </motion.div>
              ) : tachistoNumber && (
                <>
                  <input
                    type="text"
                    value={tachistoGuess}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTachistoGuess(val);
                      if (val === tachistoNumber) setTachistoCorrect(true);
                      if (val.length === tachistoNumber.length && val !== tachistoNumber) setTachistoCorrect(false);
                    }}
                    placeholder="Escribe aquí"
                    className="text-5xl md:text-7xl text-center bg-white/20 backdrop-blur-xl rounded-3xl px-10 py-6 text-white placeholder-gray-400 w-11/12 md:w-auto"
                    autoFocus
                  />
                  {tachistoCorrect === true && <p className="text-5xl text-green-400 font-bold animate-pulse">¡CORRECTO!</p>}
                  {tachistoCorrect === false && <p className="text-5xl text-red-400 font-bold animate-pulse">Incorrecto</p>}
                </>
              )}
            </div>
          )}

          {/* Visión Periférica */}
          {isPlaying && mode === 'peripheral' && (
            <>
              <motion.div className="absolute w-10 h-10 md:w-16 md:h-16 rounded-full bg-red-500 shadow-2xl blur-sm" style={{ top: "50%", left: "5%", marginTop: -32 }} animate={{ x: [-size.width * 0.4, size.width * 0.4] }} transition={{ duration: 4 / speed, repeat: Infinity, repeatType: "reverse" }} />
              <motion.div className="absolute w-10 h-10 md:w-16 md:h-16 rounded-full bg-green-500 shadow-2xl blur-sm" style={{ top: "50%", right: "5%", marginTop: -32 }} animate={{ x: [size.width * 0.4, -size.width * 0.4] }} transition={{ duration: 4 / speed, repeat: Infinity, repeatType: "reverse" }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl md:text-8xl text-white font-black">•</div>
            </>
          )}

          {/* Bola principal */}
          {isPlaying && !['schulte', 'tachisto', 'peripheral'].includes(mode) && (
            <motion.div
              key={resetKey + mode}
              className="absolute w-12 h-12 md:w-20 md:h-20 rounded-full bg-blue-500 z-50 pointer-events-none"
              style={{
                boxShadow: "0 0 100px 40px rgba(59,130,246,0.9)",
                background: "radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6)"
              }}
              animate={currentAnim.animate}
              transition={currentAnim.transition}
              initial={{ x: cx, y: cy }}
            />
          )}

          {/* Flip página */}
          {isFlipping && (
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -180 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
              onAnimationComplete={() => setIsFlipping(false)}
              style={{ transformOrigin: "left center" }}
              className="absolute top-0 right-0 w-1/2 h-full bg-[#fdfbf7] rounded-r-lg shadow-2xl border-l-4 border-gray-400 z-50"
            >
              <motion.div initial={{ opacity: 0.4 }} animate={{ opacity: 0 }} className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Controles */}
      <motion.div
        animate={{ opacity: isPlaying ? 0.15 : 1 }}
        onMouseEnter={() => isPlaying && setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-2xl p-4 md:p-8 rounded-3xl border border-white/30 shadow-2xl z-50 w-[92%] md:w-auto"
      >
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-3xl font-black text-white">Calentamiento Visual</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const next = !isPlaying;
                setIsPlaying(next);
                if (next && mode === 'tachisto') startTachisto();
                if (next && mode === 'schulte') generateSchulte();
              }}
              className="p-4 md:p-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl transition hover:scale-110"
              aria-label={isPlaying ? "Pausar" : "Iniciar"}
            >
              {isPlaying ? <PauseIcon className="w-8 h-8 md:w-12 md:h-12" /> : <PlayIcon className="w-8 h-8 md:w-12 md:h-12" />}
            </button>

            <select value={mode} onChange={(e) => { setIsPlaying(false); setMode(e.target.value); setResetKey(k => k + 1); }} className="bg-gray-800/90 text-white px-4 py-3 md:px-6 md:py-4 rounded-xl text-sm md:text-lg flex-1">
              <option value="reading-path">Libro Abierto</option>
              <option value="saccade-horizontal">Saltos Horizontales</option>
              <option value="four-corners">Cuatro Esquinas</option>
              <option value="infinity-loop">Infinity Loop</option>
              <option value="circle-pursuit">Seguimiento Circular</option>
              <option value="near-far">Foco Cerca/Lejos</option>
              <option value="peripheral">Visión Periférica</option>
              <option value="schulte">Schulte Table</option>
              <option value="tachisto">Tachistoscopia</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-white/90 text-sm md:text-base font-medium">
              <span>Velocidad</span>
              <span className="text-cyan-400">{speed.toFixed(1)}x</span>
            </div>
            <input type="range" min="1" max="10" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full h-3 bg-gray-700 rounded-full accent-cyan-500 shadow-inner" aria-label="Control de velocidad" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WarmUpView;
