import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Users, 
  BarChart2, 
  Sliders, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  Play, 
  Lock, 
  Unlock, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  Sparkles, 
  Activity, 
  Zap, 
  ExternalLink,
  Shield,
  RefreshCw,
  Mail,
  Edit2,
  X,
  Globe,
  Radio,
  Cpu,
  Wifi,
  ArrowRight,
  Server
} from 'lucide-react';
import { LiveKitVideoConsultation } from '../../components/LiveKitVideoConsultation';
import { SEO } from '../../components/SEO';
import { 
  getStoredUsers, 
  saveUsers, 
  banOrUnbanUser, 
  deleteUserAccount, 
  UserProfile 
} from '../../utils/userStore';
import { 
  getStoredMeetings, 
  saveMeetings, 
  toggleFavouriteMeeting, 
  getDefaultSettings, 
  saveSettings, 
  ExtendedMeeting, 
  AdminMeetingSettings 
} from '../../utils/meetingStore';

export const MeetingControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'users' | 'analytics' | 'settings'>('meetings');
  const [meetings, setMeetings] = useState<ExtendedMeeting[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettingsState] = useState<AdminMeetingSettings>(getDefaultSettings());
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<ExtendedMeeting | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled' | 'favourite'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Meeting Form State
  const [formData, setFormData] = useState({
    title: '',
    host_name: 'Dr. Marcus Vance',
    client_name: '',
    scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
    notes: '',
    room_id: '',
    isPasswordProtected: settings.defaultPasswordProtected,
    password: '',
    isWaitingRoomEnabled: settings.defaultWaitingRoom,
    maxParticipants: settings.defaultMaxParticipants
  });

  const loadData = () => {
    setMeetings(getStoredMeetings());
    setUsers(getStoredUsers());
    setSettingsState(getDefaultSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const getDomainLink = (roomId: string) => {
    return `${window.location.origin}/#/interface?room=${encodeURIComponent(roomId)}`;
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24);
    const generatedRoomId = formData.room_id.trim() || `Consult-${slug}-${Math.floor(Math.random() * 899 + 100)}`;
    
    const newMeeting: ExtendedMeeting = {
      id: `mtg-${Date.now()}`,
      room_id: generatedRoomId,
      title: formData.title,
      host_name: formData.host_name,
      client_name: formData.client_name || 'Medical Facility Client',
      scheduled_at: formData.scheduled_at,
      status: 'scheduled',
      notes: formData.notes,
      created_at: new Date().toISOString(),
      isPasswordProtected: formData.isPasswordProtected,
      password: formData.password,
      isWaitingRoomEnabled: formData.isWaitingRoomEnabled,
      maxParticipants: formData.maxParticipants,
      isFavourite: false
    };

    const updated = [newMeeting, ...meetings];
    setMeetings(updated);
    saveMeetings(updated);
    setShowCreateModal(false);
    triggerToast('New meeting scheduled successfully.');

    // Reset Form
    setFormData({
      title: '',
      host_name: 'Dr. Marcus Vance',
      client_name: '',
      scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
      notes: '',
      room_id: '',
      isPasswordProtected: settings.defaultPasswordProtected,
      password: '',
      isWaitingRoomEnabled: settings.defaultWaitingRoom,
      maxParticipants: settings.defaultMaxParticipants
    });
  };

  const handleDeleteMeeting = (id: string) => {
    if (!confirm('Remove this meeting entry?')) return;
    const filtered = meetings.filter(m => m.id !== id);
    setMeetings(filtered);
    saveMeetings(filtered);
    triggerToast('Meeting entry removed.');
  };

  const handleToggleFav = (id: string) => {
    const updated = toggleFavouriteMeeting(id);
    setMeetings(updated);
  };

  const handleBanToggle = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'banned' ? 'active' : 'banned';
    const updated = banOrUnbanUser(userId, nextStatus);
    setUsers(updated);
    triggerToast(`User account status set to ${nextStatus}.`);
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Permanently remove user account?')) return;
    const updated = deleteUserAccount(userId);
    setUsers(updated);
    triggerToast('User account deleted.');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    triggerToast('Meeting configurations saved.');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerToast('Link copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalUsersCount = users.length;
  const totalMeetingsCount = meetings.length;
  const activeMeetingsCount = meetings.filter(m => m.status === 'active').length;

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.room_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.host_name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'active') return m.status === 'active';
      if (statusFilter === 'scheduled') return m.status === 'scheduled';
      if (statusFilter === 'favourite') return m.isFavourite;
      return true;
    });
  }, [meetings, searchQuery, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [users, userSearchQuery]);

  return (
    <div className="space-y-8 font-sans">
      <SEO title="Tele-Consultation Manager" description="Manage video consultation rooms, users, and LiveKit settings." />

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2.5"
          >
            <Check size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Card */}
      <div className="p-8 rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-[11px] font-mono uppercase tracking-wider">
              <Radio size={12} className="animate-pulse text-blue-400" />
              <span>LiveKit WebRTC Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Tele-Consultation Manager</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              Schedule live video consultations, manage user access permissions, and configure real-time streaming parameters.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700/60 transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> New Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registered Users</span>
            <Users size={18} className="text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalUsersCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Auto-created & verified accounts</div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Meetings</span>
            <Video size={18} className="text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalMeetingsCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Scheduled and archived rooms</div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Live Rooms</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{activeMeetingsCount}</div>
          <div className="text-[11px] font-medium text-emerald-600/80">Real-time WebRTC sessions</div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gateway Status</span>
            <Wifi size={18} className="text-emerald-500" />
          </div>
          <div className="text-base font-bold text-slate-900 truncate">LiveKit Cloud Active</div>
          <div className="text-[11px] font-mono text-slate-500">SSL Encrypted Stream</div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'meetings', label: 'Consultation Rooms', icon: <Video size={16} />, count: totalMeetingsCount },
          { id: 'users', label: 'Users & Access', icon: <Users size={16} />, count: totalUsersCount },
          { id: 'analytics', label: 'Network Analytics', icon: <BarChart2 size={16} /> },
          { id: 'settings', label: 'Room Settings', icon: <Sliders size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Launched Meeting Player Viewport */}
      <AnimatePresence>
        {activeMeeting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 rounded-[2.5rem] bg-slate-950 border border-slate-800 shadow-2xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <h3 className="text-lg font-bold text-white">{activeMeeting.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">Room ID: {activeMeeting.room_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyToClipboard(getDomainLink(activeMeeting.room_id), activeMeeting.id)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copiedId === activeMeeting.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedId === activeMeeting.id ? 'Link Copied' : 'Copy Room Link'}</span>
                </button>
                <button
                  onClick={() => setActiveMeeting(null)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Leave Meeting
                </button>
              </div>
            </div>

            <LiveKitVideoConsultation
              defaultRoomName={activeMeeting.room_id}
              defaultUserName={activeMeeting.host_name}
              onClose={() => setActiveMeeting(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 1: MEETINGS & ROOMS */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, host, client, or room ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'all', label: 'All Rooms' },
                { id: 'active', label: 'Active Live' },
                { id: 'scheduled', label: 'Scheduled' },
                { id: 'favourite', label: 'Starred' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Cards List */}
          <div className="space-y-4">
            {filteredMeetings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Video size={36} className="mx-auto text-slate-300" />
                <h4 className="text-base font-bold text-slate-700">No consultation rooms found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query or filter settings, or schedule a new meeting.
                </p>
              </div>
            ) : (
              filteredMeetings.map((meeting) => {
                const domainLink = getDomainLink(meeting.room_id);
                return (
                  <div key={meeting.id} className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleToggleFav(meeting.id)}
                            className="text-slate-300 hover:text-amber-400 transition-colors"
                            title="Toggle favorite"
                          >
                            <Star size={18} fill={meeting.isFavourite ? "#f59e0b" : "none"} className={meeting.isFavourite ? "text-amber-500" : ""} />
                          </button>

                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-mono font-bold border border-blue-100">
                            {meeting.room_id}
                          </span>

                          {meeting.status === 'active' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              Active Live
                            </span>
                          )}

                          {meeting.isPasswordProtected && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200 flex items-center gap-1">
                              <Lock size={11} /> Passcode Protected
                            </span>
                          )}

                          {meeting.isWaitingRoomEnabled && (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-200">
                              Waiting Room
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 leading-snug">{meeting.title}</h3>

                        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                          <span>Host: <strong className="text-slate-800">{meeting.host_name}</strong></span>
                          <span>Client: <strong className="text-slate-800">{meeting.client_name}</strong></span>
                          <span>Time: <strong className="text-slate-800">{new Date(meeting.scheduled_at).toLocaleString()}</strong></span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 font-mono text-xs">
                          <div className="truncate text-blue-300">{domainLink}</div>
                          <button
                            onClick={() => copyToClipboard(domainLink, meeting.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shrink-0 transition-colors"
                          >
                            {copiedId === meeting.id ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      </div>

                      <div className="flex lg:flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveMeeting(meeting)}
                          className="w-full lg:w-40 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                        >
                          <Play size={14} fill="currentColor" /> Launch Call
                        </button>

                        <a
                          href={domainLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full lg:w-40 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ExternalLink size={14} /> Open Tab
                        </a>

                        <button
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete meeting"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or ID..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Accounts Registered: <strong className="text-slate-900">{users.length}</strong>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4">User</th>
                    <th className="p-4">ID</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Meetings</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0"
                          style={{ backgroundColor: user.avatarColor || '#2563eb' }}
                        >
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.displayName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">@{user.username}</div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-500">{user.id}</td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          user.status === 'banned'
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>
                          {user.status}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-800">{user.meetingsJoinedCount || 0}</td>

                      <td className="p-4 text-[10px] text-slate-400 font-mono">
                        {new Date(user.lastLoginAt).toLocaleString()}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleBanToggle(user.id, user.status)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                            user.status === 'banned'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {user.status === 'banned' ? 'Unban' : 'Ban'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NETWORK ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Consultation Time</span>
              <div className="text-3xl font-extrabold text-slate-900">48.5 Hours</div>
              <p className="text-xs text-emerald-600 font-semibold">+12% increase this week</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Room Capacity</span>
              <div className="text-3xl font-extrabold text-slate-900">4.2 Users</div>
              <p className="text-xs text-blue-600 font-semibold">Optimal Bandwidth Efficiency</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Streaming Quality Score</span>
              <div className="text-3xl font-extrabold text-emerald-600">99.8%</div>
              <p className="text-xs text-slate-500 font-mono">LiveKit WebRTC Benchmark</p>
            </div>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">LiveKit WebRTC Gateway Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-400 font-semibold">Latency</div>
                <div className="text-xl font-bold text-slate-800">24 ms</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-400 font-semibold">Packet Loss</div>
                <div className="text-xl font-bold text-emerald-600">0.01%</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-400 font-semibold">Codec</div>
                <div className="text-xl font-bold text-slate-800">VP8 / Opus</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-400 font-semibold">SSL Encryption</div>
                <div className="text-xl font-bold text-blue-600">AES-256</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROOM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 max-w-3xl space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Consultation Default Settings</h3>
            <p className="text-xs text-slate-500 mt-1">Configure default security and streaming options for new consultation rooms.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.defaultWaitingRoom}
                  onChange={(e) => setSettingsState({ ...settings, defaultWaitingRoom: e.target.checked })}
                  className="accent-blue-600 w-4 h-4 mt-0.5 rounded"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Enable Waiting Room by Default</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Require host approval before participants enter</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.defaultPasswordProtected}
                  onChange={(e) => setSettingsState({ ...settings, defaultPasswordProtected: e.target.checked })}
                  className="accent-blue-600 w-4 h-4 mt-0.5 rounded"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Require Passcode by Default</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Automatically lock new consultation links</div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LiveKit WebSockets Server URL</label>
              <input
                type="text"
                value={settings.livekitUrl}
                onChange={(e) => setSettingsState({ ...settings, livekitUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <button type="submit" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors">
              Save Default Configurations
            </button>
          </form>
        </div>
      )}

      {/* Schedule Consultation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden p-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Video size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">New Consultation Room</h3>
                    <p className="text-xs text-slate-500 font-medium">Create a direct link for tele-consultations.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Equipment Installation & Technical Audit"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Host Name</label>
                    <input
                      type="text"
                      value={formData.host_name}
                      onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      placeholder="e.g. St. Mary Hospital"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Passcode & Waiting Room options */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPasswordProtected}
                        onChange={(e) => setFormData({ ...formData, isPasswordProtected: e.target.checked })}
                        className="accent-blue-600 rounded"
                      />
                      Passcode Protected
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isWaitingRoomEnabled}
                        onChange={(e) => setFormData({ ...formData, isWaitingRoomEnabled: e.target.checked })}
                        className="accent-blue-600 rounded"
                      />
                      Enable Waiting Room
                    </label>
                  </div>

                  {formData.isPasswordProtected && (
                    <input
                      type="text"
                      placeholder="Set Passcode (e.g. carelink2026)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    />
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                  >
                    Schedule Room
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
