import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Tv, Sparkles, Film, 
  ChevronRight, ArrowUpRight, Settings, CheckCircle2
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { VideoItem, getAutoThumbnail } from '../utils/videoUtils';
import { VideoTheatreModal } from './VideoTheatreModal';
import { Link } from 'react-router-dom';

export const DEFAULT_HOMEPAGE_VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    title: "Magnetom Lumina 3.0T MRI Overview & Demo",
    badge: "Imaging & Radiology",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_url: "https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/Extron%207_921_5e39e.png",
    duration: "04:15",
    details: "Watch the 3.0T MRI scanner workflow, patient comfort setup, and clear diagnostic imaging."
  },
  {
    id: "vid-2",
    title: "BeneVision N22 Patient Monitor Setup & Features",
    badge: "ICU Systems",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail_url: "https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/931_a8698%20(2).png",
    duration: "03:40",
    details: "See the 22-inch rotatable touch screen and live patient monitoring features in action."
  },
  {
    id: "vid-3",
    title: "C-Arm Mobile Surgical X-Ray System Demo",
    badge: "Surgical Systems",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail_url: "https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/6.Software-03_8675f.png",
    duration: "06:25",
    details: "Demonstration of mobile surgical imaging, low-dose X-ray mode, and easy positioning."
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
          if (profile?.role === 'admin') setIsAdmin(true);
        }

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
    <section className="py-20 bg-white text-slate-900 relative overflow-hidden border-y border-slate-200/70">
      <div className="max-w-[1560px] mx-auto px-6 md:px-16 relative z-10">
        
        {/* Simple Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
              <Film size={12} /> Product Videos
            </div>
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-slate-900 font-serif-classical">
              Watch Equipment <span className="italic text-blue-600 font-serif-classical">Demos</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium">
              See real product videos, setup guides, and how our equipment works.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <Link 
                to="/command-nexus/settings?tab=videos" 
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all"
              >
                <Settings size={14} className="text-blue-600" />
                <span>Edit Videos</span>
              </Link>
            )}
            <button
              onClick={() => openTheatre(activeVideo)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Tv size={15} />
              <span>Watch Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Main Video Player + Playlist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-8 group relative rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-md flex flex-col justify-between">
            <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-100 cursor-pointer flex items-center justify-center" onClick={() => openTheatre(activeVideo)}>
              <img 
                src={getAutoThumbnail(activeVideo.video_url, activeVideo.thumbnail_url) || 'https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/Extron%207_921_5e39e.png'} 
                alt={activeVideo.title} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/15 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl border-4 border-white transition-all"
                >
                  <Play size={30} className="fill-current ml-1" />
                </motion.div>
              </div>

              <div className="absolute top-5 left-5 flex items-center gap-2">
                <span className="px-3 py-1 bg-white/95 border border-slate-200 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                  {activeVideo.badge || 'Product Video'}
                </span>
                {activeVideo.duration && (
                  <span className="px-3 py-1 bg-slate-900/80 text-white text-[10px] font-mono rounded-lg">
                    {activeVideo.duration}
                  </span>
                )}
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    <CheckCircle2 size={12} /> HD Video
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white leading-snug">
                    {activeVideo.title}
                  </h3>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shrink-0">
                  <span>Play</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                {activeVideo.details || "Watch product demonstrations and setup guides."}
              </p>

              <button
                onClick={() => openTheatre(activeVideo)}
                className="px-5 py-2.5 bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 shrink-0 transition-all cursor-pointer"
              >
                Play Video
              </button>
            </div>
          </div>

          {/* Video List */}
          <div className="lg:col-span-4 space-y-4 flex flex-col bg-slate-50 border border-slate-200 rounded-3xl p-5">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                All Videos ({videos.length})
              </h3>
              <span className="text-[10px] font-bold text-blue-600">CLICK TO PLAY</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[480px] custom-scrollbar pr-1">
              {videos.map((vid, idx) => {
                const isActive = vid.video_url === activeVideo.video_url;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveVideo(vid)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center group ${
                      isActive 
                        ? 'bg-white border-blue-500 shadow-sm' 
                        : 'bg-white/70 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="relative w-24 h-18 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center p-1">
                      <img 
                        src={vid.thumbnail_url} 
                        alt={vid.title} 
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain" 
                      />
                      <div className="absolute inset-0 bg-slate-900/15 flex items-center justify-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-white text-slate-900 group-hover:bg-blue-600 group-hover:text-white'} transition-all shadow-xs`}>
                          <Play size={12} className="fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-blue-600 text-[9px] font-bold uppercase tracking-wider block truncate">
                        {vid.badge || 'Video'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                        {vid.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
