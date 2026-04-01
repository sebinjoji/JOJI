import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Menu, X } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';

export const Navbar: React.FC = () => {
  const { isMuted, toggleMute, playSound } = useSound();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Duck Race', path: '/duck-race' },
    { name: 'Turtle Race', path: '/turtle-race' },
    { name: 'Giveaway Picker', path: '/giveaway' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-full px-6 py-3">
        <Link 
          to="/" 
          className="text-2xl font-black tracking-tighter neon-text"
          onClick={() => playSound('click')}
        >
          TEAM JOJI
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-blue",
                location.pathname === link.path ? "text-brand-blue" : "text-white/70"
              )}
              onClick={() => playSound('click')}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              toggleMute();
              playSound('click');
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-6 right-6 glass rounded-3xl p-6 flex flex-col gap-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-lg font-medium py-2"
              onClick={() => {
                setIsOpen(false);
                playSound('click');
              }}
            >
              {link.name}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
};
