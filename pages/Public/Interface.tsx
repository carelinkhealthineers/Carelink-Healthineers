
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Zap, 
  Copy, 
  Check, 
  Plus, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { LiveKitVideoConsultation } from '../../components/LiveKitVideoConsultation';

export const Interface: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { roomCode } = useParams<{ roomCode?: string }>();
  const navigate = useNavigate();

  const queryRoom = searchParams.get('room') || roomCode;
  const isInstantParam = searchParams.get('instant') === 'true';

  const [inputRoomName, setInputRoomName] = useState(queryRoom || '');
  const [activeRoomName, setActiveRoomName] = useState(
    queryRoom || `Instant-Meeting-${Math.floor(Math.random() * 899 + 100)}`
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (queryRoom) {
      setActiveRoomName(queryRoom);
      setInputRoomName(queryRoom);
    }
  }, [queryRoom]);

  const handleStartInstant = () => {
    const newRoom = `Instant-Meeting-${Math.floor(Math.random() * 899 + 100)}`;
    setActiveRoomName(newRoom);
    setInputRoomName(newRoom);
    setSearchParams({ room: newRoom, instant: 'true' });
  };

  const handleJoinSpecified = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomName.trim()) return;
    const cleanRoom = inputRoomName.trim().replace(/\s+/g, '-');
    setActiveRoomName(cleanRoom);
    setSearchParams({ room: cleanRoom });
  };

  const copyMeetingLink = () => {
    const url = `${window.location.origin}/#/interface?room=${encodeURIComponent(activeRoomName)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen pt-24 pb-16 px-4 md:px-8">
      <SEO 
        title="Instant Video Meeting" 
        description="Launch or join an instant, zero-latency WebRTC video consultation room." 
      />

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Direct Action Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
              <Zap size={12} /> Carelink Instant Meeting
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Instant Video Room: <span className="text-blue-400 font-mono">{activeRoomName}</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium max-w-lg">
              Direct WebRTC consultation space with HD video, noise cancellation, screen share, interactive whiteboard & live chat.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={handleStartInstant}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/20 flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Start New Room
            </button>

            <button
              onClick={copyMeetingLink}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copied ? 'Link Copied!' : 'Share Link'}
            </button>
          </div>
        </div>

        {/* Quick Room Search & Join Bar */}
        <form onSubmit={handleJoinSpecified} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Video size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter room code or title (e.g. Sovereign-Dental-Suite)..."
              value={inputRoomName}
              onChange={(e) => setInputRoomName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Join Room
          </button>
        </form>

        {/* LiveKit Video Consultation Room */}
        <div className="shadow-2xl">
          <LiveKitVideoConsultation
            defaultRoomName={activeRoomName}
            key={activeRoomName}
          />
        </div>

        {/* Security / System Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 py-4 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
          <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400" /> SSL WebRTC Encryption</span>
          <span className="flex items-center gap-2"><Zap size={14} className="text-blue-400" /> Zero Latency Stream</span>
          <span className="flex items-center gap-2"><Sparkles size={14} className="text-indigo-400" /> Interactive Whiteboard Included</span>
        </div>

      </div>
    </div>
  );
};

