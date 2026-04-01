import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users, Trophy, Filter, Loader2, Facebook } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  comment: string;
  avatar: string;
}

export const GiveawayPage: React.FC = () => {
  const { playSound } = useSound();
  const [postUrl, setPostUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const [currentPick, setCurrentPick] = useState<Participant | null>(null);

  const mockParticipants: Participant[] = [
    { id: '1', name: 'Alex Rivers', comment: 'Done! #sofia', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Sarah Chen', comment: 'I want to win! done', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'Marcus Bell', comment: 'Amazing giveaway! #sofia', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', name: 'Elena Frost', comment: 'Done and shared', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: '5', name: 'Jordan Lee', comment: 'Pick me! #sofia', avatar: 'https://i.pravatar.cc/150?u=5' },
    { id: '6', name: 'Mia Wong', comment: 'Done! Hope I win', avatar: 'https://i.pravatar.cc/150?u=6' },
    { id: '7', name: 'Chris Evans', comment: 'Done #sofia', avatar: 'https://i.pravatar.cc/150?u=7' },
    { id: '8', name: 'Luna Stark', comment: 'Done!', avatar: 'https://i.pravatar.cc/150?u=8' },
  ];

  const loadParticipants = () => {
    if (!postUrl) {
      toast.error("Please enter a Facebook post URL");
      return;
    }
    setIsLoading(true);
    playSound('click');
    
    // Simulate API delay
    setTimeout(() => {
      let filtered = [...mockParticipants];
      if (keyword) {
        filtered = filtered.filter(p => p.comment.toLowerCase().includes(keyword.toLowerCase()));
      }
      setParticipants(filtered);
      setIsLoading(false);
      toast.success(`Loaded ${filtered.length} unique participants!`);
    }, 1500);
  };

  const pickWinner = () => {
    if (participants.length === 0) {
      toast.error("Load participants first!");
      return;
    }
    
    setIsPicking(true);
    setWinners([]);
    playSound('click');

    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * participants.length);
      setCurrentPick(participants[randomIdx]);
      count++;
      
      if (count > 20) {
        clearInterval(interval);
        const selectedWinners: Participant[] = [];
        const available = [...participants];
        
        for (let i = 0; i < Math.min(winnerCount, participants.length); i++) {
          const idx = Math.floor(Math.random() * available.length);
          selectedWinners.push(available.splice(idx, 1)[0]);
        }
        
        setWinners(selectedWinners);
        setIsPicking(false);
        playSound('win');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />
      
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Setup Panel */}
        <div className="space-y-8">
          <div className="glass-card">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
              <Facebook className="text-brand-blue" />
              Giveaway Setup
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Facebook Post URL</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                  <input 
                    type="text" 
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://facebook.com/posts/..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-brand-purple transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Keyword Filter</label>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input 
                      type="text" 
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g. #sofia"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-brand-purple transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Winner Count</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    value={winnerCount}
                    onChange={(e) => setWinnerCount(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-brand-purple transition-colors"
                  />
                </div>
              </div>

              <button 
                onClick={loadParticipants}
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Users size={20} />}
                Load Participants
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-brand-blue" />
              Participants ({participants.length})
            </h3>
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
              {participants.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 glass rounded-xl">
                  <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full border border-white/10" />
                  <div>
                    <div className="font-bold text-sm">{p.name}</div>
                    <div className="text-xs text-white/50 line-clamp-1">{p.comment}</div>
                  </div>
                </div>
              ))}
              {participants.length === 0 && (
                <div className="text-center py-12 text-white/20">
                  No participants loaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Picker Panel */}
        <div className="flex flex-col gap-8">
          <div className="glass-card flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/10 to-transparent pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {isPicking ? (
                <motion.div 
                  key="picking"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="space-y-6"
                >
                  <div className="w-32 h-32 rounded-full border-4 border-brand-blue border-t-transparent animate-spin mx-auto mb-8" />
                  <div className="text-3xl font-black neon-text animate-pulse">
                    PICKING WINNER...
                  </div>
                  {currentPick && (
                    <div className="text-xl font-bold text-white/70">
                      {currentPick.name}
                    </div>
                  )}
                </motion.div>
              ) : winners.length > 0 ? (
                <motion.div 
                  key="winners"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 w-full"
                >
                  <Trophy size={80} className="text-yellow-400 mx-auto drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
                  <h2 className="text-4xl font-black neon-text uppercase">We Have Winners!</h2>
                  
                  <div className="grid gap-4 max-w-md mx-auto">
                    {winners.map((winner, idx) => (
                      <motion.div
                        key={winner.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-4 p-4 glass rounded-2xl border-brand-blue/30"
                      >
                        <img src={winner.avatar} alt={winner.name} className="w-16 h-16 rounded-full border-2 border-brand-blue" />
                        <div className="text-left">
                          <div className="text-xs font-bold text-brand-blue uppercase tracking-widest">Winner #{idx + 1}</div>
                          <div className="text-2xl font-black">{winner.name}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <button onClick={() => setWinners([])} className="btn-secondary">
                    Reset Picker
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="w-48 h-48 rounded-full glass flex items-center justify-center mx-auto mb-8 border-brand-purple/20">
                    <Trophy size={64} className="text-white/20" />
                  </div>
                  <h2 className="text-3xl font-black text-white/30">Ready to Pick?</h2>
                  <p className="text-white/40 max-w-xs mx-auto">
                    Click the button below to randomly select winners from the loaded list.
                  </p>
                  <button 
                    onClick={pickWinner}
                    disabled={participants.length === 0}
                    className="btn-primary disabled:opacity-50"
                  >
                    Pick Winner Now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
