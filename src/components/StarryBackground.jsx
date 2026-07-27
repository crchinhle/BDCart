import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function StarryBackground({ scene = 1 }) {
  // Generate random twinkling stars
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
      color: Math.random() > 0.3 ? '#FFFFFF' : Math.random() > 0.5 ? '#FEF3C7' : '#FBBF24',
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic gradients based on current scene */}
      <div 
        className={`absolute inset-0 transition-colors duration-1000 ${
          scene === 1 
            ? 'bg-gradient-to-br from-[#0A0A1A] via-[#1A103C] to-[#0A0A1A]' 
            : scene === 2 
            ? 'bg-gradient-to-b from-[#130B2A] via-[#1F1445] to-[#0D071F]'
            : 'bg-gradient-to-tr from-[#050512] via-[#160B30] to-[#25124D]'
        }`}
      />

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle shooting star animation */}
      <motion.div
        className="absolute top-1/4 left-1/4 h-[2px] w-[100px] bg-gradient-to-r from-transparent via-amber-200 to-white transform -rotate-45"
        initial={{ opacity: 0, x: -200, y: -200 }}
        animate={{
          opacity: [0, 1, 0],
          x: [0, 400],
          y: [0, 400],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 7,
          ease: "easeOut",
        }}
      />
    </div>
  );
}
