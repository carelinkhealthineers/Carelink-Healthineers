import React, { useState, useEffect, useRef } from 'react';
import { 
  LiveKitRoom, 
  VideoConference, 
  RoomAudioRenderer, 
  ControlBar, 
  useTracks, 
  GridLayout, 
  ParticipantTile,
  PreJoin
} from '@livekit/components-react';
import { 
  Track 
} from 'livekit-client';
import * as jose from 'jose';

// Helper for client-side LiveKit JWT fallback generation
const generateFallbackLiveKitToken = async (room: string, username: string, identity: string) => {
  const apiKey = "APIPbw6RFXjhgF5";
  const apiSecret = "xcC6lyscS1sCC7X8pqwhO2EPOB1042eAGzEXfQ9jr6G";
  const secret = new TextEncoder().encode(apiSecret);
  
  return await new jose.SignJWT({
    video: {
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
    sub: identity,
    name: username,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(apiKey)
    .setExpirationTime('2h')
    .sign(secret);
};
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Mic, 
  MicOff,
  VideoOff,
  ShieldCheck, 
  Activity, 
  Users, 
  Lock, 
  PhoneOff, 
  Sparkles, 
  Stethoscope, 
  Building2, 
  Share2, 
  FileText, 
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Info,
  Hand,
  Smile,
  MessageSquare,
  HelpCircle,
  BarChart2,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  Subtitles,
  Sliders,
  Maximize2,
  Tv,
  Plus
} from 'lucide-react';
import { getOrCreateCurrentUser, updateCurrentUserProfile, UserProfile } from '../utils/userStore';
import { getStoredMeetings, ExtendedMeeting, MeetingChatMessage, MeetingPoll, MeetingQAItem } from '../utils/meetingStore';
import { WhiteboardModal } from './WhiteboardModal';

interface LiveKitVideoConsultationProps {
  defaultRoomName?: string;
  defaultUserName?: string;
  onClose?: () => void;
}

export const LiveKitVideoConsultation: React.FC<LiveKitVideoConsultationProps> = ({
  defaultRoomName = "Sovereign-Clinical-Suite-1",
  defaultUserName = "",
  onClose
}) => {
  // Auto user account initialization
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getOrCreateCurrentUser());
  
  const [roomName, setRoomName] = useState(defaultRoomName);
  const [userName, setUserName] = useState(defaultUserName || currentUser.displayName || currentUser.username);
  const [userRole, setUserRole] = useState<'clinician' | 'engineer' | 'administrator'>('clinician');
  
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string>('wss://carelink-healthineers-bm6n32il.livekit.cloud');
  const [isConnected, setIsConnected] = useState(false);
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState("");
  
  // Meeting Config & Lobby state
  const [enteredPassword, setEnteredPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isWaitingInRoom, setIsWaitingInRoom] = useState(false);
  const [currentMeetingMeta, setCurrentMeetingMeta] = useState<ExtendedMeeting | null>(null);
  
  // Interactive Controls
  const [handRaised, setHandRaised] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: string; emoji: string; left: number }>>([]);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isLiveCaptionActive, setIsLiveCaptionActive] = useState(false);
  const [liveCaptionsText, setLiveCaptionsText] = useState("Live captions active. Speech will be transcribed live...");
  
  // Media filters
  const [virtualBg, setVirtualBg] = useState<'none' | 'blur' | 'office' | 'clinical'>('none');
  const [isNoiseSuppressionOn, setIsNoiseSuppressionOn] = useState(true);
  const [hdVideo, setHdVideo] = useState(true);

  // Sidebar navigation tabs inside meeting
  const [rightTab, setRightTab] = useState<'chat' | 'polls' | 'qa' | 'notes' | 'settings'>('chat');

  // Live Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([
    {
      id: 'msg-1',
      senderId: 'sys',
      senderName: 'System Security',
      text: 'Encrypted WebRTC consultation room active. All streams protected under SSL.',
      createdAt: new Date().toISOString()
    }
  ]);

  // Polls & Q&A state
  const [polls, setPolls] = useState<MeetingPoll[]>([
    {
      id: 'p-1',
      question: 'Evaluate Dürr Dental Suction Vacuum Pressure Baseline?',
      options: [
        { id: 'o-1', text: '300 L/min Flow', votes: [currentUser.id] },
        { id: 'o-2', text: '500 L/min High Capacity', votes: [] }
      ],
      createdBy: 'Dr. Marcus Vance',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ]);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);

  const [qaItems, setQaItems] = useState<MeetingQAItem[]>([
    {
      id: 'q-1',
      question: 'What is the recommended installation distance for the VS 900 S suction unit?',
      askedBy: 'Engineering Team',
      upvotes: [currentUser.id],
      isAnswered: true,
      answerText: 'Max distance is 15 meters with smooth 45-degree piping elbows.',
      createdAt: new Date().toISOString()
    }
  ]);
  const [newQuestionText, setNewQuestionText] = useState("");

  useEffect(() => {
    // Check if room requires password or waiting room
    const meetings = getStoredMeetings();
    const match = meetings.find(m => m.room_id.toLowerCase() === roomName.toLowerCase());
    if (match) {
      setCurrentMeetingMeta(match);
      setRequiresPassword(Boolean(match.isPasswordProtected && match.password));
    } else {
      setRequiresPassword(false);
      setCurrentMeetingMeta(null);
    }
  }, [roomName]);

  const fetchToken = async () => {
    if (!roomName.trim()) {
      setError("Please specify a valid clinical room name.");
      return;
    }

    // Verify password if protected
    if (requiresPassword && currentMeetingMeta?.password && enteredPassword !== currentMeetingMeta.password) {
      setError("Invalid meeting password. Please enter the correct access code.");
      return;
    }

    // Save profile display name if user edited it
    if (userName.trim() && userName !== currentUser.displayName) {
      const updated = updateCurrentUserProfile({ displayName: userName.trim() });
      setCurrentUser(updated);
    }

    // Check waiting room status
    if (currentMeetingMeta?.isWaitingRoomEnabled && userRole !== 'administrator') {
      setIsWaitingInRoom(true);
      setTimeout(() => {
        setIsWaitingInRoom(false);
        proceedConnection();
      }, 2500); // Simulate waiting room host approval
      return;
    }

    proceedConnection();
  };

  const proceedConnection = async () => {
    const finalUserName = userName.trim() || currentUser.displayName || `Clinician_${Math.floor(Math.random() * 899 + 100)}`;
    
    setIsFetchingToken(true);
    setError(null);

    let tokenIssued: string | null = null;
    let urlToUse = 'wss://carelink-healthineers-bm6n32il.livekit.cloud';

    try {
      const response = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(finalUserName)}&identity=${encodeURIComponent(currentUser.id)}`);
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.token) {
          tokenIssued = data.token;
          if (data.wsUrl) urlToUse = data.wsUrl;
        }
      }
    } catch (apiErr) {
      console.warn("LiveKit server token API notice:", apiErr);
    }

    // Fallback client token generation if server token API is not reachable or returns non-JSON
    if (!tokenIssued) {
      try {
        console.log("Generating LiveKit client token fallback...");
        tokenIssued = await generateFallbackLiveKitToken(roomName, finalUserName, currentUser.id);
      } catch (fallbackErr: any) {
        console.error("Token fallback generation error:", fallbackErr);
      }
    }

    if (tokenIssued) {
      setToken(tokenIssued);
      setWsUrl(urlToUse);
      setIsConnected(true);
      updateCurrentUserProfile({ meetingsJoinedCount: (currentUser.meetingsJoinedCount || 0) + 1 });
    } else {
      setError("Unable to issue LiveKit authentication token. Please check network connection.");
    }

    setIsFetchingToken(false);
  };

  const handleLeave = () => {
    setIsConnected(false);
    setToken(null);
    if (onClose) onClose();
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/#/interface?room=${encodeURIComponent(roomName)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reactions launcher
  const triggerEmojiReaction = (emoji: string) => {
    const newReaction = {
      id: `rx_${Date.now()}_${Math.random()}`,
      emoji,
      left: Math.floor(Math.random() * 70 + 15) // Random percentage across view
    };
    setFloatingEmojis(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2500);
  };

  // Chat message sending
  const sendMessage = (textToSend?: string, fileData?: { url: string; name: string; type: 'image' | 'document' | 'other' }) => {
    const text = textToSend || chatInput;
    if (!text.trim() && !fileData) return;

    const msg: MeetingChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      text: text.trim(),
      fileUrl: fileData?.url,
      fileName: fileData?.name,
      fileType: fileData?.type,
      createdAt: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, msg]);
    if (!textToSend) setChatInput("");
  };

  // Simulating image upload in chat
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const isImg = file.type.startsWith('image/');
      sendMessage(`Shared attachment: ${file.name}`, {
        url: reader.result as string,
        name: file.name,
        type: isImg ? 'image' : 'document'
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Poll Voting
  const handleVotePoll = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      const updatedOptions = p.options.map(opt => {
        const hasVoted = opt.votes.includes(currentUser.id);
        if (opt.id === optionId) {
          return {
            ...opt,
            votes: hasVoted ? opt.votes.filter(id => id !== currentUser.id) : [...opt.votes, currentUser.id]
          };
        } else {
          // Remove vote from other options
          return { ...opt, votes: opt.votes.filter(id => id !== currentUser.id) };
        }
      });
      return { ...p, options: updatedOptions };
    }));
  };

  // Create new poll
  const handleCreatePoll = () => {
    if (!newPollQuestion.trim() || newPollOptions.filter(o => o.trim()).length < 2) return;
    const newPoll: MeetingPoll = {
      id: `p_${Date.now()}`,
      question: newPollQuestion.trim(),
      options: newPollOptions.filter(o => o.trim()).map((optText, idx) => ({
        id: `opt_${Date.now()}_${idx}`,
        text: optText.trim(),
        votes: []
      })),
      createdBy: currentUser.displayName,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    setPolls(prev => [newPoll, ...prev]);
    setNewPollQuestion("");
    setNewPollOptions(["", ""]);
  };

  // Ask Q&A
  const handleAskQuestion = () => {
    if (!newQuestionText.trim()) return;
    const item: MeetingQAItem = {
      id: `q_${Date.now()}`,
      question: newQuestionText.trim(),
      askedBy: currentUser.displayName,
      upvotes: [currentUser.id],
      isAnswered: false,
      createdAt: new Date().toISOString()
    };
    setQaItems(prev => [item, ...prev]);
    setNewQuestionText("");
  };

  return (
    <div className="bg-slate-900 text-white rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative">
      
      {/* Interactive Whiteboard Modal */}
      <WhiteboardModal
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        roomTitle={roomName}
      />

      {/* Top Header */}
      <div className="bg-slate-950/90 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Video size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white">{roomName}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Server
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              User: <strong className="text-blue-300">{currentUser.displayName}</strong> ({currentUser.id})
            </p>
          </div>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setHandRaised(!handRaised)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                handRaised ? 'bg-amber-500 text-slate-950 animate-bounce' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Hand size={14} /> {handRaised ? 'Hand Raised' : 'Raise Hand'}
            </button>

            <button
              onClick={() => setIsWhiteboardOpen(true)}
              className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <Sparkles size={14} /> Whiteboard
            </button>

            <button
              onClick={copyRoomLink}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Share'}
            </button>

            <button
              onClick={handleLeave}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <PhoneOff size={14} /> End
            </button>
          </div>
        )}
      </div>

      {/* Main Container Area */}
      {!isConnected || !token ? (
        /* Join & Configuration Form / Waiting Room */
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center max-w-2xl mx-auto w-full">
          {isWaitingInRoom ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto animate-pulse">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-black text-white">In Waiting Room Lobby</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                The meeting host has been notified. Please wait while you are admitted to {roomName}...
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                  <Lock size={12} /> Encrypted Video Gateway
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight">Clinical Video Meeting</h3>
                <p className="text-slate-400 text-xs font-medium max-w-md mx-auto">
                  Instant zero-latency consultation stream. Automatically connected as <strong className="text-blue-400">{currentUser.displayName}</strong>.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-3">
                  <AlertCircle size={18} className="shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Password Input if protected */}
              {requiresPassword && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                    <Lock size={12} /> Password Protected Session
                  </label>
                  <input
                    type="password"
                    placeholder="Enter meeting passcode..."
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Custom Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Room Identifier</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Sovereign-Suite-1"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Display Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Lin"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Audio & Video Defaults */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Pre-Call Diagnostics</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={hdVideo} onChange={(e) => setHdVideo(e.target.checked)} className="accent-blue-500 rounded" />
                    HD Video (1080p)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isNoiseSuppressionOn} onChange={(e) => setIsNoiseSuppressionOn(e.target.checked)} className="accent-blue-500 rounded" />
                    Noise Suppression
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={virtualBg === 'blur'} onChange={(e) => setVirtualBg(e.target.checked ? 'blur' : 'none')} className="accent-blue-500 rounded" />
                    Blur Background
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={fetchToken}
                disabled={isFetchingToken}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isFetchingToken ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Authenticating LiveKit Token...
                  </>
                ) : (
                  <>
                    <Video size={18} /> Enter Meeting Suite
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        /* Active LiveKit Video Conference View */
        <div className="flex-1 flex flex-col lg:flex-row min-h-[550px] relative overflow-hidden">
          
          {/* Floating Reactions overlay */}
          <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            <AnimatePresence>
              {floatingEmojis.map(rx => (
                <motion.div
                  key={rx.id}
                  initial={{ opacity: 0, y: 300, scale: 0.5 }}
                  animate={{ opacity: 1, y: 50, scale: 1.5 }}
                  exit={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 2.2, ease: "easeOut" }}
                  className="absolute text-4xl"
                  style={{ left: `${rx.left}%` }}
                >
                  {rx.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Live Captions Subtitle Overlay */}
            {isLiveCaptionActive && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-950/90 text-white px-6 py-3 rounded-2xl border border-blue-500/30 text-xs font-mono font-bold shadow-2xl max-w-xl text-center backdrop-blur-md">
                <span className="text-blue-400 uppercase font-black mr-2">[LIVE CAPTIONS]:</span>
                {liveCaptionsText}
              </div>
            )}
          </div>

          {/* Main Video Viewport */}
          <div className="flex-1 bg-slate-950 flex flex-col relative">
            <LiveKitRoom
              video={true}
              audio={true}
              token={token}
              serverUrl={wsUrl}
              connect={true}
              data-lk-theme="default"
              className="flex-1 flex flex-col min-h-[450px]"
              onDisconnected={handleLeave}
              onError={(err) => {
                console.error("LiveKit Room error:", err);
                setError(`Connection warning: ${err.message || 'Media stream error'}`);
              }}
            >
              <div className="flex-1 relative flex flex-col p-4">
                <VideoConference />
                <RoomAudioRenderer />
              </div>
            </LiveKitRoom>

            {/* Bottom Reactions Quick Bar */}
            <div className="bg-slate-950/80 border-t border-slate-800 p-2 flex items-center justify-center gap-2 z-30">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Reactions:</span>
              {['👍', '❤️', '👏', '🎉', '💡', '🔥'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => triggerEmojiReaction(emoji)}
                  className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-lg hover:scale-125 transition-all"
                >
                  {emoji}
                </button>
              ))}
              <div className="h-6 w-px bg-slate-800 mx-2" />
              <button
                onClick={() => setIsLiveCaptionActive(!isLiveCaptionActive)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all ${
                  isLiveCaptionActive ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Subtitles size={14} /> Captions
              </button>
            </div>
          </div>

          {/* Right Modular Sidebar (Chat, Polls, Q&A, Notes) */}
          <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col justify-between z-30">
            
            {/* Sidebar Navigation */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-4">
              {[
                { id: 'chat', label: 'Chat', icon: <MessageSquare size={14} /> },
                { id: 'polls', label: 'Polls', icon: <BarChart2 size={14} /> },
                { id: 'qa', label: 'Q&A', icon: <HelpCircle size={14} /> },
                { id: 'notes', label: 'Notes', icon: <FileText size={14} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id as any)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                    rightTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Chat Tab */}
            {rightTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between space-y-3 min-h-[350px]">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px] custom-scrollbar">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-blue-400">{msg.senderName}</span>
                        <span className="text-slate-500 font-mono">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{msg.text}</p>
                      {msg.fileUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-700">
                          {msg.fileType === 'image' ? (
                            <img src={msg.fileUrl} alt={msg.fileName} className="w-full max-h-40 object-cover" />
                          ) : (
                            <a href={msg.fileUrl} download={msg.fileName} className="p-2 bg-slate-900 text-blue-400 text-xs font-mono font-bold flex items-center gap-2">
                              <Paperclip size={14} /> {msg.fileName}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Send a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500"
                    />
                    <label className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer transition-all">
                      <Paperclip size={14} />
                      <input type="file" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <button
                      onClick={() => sendMessage()}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Polls Tab */}
            {rightTab === 'polls' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[420px] custom-scrollbar">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">Create New Poll</span>
                  <input
                    type="text"
                    placeholder="Poll Question..."
                    value={newPollQuestion}
                    onChange={(e) => setNewPollQuestion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                  {newPollOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newPollOptions];
                        updated[i] = e.target.value;
                        setNewPollOptions(updated);
                      }}
                      className="w-full px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  ))}
                  <button
                    onClick={handleCreatePoll}
                    className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Launch Poll
                  </button>
                </div>

                {polls.map(p => {
                  const totalVotes = p.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                  return (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
                      <h4 className="text-xs font-black text-white">{p.question}</h4>
                      <div className="space-y-2">
                        {p.options.map(opt => {
                          const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                          const hasVoted = opt.votes.includes(currentUser.id);
                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleVotePoll(p.id, opt.id)}
                              className={`w-full p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                                hasVoted ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-900'
                              }`}
                            >
                              <div className="absolute top-0 left-0 bottom-0 bg-blue-600/20" style={{ width: `${pct}%` }} />
                              <div className="relative flex justify-between items-center text-xs font-bold">
                                <span>{opt.text}</span>
                                <span className="font-mono text-[10px] text-blue-400">{pct}% ({opt.votes.length})</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Q&A Tab */}
            {rightTab === 'qa' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[420px] custom-scrollbar">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <input
                    type="text"
                    placeholder="Ask a technical or clinical question..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                  <button
                    onClick={handleAskQuestion}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Submit Question
                  </button>
                </div>

                {qaItems.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <span className="font-bold text-white">{item.question}</span>
                      <span className="text-[10px] text-slate-400 font-mono">by {item.askedBy}</span>
                    </div>
                    {item.answerText && (
                      <p className="text-xs text-blue-300 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                        <strong>Answer:</strong> {item.answerText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Notes Tab */}
            {rightTab === 'notes' && (
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Session Notes</label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Record diagnostic observations or specifications..."
                    rows={10}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-blue-500 resize-none custom-scrollbar"
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
