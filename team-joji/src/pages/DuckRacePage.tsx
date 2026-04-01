import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Trophy, Users, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';
import { Toaster, toast } from 'sonner';

import { DuckIcon } from '../components/GameIcons';

interface Player {
  id: string;
  name: string;
  color: string;
  progress: number;
  finishTime?: number;
  yOffset: number; // For "4D" wobble
  scale: number;   // For "4D" depth
}

const COLORS = [
  '#FFD700', '#FF4500', '#00CED1', '#FF1493', '#32CD32', 
  '#9370DB', '#FFA500', '#00BFFF', '#7FFF00', '#FF69B4',
  '#F0E68C', '#E6E6FA', '#FF7F50', '#00FA9A', '#87CEEB'
];

export const DuckRacePage: React.FC = () => {
  const { playSound } = useSound();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [gameState, setGameState] = useState<'setup' | 'countdown' | 'racing' | 'finished'>('setup');
  const [countdown, setCountdown] = useState(3);
  const [winners, setWinners] = useState<Player[]>([]);
  const [raceTime, setRaceTime] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  
  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const addPlayer = () => {
    if (!newName.trim()) return;
    if (players.length >= 100) {
      toast.error("Max 100 players reached!");
      return;
    }
    
    // Generate a truly random vibrant color if we run out of preset colors or just for variety
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      color: randomColor,
      progress: 0,
      yOffset: 0,
      scale: 1
    };
    
    setPlayers([...players, newPlayer]);
    setNewName('');
    playSound('quack');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    playSound('click');
  };

  const startRace = () => {
    if (players.length < 2) {
      toast.error("Need at least 2 players to race!");
      return;
    }
    setGameState('countdown');
    setCountdown(3);
    playSound('click');
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('racing');
        setRaceTime(0);
        startTimeRef.current = Date.now();
        toast.success("QUACK! GO!");
        playSound('cheer');
      }
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'racing') {
      const updateRace = () => {
        setRaceTime((Date.now() - startTimeRef.current) / 1000);
        
        setPlayers(prev => {
          const next = prev.map(p => {
            if (p.progress >= 100) return p;
            
            // Random speed with some "bursts"
            const baseSpeed = Math.random() * 0.4 + 0.1;
            const burst = Math.random() > 0.98 ? 2 : 0;
            const newProgress = Math.min(100, p.progress + baseSpeed + burst);
            
            // 4D Wobble and Jump logic
            const wobble = Math.sin(Date.now() / 100) * 5;
            const jump = Math.random() > 0.99 ? -20 : 0;
            if (jump < 0) playSound('jump');

            if (newProgress === 100 && !p.finishTime) {
              playSound('splash');
              setIsShaking(true);
              setTimeout(() => setIsShaking(false), 200);
              return { 
                ...p, 
                progress: newProgress, 
                finishTime: (Date.now() - startTimeRef.current) / 1000,
                yOffset: 0,
                scale: 1.2
              };
            }
            
            return { 
              ...p, 
              progress: newProgress,
              yOffset: jump !== 0 ? jump : wobble,
              scale: 1 + (Math.sin(Date.now() / 200) * 0.1)
            };
          });

          const finishedCount = next.filter(p => p.progress >= 100).length;
          if (finishedCount === next.length) {
            setGameState('finished');
            const sorted = [...next].sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0));
            setWinners(sorted.slice(0, 3));
            playSound('win');
            confetti({
              particleCount: 200,
              spread: 90,
              origin: { y: 0.6 },
              colors: ['#FFD700', '#FFFFFF', '#14F195', '#9945FF']
            });
          }
          return next;
        });
        gameLoopRef.current = requestAnimationFrame(updateRace);
      };
      gameLoopRef.current = requestAnimationFrame(updateRace);
      return () => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      };
    }
  }, [gameState]);

  const resetRace = () => {
    setPlayers(players.map(p => ({ ...p, progress: 0, finishTime: undefined, yOffset: 0, scale: 1 })));
    setGameState('setup');
    setWinners([]);
    setRaceTime(0);
    playSound('click');
  };

  return (
    <div className={cn(
      "min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto transition-transform duration-75",
      isShaking && "translate-x-1 translate-y-1"
    )}>
      <Toaster position="top-center" richColors />
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls & Setup */}
        <div className="lg:w-1/3 space-y-6">
          <div className="glass-card border-brand-blue/30">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 neon-text">
              <Users size={24} />
              Racer Management
            </h2>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="Duck Name..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-brand-blue transition-colors"
              />
              <button 
                onClick={addPlayer}
                className="p-3 bg-brand-blue text-black rounded-xl hover:scale-110 transition-transform shadow-[0_0_15px_rgba(20,241,149,0.4)]"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {players.map(player => (
                <motion.div 
                  layout
                  key={player.id} 
                  className="flex items-center justify-between p-3 glass rounded-xl border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🦆</div>
                    <span className="font-bold text-sm tracking-wide">{player.name}</span>
                  </div>
                  <button 
                    onClick={() => removePlayer(player.id)}
                    className="text-white/20 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
              {players.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-2 opacity-20">🦆</div>
                  <p className="text-white/20 text-sm font-bold uppercase tracking-widest">No Racers Yet</p>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <button 
                disabled={gameState !== 'setup'}
                onClick={startRace}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play size={20} fill="currentColor" />
                START THE FUN!
              </button>
              <button 
                onClick={resetRace}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                RESET POND
              </button>
            </div>
          </div>

          {/* Live Timer & Leaderboard */}
          <div className="space-y-6">
            <div className="glass-card border-brand-purple/30 text-center py-6">
              <div className="text-[10px] font-black text-brand-purple uppercase tracking-[0.3em] mb-1">Race Timer</div>
              <div className="text-4xl font-black font-mono neon-text">
                {raceTime.toFixed(2)}s
              </div>
            </div>

            <div className="glass-card border-white/10 flex-1 min-h-[400px] flex flex-col">
              <h3 className="text-sm font-black mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Trophy size={16} className="text-yellow-500" />
                Live Standings
              </h3>
              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                {[...players]
                  .sort((a, b) => b.progress - a.progress)
                  .map((player, index) => (
                    <div 
                      key={player.id} 
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border transition-colors",
                        index === 0 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-white/5 border-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white/20 w-4">{index + 1}</span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: player.color }}
                        />
                        <span className="text-xs font-bold truncate max-w-[80px]">{player.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-white/40">
                        {player.progress.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                {players.length === 0 && (
                  <div className="text-center py-20 opacity-20">
                    <p className="text-[10px] font-bold uppercase tracking-widest">No Data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Race Track */}
        <div className="lg:w-2/3">
          <div className="glass-card h-full min-h-[750px] relative overflow-hidden flex flex-col border-white/10 p-0">
            {/* Header in Track */}
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-black/20">
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase">The <span className="neon-text">Vertical</span> Pond</h2>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Top to Bottom Dash!</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs font-black text-brand-blue px-4 py-2 glass rounded-full border-brand-blue/20">
                  {players.length} DUCKS
                </div>
              </div>
            </div>

            <div className="flex-1 relative bg-[#004466] flex overflow-x-auto custom-scrollbar">
              {/* Animated Water Background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#006699_0%,_#004466_100%)]" />
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [-20, 20],
                      opacity: [0.1, 0.2, 0.1],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3 + i, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: i * 0.5
                    }}
                    className="absolute w-full h-1 bg-white/10 blur-sm"
                    style={{ top: `${i * 10}%` }}
                  />
                ))}
              </div>

              {/* Lanes Container */}
              <div className="flex min-w-full relative z-10 px-4">
                {players.map((player, idx) => (
                  <div 
                    key={player.id} 
                    className="relative w-24 min-w-[96px] border-r border-white/10 flex flex-col items-center"
                  >
                    {/* Lane Number */}
                    <div className="absolute top-2 text-[10px] font-black text-white/30 uppercase tracking-widest bg-black/40 px-2 py-1 rounded-full">
                      {idx + 1}
                    </div>

                    {/* Floating Lily Pads (Randomly placed) */}
                    {idx % 2 === 0 && (
                      <div className="absolute top-[20%] opacity-20 text-2xl select-none">🍃</div>
                    )}
                    {idx % 3 === 0 && (
                      <div className="absolute top-[60%] opacity-20 text-xl select-none">🍃</div>
                    )}

                    {/* Finish Line (Checkered) */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 z-0">
                      <div className="grid grid-cols-4 grid-rows-4 h-full opacity-40">
                        {[...Array(16)].map((_, i) => (
                          <div key={i} className={cn(
                            "w-full h-full",
                            (Math.floor(i / 4) + (i % 4)) % 2 === 0 ? "bg-white" : "bg-black"
                          )} />
                        ))}
                      </div>
                      <div className="absolute -top-6 left-0 right-0 text-center">
                        <span className="text-[10px] font-black text-white bg-red-600 px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg">
                          FINISH
                        </span>
                      </div>
                    </div>

                    {/* Duck Container (Vertical Movement) */}
                    <motion.div
                      className="absolute top-0 z-20 flex flex-col items-center"
                      animate={{ 
                        top: `${player.progress}%`,
                        x: player.yOffset,
                        scale: player.scale
                      }}
                      transition={{ 
                        top: { type: 'spring', stiffness: 40, damping: 15 },
                        x: { type: 'spring', stiffness: 200, damping: 10 }
                      }}
                      style={{ 
                        marginTop: player.progress >= 100 ? '-80px' : '40px'
                      }}
                    >
                      {/* Wake/Ripples behind duck */}
                      {gameState === 'racing' && player.progress < 100 && (
                        <div className="absolute -top-8 flex flex-col items-center gap-1">
                          <motion.div 
                            animate={{ scale: [1, 2], opacity: [0.4, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-12 h-4 border-2 border-white/20 rounded-full"
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-8 h-3 border border-white/10 rounded-full"
                          />
                        </div>
                      )}

                      <div className="relative">
                        <DuckIcon 
                          color={player.color} 
                          size={64}
                          className="cursor-pointer hover:scale-110 transition-transform rotate-90 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                          onClick={() => playSound('quack')}
                        />
                        {/* Individual Duck Glow */}
                        <div 
                          className="absolute inset-0 blur-2xl opacity-20 rounded-full"
                          style={{ backgroundColor: player.color }}
                        />
                      </div>
                      
                      <div className="mt-2 px-3 py-1 glass rounded-full border-white/20 bg-black/60 shadow-xl">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-white whitespace-nowrap">
                          {player.name}
                        </span>
                      </div>

                      {player.finishTime && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-8 text-[10px] font-black text-brand-blue bg-black/80 px-2 py-0.5 rounded-full border border-brand-blue/30"
                        >
                          {player.finishTime.toFixed(2)}s
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Countdown Overlay */}
              <AnimatePresence>
                {gameState === 'countdown' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 3, filter: "blur(20px)" }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
                  >
                    <div className="text-center">
                      <motion.div
                        key={countdown}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[12rem] font-black neon-text drop-shadow-[0_0_50px_rgba(153,69,255,0.5)]"
                      >
                        {countdown === 0 ? "QUACK!" : countdown}
                      </motion.div>
                      <p className="text-2xl font-bold tracking-[0.5em] text-white/50 uppercase">Get Ready!</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Winners Overlay */}
              <AnimatePresence>
                {gameState === 'finished' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-8"
                  >
                    <div className="max-w-2xl w-full text-center space-y-12">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-2"
                      >
                        <h3 className="text-6xl font-black neon-text tracking-tighter">CHAMPIONS!</h3>
                        <p className="text-white/40 font-bold uppercase tracking-[0.4em]">The Pond has spoken</p>
                      </motion.div>

                      <div className="grid grid-cols-3 gap-6 items-end h-64">
                        {/* 2nd Place */}
                        {winners[1] && (
                          <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col items-center"
                          >
                            <div className="text-6xl mb-4">🥈</div>
                            <div className="w-full bg-white/10 glass rounded-t-2xl p-4 h-32 flex flex-col justify-center border-b-0 border-white/20">
                              <div className="text-lg font-black truncate">{winners[1].name}</div>
                              <div className="text-xs font-bold text-white/40">{winners[1].finishTime?.toFixed(2)}s</div>
                            </div>
                          </motion.div>
                        )}

                        {/* 1st Place */}
                        {winners[0] && (
                          <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col items-center"
                          >
                            <div className="text-8xl mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">🥇</div>
                            <div className="w-full bg-brand-purple/20 glass rounded-t-3xl p-6 h-48 flex flex-col justify-center border-b-0 border-brand-purple/40">
                              <div className="text-2xl font-black neon-text truncate">{winners[0].name}</div>
                              <div className="text-sm font-bold text-white/60">{winners[0].finishTime?.toFixed(2)}s</div>
                            </div>
                          </motion.div>
                        )}

                        {/* 3rd Place */}
                        {winners[2] && (
                          <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col items-center"
                          >
                            <div className="text-5xl mb-4">🥉</div>
                            <div className="w-full bg-white/5 glass rounded-t-xl p-4 h-24 flex flex-col justify-center border-b-0 border-white/10">
                              <div className="text-base font-black truncate">{winners[2].name}</div>
                              <div className="text-[10px] font-bold text-white/30">{winners[2].finishTime?.toFixed(2)}s</div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex gap-4 justify-center">
                        <button onClick={resetRace} className="btn-primary px-12">
                          REMATCH!
                        </button>
                        <button onClick={resetRace} className="btn-secondary">
                          BACK TO SETUP
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
