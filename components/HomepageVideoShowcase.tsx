import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Tv, Sparkles, ShieldCheck, Info, Film, 
  ChevronRight, ArrowUpRight, Settings, CheckCircle2
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { VideoItem, getAutoThumbnail } from '../utils/videoUtils';
import { VideoTheatreModal } from './VideoTheatreModal';
import { Link } from 'react-router-dom';

export const DEFAULT_HOMEPAGE_VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    title: "Siemens Magnetom Lumina 3.0T MRI Clinical Workflow & Scanning",
    badge: "Imaging & Radiology",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
    duration: "04:15",
    details: "Watch the BioMatrix patient sensors in real-time, zero helium boil-off mechanics, and 3T high-resolution neuro-imaging capabilities."
  },
  {
    id: "vid-2",
    title: "Mindray BeneVision N22 Critical Care Vital Telemetry Monitor",
    badge: "ICU & Telemetry",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    duration: "03:40",
    details: "Demonstrates 64-channel live telemetry waveforms, rotatable 22-inch multi-touch screen, and HL7 EMR auto-synchronization."
  },
  {
    id: "vid-3",
    title: "Dürr Dental VistaScan Mini View 2 Installation & Operation",
    badge: "Dental Division",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
    duration: "05:10",
    details: "Step-by-step installation of image plate scanner technology, high-resolution AI diagnostics, and chairside clinical integration."
  },
  {
    id: "vid-4",
    title: "Operating Suite C-Arm Mobile Surgical Imaging System Demo",
    badge: "Surgical Suite",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80",
    duration: "06:25",
    details: "Observe pulse-dose radiation reduction, 20 kW high-frequency output generator, and dual red laser target positioning during surgical procedures."
  }
];

export const HomepageVideoShowcase: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_HOMEPAGE_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<VideoItem>(DEFAULT_HOMEPAGE_VIDEOS[0]);
  const [isTheatreOpen, setIsTheatreOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchHomepageVideos = async () => {
      try {
        // Check if user is admin
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
          if (profile?.role === 'admin') setIsAdmin(true);
        }

        // Fetch videos from settings table
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'homepage_videos')
          .single();

        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setVideos(parsed);
              setActiveVideo(parsed[0]);
            }
          } catch (e) {
            console.error("Failed to parse homepage_videos setting JSON", e);
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic homepage videos, fallback active", err);
      }
    };

    fetchHomepageVideos();
  }, []);

  const openTheatre = (vid: VideoItem) => {
    setActiveVideo(vid);
    setIsTheatreOpen(true);
  };

  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden border-y border-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Cinematic ambient background lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.15),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
              <Film size={12} /> Product Video Demonstrations
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif-classical">
              Product <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Video Demos</span>
            </h2>
            <p className="text-slate-400 text-base font-medium leading-relaxed">
              Watch real product demonstrations, equipment setup guides, and clinical workflows in high definition.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {isAdmin && (
              <Link 
                to="/command-nexus/settings?tab=videos" 
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-sm"
              >
                <Settings size={14} className="text-blue-400" />
                <span>Edit Videos in Admin</span>
              </Link>
            )}
            <button
              onClick={() => openTheatre(activeVideo)}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-lg shadow-blue-600/25"
            >
              <Tv size={16} />
              <span>Watch Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Featured Landscape Main Player Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-16">
          
          {/* Main Landscape Video Preview */}
          <div className="lg:col-span-8 group relative rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="aspect-[16/9] w-full relative overflow-hidden bg-black cursor-pointer" onClick={() => openTheatre(activeVideo)}>
              <img 
                src={getAutoThumbnail(activeVideo.video_url, activeVideo.thumbnail_url) || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'} 
                alt={activeVideo.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Glowing Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 border border-white/20 backdrop-blur-md transition-all"
                >
                  <Play size={36} className="fill-white ml-1" />
                </motion.div>
              </div>

              {/* Top Badges */}
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <span className="px-3.5 py-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md">
                  {activeVideo.badge || 'Featured Showcase'}
                </span>
                {activeVideo.duration && (
                  <span className="px-3.5 py-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-slate-300 text-[10px] font-mono rounded-xl">
                    {activeVideo.duration}
                  </span>
                )}
              </div>

              {/* Bottom Details Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    <CheckCircle2 size={13} /> 4K Ultra HD Video
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
                    {activeVideo.title}
                  </h3>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shrink-0">
                  <span>Watch Video</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>

            {/* Video Details & Overview Paragraph */}
            <div className="p-6 bg-slate-900 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                  <Sparkles size={12} /> Video Overview
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                  {activeVideo.details || "Watch product demonstrations, operational setup, and clinical workflow procedures."}
                </p>
              </div>

              <button
                onClick={() => openTheatre(activeVideo)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-widest rounded-xl border border-slate-700 shrink-0 self-start sm:self-auto transition-colors"
              >
                Watch Fullscreen
              </button>
            </div>
          </div>

          {/* Playlist & Secondary Landscape Videos List */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Product Videos ({videos.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-500">CLICK TO PLAY</span>
            </div>

            <div className="space-y-3.5 overflow-y-auto max-h-[580px] custom-scrollbar pr-1">
              {videos.map((vid, idx) => {
                const isActive = vid.video_url === activeVideo.video_url;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveVideo(vid)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center group ${
                      isActive 
                        ? 'bg-blue-600/15 border-blue-500/60 shadow-lg' 
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative w-28 h-20 rounded-xl bg-black overflow-hidden shrink-0 border border-slate-800">
                      <img 
                        src={vid.thumbnail_url} 
                        alt={vid.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-white/20 text-white group-hover:bg-blue-600'} transition-all`}>
                          <Play size={14} className="fill-current ml-0.5" />
                        </div>
                      </div>
                      {vid.duration && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[8px] font-mono text-slate-300 rounded">
                          {vid.duration}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="px-2 py-0.5 bg-slate-800 text-blue-400 text-[9px] font-bold uppercase tracking-widest rounded-md inline-block">
                        {vid.badge || 'Product Video'}
                      </span>
                      <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {vid.title}
                      </h4>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openTheatre(vid); }}
                        className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 flex items-center gap-1 pt-1"
                      >
                        Watch Video <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Global Theatre Mode Modal */}
      <VideoTheatreModal 
        isOpen={isTheatreOpen}
        onClose={() => setIsTheatreOpen(false)}
        video={activeVideo}
        playlist={videos}
        onSelectVideo={(v) => setActiveVideo(v)}
      />
    </section>
  );
};
