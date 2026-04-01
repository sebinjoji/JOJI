import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Trophy, Gift, Users, Play } from 'lucide-react';
import { useSound } from '../context/SoundContext';

export const LandingPage: React.FC = () => {
  const { playSound } = useSound();

  const features = [
    {
      title: "Duck Race Game 🎮",
      desc: "Interactive 3D-style racing for up to 100 players. Pure chaos, pure fun.",
      icon: <Trophy className="text-brand-purple" />,
      link: "/duck-race"
    },
    {
      title: "Giveaway Picker 🎁",
      desc: "Fairly pick winners from your Facebook contest comments with ease.",
      icon: <Gift className="text-brand-blue" />,
      link: "/giveaway"
    },
    {
      title: "Community Events 🚀",
      desc: "Host viral events that engage your audience and grow your brand.",
      icon: <Users className="text-white" />,
      link: "#"
    }
  ];

  const stats = [
    { label: "Players Joined", value: "125K+" },
    { label: "Winners Picked", value: "12K+" },
    { label: "Games Played", value: "50K+" }
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-6"
          >
            TEAM <span className="neon-text">JOJI</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto"
          >
            Play. Win. Dominate. The premium toolkit for viral gaming and community growth.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              to="/duck-race" 
              className="btn-primary flex items-center gap-2"
              onClick={() => playSound('click')}
            >
              <Play size={20} fill="currentColor" />
              Start Duck Race
            </Link>
            <Link 
              to="/giveaway" 
              className="btn-secondary"
              onClick={() => playSound('click')}
            >
              Pick Giveaway Winner
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card group"
            >
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-white/60 mb-8">{feature.desc}</p>
              <Link 
                to={feature.link} 
                className="text-brand-blue font-bold flex items-center gap-2 hover:underline"
                onClick={() => playSound('click')}
              >
                Learn More →
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div className="text-5xl font-black neon-text mb-2">{stat.value}</div>
              <div className="text-white/50 font-medium uppercase tracking-widest text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
