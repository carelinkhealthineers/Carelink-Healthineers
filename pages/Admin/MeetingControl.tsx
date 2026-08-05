import React, { useState, useEffect } from 'react';
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
  Edit2
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
  
  // Edit User modal state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // New Meeting Form
  const [formData, setFormData] = useState({
    title: '',
    host_name: 'Dr. Marcus Vance (Chief Engineer)',
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

  const getDomainLink = (roomId: string) => {
    return `${window.location.origin}/#/interface?room=${encodeURIComponent(roomId)}`;
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const generatedRoomId = formData.room_id.trim() || `Clinical-${formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}-${Math.floor(Math.random() * 899 + 100)}`;
    
    const newMeeting: ExtendedMeeting = {
      id: `mtg-${Date.now()}`,
      room_id: generatedRoomId,
      title: formData.title,
      host_name: formData.host_name,
      client_name: formData.client_name || 'Invited Client',
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

    // Reset Form
    setFormData({
      title: '',
      host_name: 'Dr. Marcus Vance (Chief Engineer)',
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
    if (!confirm('Are you sure you want to delete this consultation meeting?')) return;
    const filtered = meetings.filter(m => m.id !== id);
    setMeetings(filtered);
    saveMeetings(filtered);
  };

  const handleToggleFav = (id: string) => {
    const updated = toggleFavouriteMeeting(id);
    setMeetings(updated);
  };

  const handleBanToggle = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'banned' ? 'active' : 'banned';
    const updated = banOrUnbanUser(userId, nextStatus);
    setUsers(updated);
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Delete user account permanently?')) return;
    const updated = deleteUserAccount(userId);
    setUsers(updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    alert('Meeting & LiveKit settings saved successfully!');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalUsersCount = users.length;
  const totalMeetingsCount = meetings.length;
  const activeMeetingsCount = meetings.filter(m => m.status === 'active').length;

  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.room_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <SEO title="Tele-Consultation Nexus" description="Official Admin Video Meeting & User Management Dashboard." />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest mb-1">
            <Lock size={14} /> Carelink Tele-Consultation Admin Suite
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meeting Control & User Management</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Manage live rooms, auto-registered users, security passwords, waiting rooms, and livekit analytics.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} /> Create New Meeting
        </button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10"><Users size={64} /></div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Users</div>
          <div className="text-3xl font-black text-white">{totalUsersCount}</div>
          <div className="mt-3 text-[10px] text-blue-400 font-mono">Auto-Registered & Active</div>
        </div>

        <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Total Meetings</div>
          <div className="text-3xl font-black text-slate-900">{totalMeetingsCount}</div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">Scheduled & Created</div>
        </div>

        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Active Meetings</div>
          <div className="text-3xl font-black text-emerald-600 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /> {activeMeetingsCount}
          </div>
          <div className="mt-3 text-[10px] text-emerald-700 font-mono">Live WebRTC Rooms</div>
        </div>

        <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">LiveKit Status</div>
          <div className="text-base font-black text-slate-900 truncate">LiveKit Cloud Connected</div>
          <div className="mt-3 text-[10px] text-indigo-600 font-mono flex items-center gap-1">
            <Zap size={12} strokeWidth={3} /> SSL WebRTC Gateway
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'meetings', label: 'Meetings Suite', icon: <Video size={16} />, count: totalMeetingsCount },
          { id: 'users', label: 'User Management', icon: <Users size={16} />, count: totalUsersCount },
          { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
          { id: 'settings', label: 'Settings Panel', icon: <Sliders size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.icon} {tab.label} {tab.count !== undefined && <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-mono">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Active Launched Meeting Viewport */}
      <AnimatePresence>
        {activeMeeting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-6 rounded-[2.5rem] bg-slate-950 border border-slate-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <h3 className="text-lg font-black text-white">{activeMeeting.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">Room: {activeMeeting.room_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyToClipboard(getDomainLink(activeMeeting.room_id), activeMeeting.id)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  {copiedId === activeMeeting.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedId === activeMeeting.id ? 'Copied' : 'Copy Link'}
                </button>
                <button
                  onClick={() => setActiveMeeting(null)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-700 transition-all"
                >
                  Close Room
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

      {/* TAB 1: MEETINGS SUITE */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search meetings by title, room ID, or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Filter size={14} /> Showing {filteredMeetings.length} Meetings
            </div>
          </div>

          <div className="space-y-4">
            {filteredMeetings.map((meeting) => {
              const domainLink = getDomainLink(meeting.room_id);
              return (
                <div key={meeting.id} className="p-6 rounded-3xl bg-white border border-slate-200 hover:shadow-md transition-all space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleFav(meeting.id)} className="text-amber-400">
                          <Star size={18} fill={meeting.isFavourite ? "currentColor" : "none"} />
                        </button>
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                          {meeting.room_id}
                        </span>
                        {meeting.isPasswordProtected && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-200 flex items-center gap-1">
                            <Lock size={10} /> Protected
                          </span>
                        )}
                        {meeting.isWaitingRoomEnabled && (
                          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-200">
                            Waiting Room
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-slate-900 leading-snug">{meeting.title}</h3>

                      <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                        <span>Host: <strong className="text-slate-800">{meeting.host_name}</strong></span>
                        <span>Client: <strong className="text-slate-800">{meeting.client_name}</strong></span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 font-mono text-[11px]">
                        <div className="truncate text-blue-300">{domainLink}</div>
                        <button
                          onClick={() => copyToClipboard(domainLink, meeting.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          {copiedId === meeting.id ? 'Copied' : 'Copy Link'}
                        </button>
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveMeeting(meeting)}
                        className="w-full lg:w-40 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                      >
                        <Play size={14} fill="currentColor" /> Launch Room
                      </button>
                      <a
                        href={domainLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full lg:w-40 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink size={14} /> Open Tab
                      </a>
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered users by name or ID..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="text-xs font-bold text-slate-500">
              Total Accounts: <strong className="text-slate-800">{users.length}</strong>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="p-4">User</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Meetings Joined</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full text-white font-black text-xs flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: user.avatarColor || '#3b82f6' }}
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
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
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
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          user.status === 'banned'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                      >
                        {user.status === 'banned' ? 'Unban' : 'Ban User'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
      )}

      {/* TAB 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Consultation Hours</span>
              <div className="text-3xl font-black text-slate-900">48.5 Hours</div>
              <p className="text-xs text-emerald-600 font-bold">+12% increase this week</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Participants / Room</span>
              <div className="text-3xl font-black text-slate-900">4.2 Users</div>
              <p className="text-xs text-blue-600 font-bold">Optimal Bandwidth Utilization</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audio/Video Quality Score</span>
              <div className="text-3xl font-black text-emerald-600">99.8%</div>
              <p className="text-xs text-slate-500 font-mono">LiveKit WebRTC Cloud Benchmark</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS PANEL */}
      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-3xl space-y-6">
          <h3 className="text-xl font-black text-slate-900">Meeting & LiveKit Default Settings</h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.defaultWaitingRoom}
                  onChange={(e) => setSettingsState({ ...settings, defaultWaitingRoom: e.target.checked })}
                  className="accent-blue-600 w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Enable Waiting Room by Default</div>
                  <div className="text-[10px] text-slate-500">Require host admission for new joiners</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.defaultPasswordProtected}
                  onChange={(e) => setSettingsState({ ...settings, defaultPasswordProtected: e.target.checked })}
                  className="accent-blue-600 w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Require Passcode by Default</div>
                  <div className="text-[10px] text-slate-500">Enforce password protection on creation</div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">LiveKit WebSockets Server URL</label>
              <input
                type="text"
                value={settings.livekitUrl}
                onChange={(e) => setSettingsState({ ...settings, livekitUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
              />
            </div>

            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md">
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
                    <h3 className="text-xl font-black text-slate-900">Schedule Official Meeting</h3>
                    <p className="text-xs text-slate-400 font-medium">Generate a secure consultation link under your domain.</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-slate-800 rounded-full">✕</button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Meeting Topic / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suction System Technical Briefing"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Host Name</label>
                    <input
                      type="text"
                      value={formData.host_name}
                      onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Client Name</label>
                    <input
                      type="text"
                      placeholder="e.g. St. Jude Hospital"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Password Protection & Waiting Room options */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPasswordProtected}
                        onChange={(e) => setFormData({ ...formData, isPasswordProtected: e.target.checked })}
                        className="accent-blue-600 rounded"
                      />
                      Password Protected Meeting
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
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
                      placeholder="Set Meeting Passcode (e.g. carelink2026)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold"
                    />
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider">
                    Cancel
                  </button>
                  <button type="submit" className="px-8 py-3 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                    Create Meeting
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
