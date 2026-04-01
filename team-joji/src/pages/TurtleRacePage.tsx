import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Trophy, Users, Plus, Trash2, Clock, Volume2, Maximize2, Settings2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';
import { Toaster, toast } from 'sonner';

import { TurtleIcon } from '../components/GameIcons';

interface Turtle {
  id: string;
  name: string;
  color: string;
  progress: number;
  finishOffset: number; // Random variance for finish time
  yOffset: number;
  scale: number;
  rotation: number;
}

const TURTLE_COLORS = [
  '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887',
  '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#166534', 
  '#84CC16', '#A3E635', '#BEF264', '#D9F99D', '#F7FEE7'
];

export const TurtleRacePage: React.FC = () => {
  const { playSound } = useSound();
  
  // Settings
  const [players, setPlayers] = useState<Turtle[]>([]);
  const [newName, setNewName] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(10);
  const [autoStart, setAutoStart] = useState(false);
  const [loopMusic, setLoopMusic] = useState(true);
  
  // Game State
  const [gameState, setGameState] = useState<'setup' | 'countdown' | 'racing' | 'paused' | 'finished'>('setup');
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [winners, setWinners] = useState<Turtle[]>([]);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const addPlayer = () => {
    if (!newName.trim()) return;
    if (players.length >= 100) {
      toast.error("Max 100 turtles reached!");
      return;
    }
    
    const randomColor = TURTLE_COLORS[Math.floor(Math.random() * TURTLE_COLORS.length)];

    const newTurtle: Turtle = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      color: randomColor,
      progress: 0,
      finishOffset: (Math.random() - 0.5) * 2, // +/- 1 second variance
      yOffset: 0,
      scale: 1,
      rotation: 0
    };
    
    setPlayers([...players, newTurtle]);
    setNewName('');
    playSound('click');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    playSound('click');
  };

  const clearPlayers = () => {
    setPlayers([]);
    playSound('click');
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startRace = () => {
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total <= 0) {
      toast.error("Please set a race duration!");
      return;
    }
    if (players.length < 2) {
      toast.error("Need at least 2 turtles to race!");
      return;
    }
    
    setTotalDuration(total);
    setRemainingTime(total);
    setGameState('countdown');
    setCountdown(3);
    playSound('click');
  };

  const togglePause = () => {
    if (gameState === 'racing') setGameState('paused');
    else if (gameState === 'paused') setGameState('racing');
    playSound('click');
  };

  const resetRace = () => {
    setGameState('setup');
    setPlayers(players.map(p => ({ ...p, progress: 0 })));
    setWinners([]);
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    playSound('click');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('racing');
        lastUpdateRef.current = Date.now();
        playSound('cheer');
      }
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'racing') {
      const update = () => {
        const now = Date.now();
        const delta = (now - lastUpdateRef.current) / 1000;
        lastUpdateRef.current = now;

        setRemainingTime(prev => {
          const next = Math.max(0, prev - delta);
          
          setPlayers(currentPlayers => {
            const updated = currentPlayers.map(p => {
              const elapsed = totalDuration - next;
              // Progress scales with time, but with slight individual variance
              // Each turtle targets finishing at totalDuration + finishOffset
              const targetTime = totalDuration + p.finishOffset;
              let progress = (elapsed / targetTime) * 100;
              
              // 4D Animations
              const wobble = Math.sin(now / 200) * 3;
              const swim = Math.cos(now / 150) * 2;
              const scale = 1 + Math.sin(now / 300) * 0.05;
              const rotation = Math.sin(now / 400) * 5;

              return {
                ...p,
                progress: Math.min(100, progress),
                yOffset: wobble + swim,
                scale,
                rotation
              };
            });

            if (next <= 0) {
              const allFinished = updated.every(p => p.progress >= 100);
              if (allFinished) {
                setGameState('finished');
                const sorted = [...updated].sort((a, b) => b.progress - a.progress || a.finishOffset - b.finishOffset);
                setWinners(sorted.slice(0, 3));
                playSound('win');
                confetti({
                  particleCount: 200,
                  spread: 100,
                  origin: { y: 0.6 },
                  colors: ['#4ADE80', '#22C55E', '#FFFFFF']
                });
              }
            }
            return updated;
          });

          return next;
        });

        gameLoopRef.current = requestAnimationFrame(update);
      };

      gameLoopRef.current = requestAnimationFrame(update);
      return () => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      };
    }
  }, [gameState, totalDuration]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-[#0f172a] overflow-hidden">
      <Toaster position="top-center" richColors />
      
      <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-6 rounded-3xl border-green-500/20">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-green-400 flex items-center gap-3">
              🐢 TURTLE RACE TIMER
            </h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Slow and steady wins the race!</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs font-black text-white/30 uppercase mb-1">Time Remaining</div>
              <div className="text-5xl font-black font-mono text-green-400 tabular-nums">
                {formatTime(remainingTime)}
              </div>
            </div>
            <button 
              onClick={toggleFullscreen}
              className="p-4 glass rounded-2xl hover:bg-white/10 transition-colors text-white/50"
            >
              <Maximize2 size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Setup Panel */}
          <AnimatePresence>
            {gameState === 'setup' && (
              <motion.div 
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="lg:w-1/3 space-y-6"
              >
                <div className="glass-card border-green-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black flex items-center gap-2">
                      <Settings2 size={20} className="text-green-400" />
                      Race Settings
                    </h2>
                  </div>

                  {/* Timer Setup */}
                  <div className="space-y-4 mb-8">
                    <label className="text-xs font-black text-white/30 uppercase tracking-widest">Race Duration</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <input 
                          type="number" value={hours} onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center font-bold"
                        />
                        <div className="text-[10px] text-center text-white/30 uppercase font-bold">Hrs</div>
                      </div>
                      <div className="space-y-1">
                        <input 
                          type="number" value={minutes} onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center font-bold"
                        />
                        <div className="text-[10px] text-center text-white/30 uppercase font-bold">Min</div>
                      </div>
                      <div className="space-y-1">
                        <input 
                          type="number" value={seconds} onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center font-bold"
                        />
                        <div className="text-[10px] text-center text-white/30 uppercase font-bold">Sec</div>
                      </div>
                    </div>
                  </div>

                  {/* Player Input */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-white/30 uppercase tracking-widest">Add Racers ({players.length}/100)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                        placeholder="Enter Name..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-green-400 outline-none"
                      />
                      <button onClick={addPlayer} className="p-3 bg-green-500 text-black rounded-xl font-bold">
                        <Plus size={20} />
                      </button>
                    </div>
                    
                    <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {players.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 glass rounded-xl border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🐢</span>
                            <span className="font-bold text-sm">{p.name}</span>
                          </div>
                          <button onClick={() => removePlayer(p.id)} className="text-white/20 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button onClick={startRace} className="w-full btn-primary bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/20">
                      START TURTLE RACE!
                    </button>
                    <button onClick={clearPlayers} className="w-full btn-secondary text-xs uppercase tracking-widest">
                      Clear All Racers
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Race Track */}
          <div className={cn("flex-1 glass rounded-[2.5rem] border-white/5 p-8 relative overflow-hidden flex flex-col", gameState !== 'setup' ? "w-full" : "")}>
            {/* Track Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent pointer-events-none" />
            
            {/* Finish Line */}
            <div className="absolute right-12 top-8 bottom-8 w-4 border-l-4 border-dashed border-white/10 flex flex-col justify-around items-center">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-full h-2 bg-white/5" />
              ))}
              <div className="absolute -top-6 font-black text-white/20 text-[10px] uppercase tracking-widest">Finish</div>
            </div>

            <div className="flex-1 relative space-y-4 overflow-y-auto pr-8 custom-scrollbar">
              {players.map((turtle, idx) => (
                <div key={turtle.id} className="relative h-16 flex items-center group">
                  {/* Lane */}
                  <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Turtle */}
                  <motion.div
                    className="absolute left-0 z-20 flex items-center gap-4"
                    animate={{ 
                      left: `${turtle.progress}%`,
                      y: turtle.yOffset,
                      scale: turtle.scale,
                      rotate: turtle.rotation
                    }}
                    transition={{ 
                      left: { type: 'linear', duration: 0.1 },
                      y: { type: 'spring', stiffness: 100, damping: 10 }
                    }}
                  >
                    <div className="relative">
                      <TurtleIcon 
                        color={turtle.color} 
                        size={56}
                        className="select-none"
                      />
                      {/* Shell Glow */}
                      <div 
                        className="absolute inset-0 blur-xl opacity-30 rounded-full"
                        style={{ backgroundColor: turtle.color }}
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">#{idx + 1}</span>
                      <span className="text-sm font-black text-white whitespace-nowrap">{turtle.name}</span>
                    </div>
                  </motion.div>
                </div>
              ))}

              {players.length === 0 && gameState === 'setup' && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <div className="text-9xl mb-4">🐢</div>
                  <h3 className="text-2xl font-black uppercase tracking-widest">Waiting for Racers</h3>
                </div>
              )}
            </div>

            {/* Controls Overlay */}
            {gameState !== 'setup' && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button onClick={togglePause} className="p-4 glass rounded-2xl hover:bg-white/10 transition-colors">
                  {gameState === 'paused' ? <Play fill="currentColor" /> : <Pause fill="currentColor" />}
                </button>
                <button onClick={resetRace} className="p-4 glass rounded-2xl hover:bg-white/10 transition-colors">
                  <RotateCcw />
                </button>
              </div>
            )}

            {/* Countdown */}
            <AnimatePresence>
              {gameState === 'countdown' && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
                >
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[15rem] font-black text-green-400 drop-shadow-[0_0_50px_rgba(74,222,128,0.5)]"
                  >
                    {countdown === 0 ? "GO!" : countdown}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Winners */}
            <AnimatePresence>
              {gameState === 'finished' && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-12"
                >
                  <div className="max-w-4xl w-full text-center space-y-12">
                    <div className="space-y-4">
                      <h2 className="text-7xl font-black text-green-400 tracking-tighter">RACE COMPLETE!</h2>
                      <p className="text-white/40 font-bold uppercase tracking-[0.5em]">The winners are in!</p>
                    </div>

                    <div className="grid grid-cols-3 gap-8 items-end h-80">
                      {/* 2nd */}
                      {winners[1] && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-4">
                          <div className="text-6xl">🥈</div>
                          <div className="glass p-6 rounded-t-3xl h-40 flex flex-col justify-center border-b-0">
                            <div className="text-2xl font-black truncate">{winners[1].name}</div>
                            <div className="text-xs font-bold text-white/40 uppercase">2nd Place</div>
                          </div>
                        </motion.div>
                      )}
                      {/* 1st */}
                      {winners[0] && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
                          <div className="text-9xl drop-shadow-[0_0_30px_rgba(74,222,128,0.5)]">🥇</div>
                          <div className="glass bg-green-500/10 border-green-500/30 p-8 rounded-t-[3rem] h-56 flex flex-col justify-center border-b-0">
                            <div className="text-4xl font-black text-green-400 truncate">{winners[0].name}</div>
                            <div className="text-sm font-bold text-green-400/60 uppercase tracking-widest">Champion</div>
                          </div>
                        </motion.div>
                      )}
                      {/* 3rd */}
                      {winners[2] && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-4">
                          <div className="text-5xl">🥉</div>
                          <div className="glass p-4 rounded-t-2xl h-32 flex flex-col justify-center border-b-0">
                            <div className="text-xl font-black truncate">{winners[2].name}</div>
                            <div className="text-[10px] font-bold text-white/30 uppercase">3rd Place</div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-center gap-6">
                      <button onClick={resetRace} className="btn-primary bg-green-500 text-black px-12">NEW RACE</button>
                      <button onClick={resetRace} className="btn-secondary">BACK TO SETUP</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
