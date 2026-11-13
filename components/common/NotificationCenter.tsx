import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  X,
  Receipt,
  Briefcase,
  FileText,
  TrendingUp,
  Crown,
  UserCheck,
  StickyNote,
  Mail,
  Wallet,
  Megaphone,
  Send,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Trash2,
  Smartphone,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  AppNotification,
  Employee,
  NotificationCategory,
  NotificationPriority,
} from '../../types';
import {
  clearAllNotificationsForViewer,
  dismissNotificationForViewer,
  emitNotification,
  fetchNotificationsForViewer,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationViewerRole,
  subscribeToNotifications,
} from '../../services/notificationService';
import {
  triggerPhoneNotification,
  requestPhoneNotificationPermission,
  getPhoneNotificationPermission,
  sendTestPhoneNotification,
} from '../../utils/phoneNotificationHelper';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface NotificationCenterProps {
  viewerRole: NotificationViewerRole;
  viewerId: string;
  employeeId?: string;
  actorName: string;
  theme?: 'light' | 'dark';
  employees?: Employee[];
  onNavigate?: (linkTab: string, notification: AppNotification) => void;
}

const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; icon: React.FC<{ size?: number; className?: string }>; accentClass: string }
> = {
  tada: { label: 'TA/DA', icon: Receipt, accentClass: 'text-emerald-500 bg-emerald-500/10' },
  duty: { label: 'Duty', icon: Briefcase, accentClass: 'text-sky-500 bg-sky-500/10' },
  report: { label: 'Report', icon: FileText, accentClass: 'text-indigo-500 bg-indigo-500/10' },
  sales: { label: 'Sales', icon: TrendingUp, accentClass: 'text-blue-500 bg-blue-500/10' },
  decision: { label: 'Decision', icon: Crown, accentClass: 'text-amber-500 bg-amber-500/10' },
  profile: { label: 'Profile', icon: UserCheck, accentClass: 'text-teal-500 bg-teal-500/10' },
  note: { label: 'Expense/Note', icon: StickyNote, accentClass: 'text-purple-500 bg-purple-500/10' },
  inquiry: { label: 'Inquiry', icon: Mail, accentClass: 'text-rose-500 bg-rose-500/10' },
  budget: { label: 'Budget', icon: Wallet, accentClass: 'text-amber-600 bg-amber-500/10' },
  system: { label: 'Alert', icon: Megaphone, accentClass: 'text-blue-500 bg-blue-500/10' },
};

function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (isNaN(ts)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  if (days < 7) return `${days}d ago`;
  return iso.slice(0, 10);
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  viewerRole,
  viewerId,
  employeeId,
  actorName,
  theme = 'dark',
  employees = [],
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | NotificationCategory>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [liveToasts, setLiveToasts] = useState<AppNotification[]>([]);

  // Composer state (for Admin & Executive manual broadcast)
  const [showComposer, setShowComposer] = useState(false);
  const [compTitle, setCompTitle] = useState('');
  const [compMessage, setCompMessage] = useState('');
  const [compAudience, setCompAudience] = useState<'all' | 'employee' | 'executive' | 'admin'>('all');
  const [compTargetEmp, setCompTargetEmp] = useState<string>('');
  const [compPriority, setCompPriority] = useState<NotificationPriority>('high');
  const [isSending, setIsSending] = useState(false);

  const [browserAlertsEnabled, setBrowserAlertsEnabled] = useState<boolean>(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        window.Notification.permission === 'granted' &&
        localStorage.getItem('carelink_desktop_alerts') !== 'off'
      );
    } catch {
      return false;
    }
  });

  const [phonePermission, setPhonePermission] = useState<NotificationPermission>(() =>
    getPhoneNotificationPermission()
  );
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialLoadedRef = useRef(false);

  const refreshNotifications = useCallback(async () => {
    try {
      const items = await fetchNotificationsForViewer(viewerRole, employeeId, viewerId);
      setNotifications(items);

      if (!initialLoadedRef.current) {
        items.forEach((n) => seenIdsRef.current.add(n.id));
        initialLoadedRef.current = true;
      } else {
        const brandNew = items.filter(
          (n) => !seenIdsRef.current.has(n.id) && !n.read_by.includes(viewerId)
        );
        if (brandNew.length > 0) {
          brandNew.forEach((n) => seenIdsRef.current.add(n.id));
          setLiveToasts((prev) => [...brandNew.slice(0, 3), ...prev].slice(0, 4));

          // Trigger Mobile Phone Notification Bar (ServiceWorker showNotification + vibration)
          brandNew.slice(0, 3).forEach((n) => {
            triggerPhoneNotification(n.title, {
              body: n.message,
              tag: n.id,
              url: n.link_tab || '/',
              priority: n.priority,
              category: n.category,
            });
          });

          window.setTimeout(() => {
            const idsToDrop = new Set(brandNew.map((b) => b.id));
            setLiveToasts((prev) => prev.filter((t) => !idsToDrop.has(t.id)));
          }, 7000);
        }
      }
    } catch (err) {
      console.warn('Notification refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [viewerRole, employeeId, viewerId]);

  useEffect(() => {
    initialLoadedRef.current = false;
    seenIdsRef.current = new Set();
    refreshNotifications();
    const unsubscribe = subscribeToNotifications(refreshNotifications);
    return unsubscribe;
  }, [refreshNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read_by.includes(viewerId)).length,
    [notifications, viewerId]
  );

  const visibleNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (onlyUnread && n.read_by.includes(viewerId)) return false;
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      return true;
    });
  }, [notifications, onlyUnread, categoryFilter, viewerId]);

  const handleToggleBrowserAlerts = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (browserAlertsEnabled) {
      localStorage.setItem('carelink_desktop_alerts', 'off');
      setBrowserAlertsEnabled(false);
      return;
    }
    try {
      const perm =
        window.Notification.permission === 'granted'
          ? 'granted'
          : await window.Notification.requestPermission();
      if (perm === 'granted') {
        localStorage.setItem('carelink_desktop_alerts', 'on');
        setBrowserAlertsEnabled(true);
        setPhonePermission('granted');
      }
    } catch {
      // ignore unsupported contexts
    }
  };

  const handleEnablePhoneNotifications = async () => {
    try {
      const res = await requestPhoneNotificationPermission();
      setPhonePermission(res.status);
      if (res.granted) {
        setBrowserAlertsEnabled(true);
        const ok = await sendTestPhoneNotification(actorName);
        if (ok) {
          setTestSentMessage('ফোনের নোটিফিকেশন বারে পাঠানো হয়েছে! স্ক্রিনের ওপর দেখুন');
          setTimeout(() => setTestSentMessage(null), 5000);
        }
      } else if (res.status === 'denied') {
        setTestSentMessage('ব্রাউজার সেটিংসে গিয়ে Notification অনুমতি Allow করুন');
        setTimeout(() => setTestSentMessage(null), 5000);
      }
    } catch (e) {
      console.warn('Phone notification activation error:', e);
    }
  };

  const handleTestPhoneNotification = async () => {
    try {
      const ok = await sendTestPhoneNotification(actorName);
      if (ok) {
        setTestSentMessage('টেস্ট নোটিফিকেশন পাঠানো হয়েছে! ফোনের স্ট্যাটাস বার চেক করুন');
        setTimeout(() => setTestSentMessage(null), 5000);
      } else {
        const res = await requestPhoneNotificationPermission();
        setPhonePermission(res.status);
        if (res.granted) {
          await sendTestPhoneNotification(actorName);
          setTestSentMessage('টেস্ট নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!');
          setTimeout(() => setTestSentMessage(null), 5000);
        } else {
          setTestSentMessage('নোটিফিকেশন পারমিশন ব্লক করা আছে। অনুমতি দিন।');
          setTimeout(() => setTestSentMessage(null), 5000);
        }
      }
    } catch (e) {
      console.warn('Test notification error:', e);
    }
  };

  const handleItemClick = async (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notif.id && !n.read_by.includes(viewerId)
          ? { ...n, read_by: [...n.read_by, viewerId] }
          : n
      )
    );
    await markNotificationRead(notif.id, viewerId);
    if (notif.link_tab && onNavigate) {
      setIsOpen(false);
      onNavigate(notif.link_tab, notif);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.read_by.includes(viewerId) ? n : { ...n, read_by: [...n.read_by, viewerId] }
      )
    );
    await markAllNotificationsRead(viewerId, viewerRole, employeeId);
  };

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await dismissNotificationForViewer(id, viewerId);
  };

  const handleClearAll = async () => {
    setNotifications([]);
    await clearAllNotificationsForViewer(viewerId, viewerRole, employeeId);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle.trim() || !compMessage.trim()) return;
    setIsSending(true);
    try {
      const audiences: AppNotification['audiences'] =
        compTargetEmp
          ? ['employee', 'admin', 'executive']
          : compAudience === 'all'
          ? ['all']
          : [compAudience];

      await emitNotification({
        title: compTitle.trim(),
        message: compMessage.trim(),
        category: 'system',
        priority: compPriority,
        audiences,
        target_employee_id: compTargetEmp || undefined,
        actor_name: actorName,
        actor_role: viewerRole === 'executive' ? 'Executive' : 'Administrator',
        link_tab: compTargetEmp ? 'workspace' : 'alerts',
      });

      setCompTitle('');
      setCompMessage('');
      setCompTargetEmp('');
      setShowComposer(false);
      await refreshNotifications();
    } finally {
      setIsSending(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      <div className="relative shrink-0" ref={panelRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open notifications"
          className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isDark
              ? isOpen
                ? 'bg-blue-600/20 border-blue-500/40 text-white'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200'
              : isOpen
              ? 'bg-blue-50 border-blue-300 text-blue-800'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
        >
          <Bell size={15} className={unreadCount > 0 ? 'text-amber-500' : ''} />
          <span className="hidden sm:inline">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold font-mono tabular-nums leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div
            className={`fixed sm:absolute right-3 sm:right-0 left-3 sm:left-auto top-16 sm:top-12 w-auto sm:w-[430px] max-h-[82vh] flex flex-col rounded-2xl border shadow-2xl z-50 overflow-hidden ${
              isDark
                ? 'bg-[#0d121d] border-[#232f45] text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div
              className={`px-4 py-3.5 border-b flex items-center justify-between gap-2 ${
                isDark ? 'border-white/10 bg-black/25' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">Notification Center</h3>
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {unreadCount} unread
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {typeof window !== 'undefined' && 'Notification' in window && (
                  <button
                    type="button"
                    onClick={handleToggleBrowserAlerts}
                    title={
                      browserAlertsEnabled
                        ? 'Desktop notifications enabled (click to disable)'
                        : 'Enable desktop browser notifications'
                    }
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      browserAlertsEnabled
                        ? isDark
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : isDark
                        ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {browserAlertsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                )}

                {(viewerRole === 'admin' || viewerRole === 'executive') && (
                  <button
                    type="button"
                    onClick={() => setShowComposer((v) => !v)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
                      showComposer
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'bg-white/10 hover:bg-white/15 text-slate-200'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    <Megaphone size={12} />
                    <span>Send Alert</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Phone Status Bar (ফোনের নোটিফিকেশন বার) Alert Controller */}
            <div
              className={`p-3 border-b text-xs ${
                isDark
                  ? 'bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/20 border-white/10'
                  : 'bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-sky-50/80 border-blue-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      phonePermission === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    <Smartphone size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[12px]">ফোনের নোটিফিকেশন বার</span>
                      {phonePermission === 'granted' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Check size={10} /> সক্রিয় (Active)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          অনুমতি দিন
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {phonePermission === 'granted'
                        ? 'সরাসরি আপনার মোবাইলের শীর্ষ নোটিফিকেশন বার (Status Bar) এবং ভাইব্রেশনে সতর্কবার্তা চালু আছে।'
                        : 'TA/DA অনুমোদন, ডিউটি ও সেলসের নোটিফিকেশন ফোনের শীর্ষ নোটিফিকেশন বারে পেতে চালু করুন।'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                {phonePermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={handleEnablePhoneNotifications}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                  >
                    <Sparkles size={12} />
                    <span>ফোনের নোটিফিকেশন বার চালু করুন</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleTestPhoneNotification}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isDark
                        ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    <Smartphone size={12} className="text-emerald-400" />
                    <span>ফোনে টেস্ট নোটিফিকেশন পাঠান</span>
                  </button>
                )}

                {testSentMessage && (
                  <span className="text-[11px] text-emerald-400 font-semibold inline-flex items-center gap-1">
                    <Check size={12} /> {testSentMessage}
                  </span>
                )}
              </div>

              {/* In-app install banner */}
              <div className="mt-2.5">
                <PWAInstallPrompt theme={theme} />
              </div>
            </div>

            {/* Admin / Executive Broadcast Composer */}
            {showComposer && (viewerRole === 'admin' || viewerRole === 'executive') && (
              <form
                onSubmit={handleSendBroadcast}
                className={`p-3.5 border-b space-y-2.5 text-xs ${
                  isDark ? 'border-white/10 bg-blue-950/20' : 'border-slate-200 bg-blue-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-500">Broadcast Instant Notification</span>
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Alert title (e.g. Urgent TA/DA Audit Notice)"
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${
                    isDark
                      ? 'bg-black/40 border-white/15 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />

                <textarea
                  rows={2}
                  required
                  placeholder="Write notification message..."
                  value={compMessage}
                  onChange={(e) => setCompMessage(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${
                    isDark
                      ? 'bg-black/40 border-white/15 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={compTargetEmp ? `emp:${compTargetEmp}` : compAudience}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('emp:')) {
                        setCompTargetEmp(val.slice(4));
                        setCompAudience('employee');
                      } else {
                        setCompTargetEmp('');
                        setCompAudience(val as 'all' | 'employee' | 'executive' | 'admin');
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] outline-none ${
                      isDark
                        ? 'bg-black/50 border-white/15 text-slate-200'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="all">All Portals (Everyone)</option>
                    <option value="employee">All Employees</option>
                    <option value="executive">Executives Only</option>
                    <option value="admin">Admins Only</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={`emp:${emp.id}`}>
                        Staff: {emp.full_name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={compPriority}
                    onChange={(e) => setCompPriority(e.target.value as NotificationPriority)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] outline-none ${
                      isDark
                        ? 'bg-black/50 border-white/15 text-slate-200'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={12} />
                    <span>{isSending ? 'Sending...' : 'Send Notification'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Filter Strip */}
            <div
              className={`px-3 py-2 border-b flex items-center justify-between gap-2 overflow-x-auto ${
                isDark ? 'border-white/10 bg-black/15' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-1 shrink-0">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'tada', label: 'TA/DA' },
                    { id: 'duty', label: 'Duties' },
                    { id: 'report', label: 'Reports' },
                    { id: 'sales', label: 'Sales' },
                    { id: 'system', label: 'Alerts' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      categoryFilter === tab.id
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-white'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOnlyUnread((u) => !u)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                  onlyUnread
                    ? 'bg-amber-500/20 text-amber-500'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Unread
              </button>
            </div>

            {/* Toolbar Actions */}
            {notifications.length > 0 && (
              <div
                className={`px-4 py-1.5 border-b flex items-center justify-between text-[11px] ${
                  isDark ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-500'
                }`}
              >
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="inline-flex items-center gap-1 font-semibold hover:text-blue-500 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 font-semibold hover:text-rose-500 cursor-pointer whitespace-nowrap"
                >
                  <Trash2 size={12} />
                  <span>Clear list</span>
                </button>
              </div>
            )}

            {/* Notification Feed */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/10 custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Loading notifications...
                </div>
              ) : visibleNotifications.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <Bell
                    size={26}
                    className={`mx-auto ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
                  />
                  <div className="text-xs font-semibold">No notifications yet</div>
                  <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Updates for TA/DA claims, duties, daily reports, sales, and approvals will appear here live.
                  </p>
                </div>
              ) : (
                visibleNotifications.map((notif) => {
                  const isUnread = !notif.read_by.includes(viewerId);
                  const meta = CATEGORY_META[notif.category] || CATEGORY_META.system;
                  const Icon = meta.icon;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      className={`px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer border-b ${
                        isDark ? 'border-white/5' : 'border-slate-100'
                      } ${
                        isUnread
                          ? isDark
                            ? 'bg-blue-500/[0.08] hover:bg-blue-500/[0.13]'
                            : 'bg-blue-50/70 hover:bg-blue-50'
                          : isDark
                          ? 'hover:bg-white/[0.03]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${meta.accentClass}`}>
                        <Icon size={15} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-bold leading-snug">
                            {notif.title}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDismiss(e, notif.id)}
                            title="Dismiss"
                            className={`p-0.5 rounded shrink-0 cursor-pointer ${
                              isDark
                                ? 'text-slate-500 hover:text-slate-200'
                                : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <X size={13} />
                          </button>
                        </div>

                        <p
                          className={`text-[11px] leading-relaxed ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          {notif.message}
                        </p>

                        <div
                          className={`flex items-center flex-wrap gap-1.5 text-[10px] font-mono tabular-nums ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          <span className="font-sans font-semibold">{meta.label}</span>
                          {notif.priority === 'urgent' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-sans font-bold text-rose-500">Urgent</span>
                            </>
                          )}
                          {isUnread && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-sans font-bold text-blue-500">New</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span>{notif.actor_name}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatRelativeTime(notif.created_at)}</span>
                          {notif.link_tab && onNavigate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-sans font-semibold text-blue-500 inline-flex items-center gap-0.5">
                                Open <ArrowUpRight size={10} />
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Incoming Toast Stack */}
      {liveToasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {liveToasts.map((toast) => {
            const meta = CATEGORY_META[toast.category] || CATEGORY_META.system;
            const Icon = meta.icon;
            return (
              <div
                key={toast.id}
                onClick={() => {
                  setLiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  handleItemClick(toast);
                }}
                className={`pointer-events-auto p-3.5 rounded-2xl border shadow-2xl flex items-start gap-3 cursor-pointer transition-all ${
                  isDark
                    ? 'bg-[#101726] border-blue-500/40 text-white'
                    : 'bg-white border-blue-200 text-slate-900'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${meta.accentClass}`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold truncate">{toast.title}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
                      }}
                      className="text-slate-400 hover:text-slate-200 cursor-pointer shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <p className={`text-[11px] line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {toast.message}
                  </p>
                  <div className="text-[10px] text-blue-500 font-semibold pt-0.5">
                    {meta.label} · {toast.actor_name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
