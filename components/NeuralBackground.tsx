
import React from 'react';
import { motion } from 'framer-motion';

export const NeuralBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#020408]">
      {/* Animated Grid Lines */}
      <div className="absolute inset-0 neural-grid opacity-20" />
      
      {/* Moving Data Points */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="dataPulse" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Render a few 'moving' clinical data packets */}
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            r="160"
            fill="url(#dataPulse)"
            initial={{ 
              cx: `${Math.random() * 100}%`, 
              cy: `${Math.random() * 100}%` 
            }}
            animate={{ 
              cx: [`${Math.random() * 100}%`, `${Math.random() * 100}%`], 
              cy: [`${Math.random() * 100}%`, `${Math.random() * 100}%`] 
            }}
            transition={{ 
              duration: 25 + Math.random() * 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        ))}
      </svg>

      {/* Background Depth Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#020408_100%)]" />
    </div>
  );
};
