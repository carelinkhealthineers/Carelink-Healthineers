
import React from 'react';
import { motion } from 'framer-motion';

export const HUDOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[45] overflow-hidden">
      {/* HUD Borders */}
      <div className="absolute top-8 left-8 w-32 h-32 border-l-2 border-t-2 border-white/5" />
      <div className="absolute top-8 right-8 w-32 h-32 border-r-2 border-t-2 border-white/5" />
      <div className="absolute bottom-8 left-8 w-32 h-32 border-l-2 border-b-2 border-white/5" />
      <div className="absolute bottom-8 right-8 w-32 h-32 border-r-2 border-b-2 border-white/5" />

      {/* Grid Pattern in corners */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.05),transparent)]" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_100%,rgba(99,102,241,0.05),transparent)]" />
    </div>
  );
};
