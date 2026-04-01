import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (type: 'click' | 'quack' | 'splash' | 'cheer' | 'win') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Background music setup - using a more "kids song" style upbeat track
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'); // Upbeat, playful track
    audio.loop = true;
    audio.volume = 0.15;
    bgMusicRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (bgMusicRef.current) {
      if (isMuted) {
        bgMusicRef.current.pause();
      } else {
        bgMusicRef.current.play().catch(() => {
          console.log('Autoplay blocked');
        });
      }
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted(!isMuted);

  const playSound = (type: string) => {
    if (isMuted) return;
    
    const sounds: Record<string, string> = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      quack: 'https://assets.mixkit.co/active_storage/sfx/1006/1006-preview.mp3',
      splash: 'https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3',
      cheer: 'https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3',
      win: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
      jump: 'https://assets.mixkit.co/active_storage/sfx/1343/1343-preview.mp3', // Playful jump sound
    };

    const audio = new Audio(sounds[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within a SoundProvider');
  return context;
};
