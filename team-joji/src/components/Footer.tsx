import React from 'react';
import { Twitter, Send, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-6 border-t border-white/10 bg-brand-dark">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-black neon-text mb-2">TEAM JOJI</h2>
          <p className="text-white/50 text-sm max-w-xs">
            The ultimate gaming and giveaway platform for creators and communities.
          </p>
        </div>

        <div className="flex gap-6">
          <a href="#" className="p-3 glass rounded-full hover:text-brand-blue transition-colors">
            <Twitter size={20} />
          </a>
          <a href="#" className="p-3 glass rounded-full hover:text-brand-blue transition-colors">
            <Send size={20} />
          </a>
          <a href="#" className="p-3 glass rounded-full hover:text-brand-blue transition-colors">
            <Facebook size={20} />
          </a>
        </div>

        <div className="text-sm text-white/30">
          © {new Date().getFullYear()} TEAM JOJI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
