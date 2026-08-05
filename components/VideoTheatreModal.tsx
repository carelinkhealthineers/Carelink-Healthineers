import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX, 
  Tv, Info, ShieldCheck, Sparkles, ChevronLeft, ChevronRight, Share2, Check
} from 'lucide-react';
import { parseVideoUrl, VideoItem } from '../utils/videoUtils';

interface VideoTheatreModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem | null;
  playlist?: VideoItem[];
  onSelectVideo?: (video: VideoItem) => void;
}

export const VideoTheatreModal: React.FC<VideoTheatreModalProps> = ({
  isOpen,
  onClose,
  video,
  playlist = [],
  onSelectVideo
}) => {
  const [isTheatreExpanded, setIsTheatreExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const parsed = parseVideoUrl(video.video_url);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(video.video_url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentIndex = playlist.findIndex(v => v.video_url === video.video_url);

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/95 backdrop-blur-2xl p-2 sm:p-4 selection:bg-blue-600 selection:text-white"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        
        {/* Glow ambient background element */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(37,99,235,0.15),transparent_60%)] pointer-events-none" />

        <div className="flex min-h-full items-center justify-center py-2 sm:py-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.3 }}
            className={`relative w-full ${isTheatreExpanded ? 'max-w-6xl' : 'max-w-4xl'} max-h-[90vh] sm:max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 z-10 shrink-0`}
          >
            {/* Top Bar / Controls */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/95 border-b border-slate-800 text-white z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Tv size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-400 truncate">
                      {video.badge || 'Product Video Showcase'}
                    </span>
                    {video.duration && (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-mono rounded shrink-0 hidden sm:inline-block">
                        {video.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
                    {video.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => setIsTheatreExpanded(!isTheatreExpanded)}
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    isTheatreExpanded 
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Toggle Fullscreen Width"
                >
                  {isTheatreExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  <span>{isTheatreExpanded ? 'Normal' : 'Wide'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="p-2 sm:p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 hover:border-slate-600 transition-all"
                  title="Copy Video Link"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 sm:p-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/30 transition-all ml-1"
                  title="Close Video (ESC)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main Video View Canvas */}
            <div className="relative bg-black w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full max-h-[55vh] sm:max-h-[60vh] aspect-video mx-auto relative flex items-center justify-center">
                {parsed.type === 'youtube' || parsed.type === 'vimeo' || parsed.type === 'iframe' ? (
                  <iframe 
                    src={parsed.embedUrl}
                    title={video.title}
                    className="w-full h-full border-0 aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={parsed.embedUrl}
                    poster={video.thumbnail_url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain max-h-[55vh] sm:max-h-[60vh] bg-black"
                  />
                )}

                {/* Playlist Navigation Overlay Buttons */}
                {playlist.length > 1 && (
                  <>
                    <button
                      disabled={currentIndex <= 0}
                      onClick={() => currentIndex > 0 && onSelectVideo && onSelectVideo(playlist[currentIndex - 1])}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700/60 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-xl backdrop-blur-md z-20"
                      title="Previous Video"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      disabled={currentIndex < 0 || currentIndex >= playlist.length - 1}
                      onClick={() => currentIndex < playlist.length - 1 && onSelectVideo && onSelectVideo(playlist[currentIndex + 1])}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700/60 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-xl backdrop-blur-md z-20"
                      title="Next Video"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>

          {/* Video Narrative & Details Accordion / Footer */}
          <div className="bg-slate-950 p-4 sm:p-6 border-t border-slate-800 space-y-3 shrink-0 max-h-[30vh] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-md">
                    {video.badge || 'Product Video'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    1080p HD Video
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-xl">{video.title}</h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold uppercase tracking-wider rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Info size={13} className="text-blue-400" />
                  <span>{showDetails ? 'Hide Details' : 'Overview'}</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pt-3 border-t border-slate-900 overflow-hidden"
                >
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-400">
                      <Sparkles size={13} /> Product Overview
                    </div>
                    <p className="font-medium text-slate-300">
                      {video.details || "Experience the specifications, operational setup, and performance of Carelink Healthineers medical technology in full HD resolution."}
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-1">
                        <ShieldCheck size={13} className="text-emerald-400" /> Certified Product
                      </div>
                      <div className="flex items-center gap-1">
                        <Tv size={13} className="text-blue-400" /> Desktop & Mobile Ready
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Playlist Carousel inside Theatre Mode */}
            {playlist.length > 1 && (
              <div className="pt-3 border-t border-slate-900">
                <div className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">
                  More Product Videos ({playlist.length})
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {playlist.map((item, idx) => {
                    const isSelected = item.video_url === video.video_url;
                    return (
                      <button
                        key={idx}
                        onClick={() => onSelectVideo && onSelectVideo(item)}
                        className={`flex items-center gap-2.5 p-2 pr-3 rounded-xl border text-left shrink-0 transition-all max-w-[240px] ${
                          isSelected 
                            ? 'bg-blue-600/20 border-blue-500/60 text-white' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="relative w-14 h-9 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                          {item.thumbnail_url ? (
                            <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800">
                              <Play size={12} className="text-slate-400" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                              <Play size={12} className="text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="truncate min-w-0">
                          <span className="block text-xs font-bold truncate text-white">{item.title}</span>
                          <span className="block text-[9px] font-mono text-slate-400">{item.duration || 'Demo Video'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
