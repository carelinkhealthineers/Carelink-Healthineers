import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !isStandalone;
    setIsIOS(ios);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (isInstalled || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  const isDark = theme === 'dark';

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div
        className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2.5 text-xs ${
          isDark
            ? 'bg-blue-950/40 border-blue-500/30 text-slate-200'
            : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone size={15} className="text-blue-500 shrink-0" />
          <div className="truncate">
            <span className="font-bold">Install Carelink App: </span>
            <span className="text-[11px] opacity-80">Better phone notification bar alerts</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap"
          >
            Install
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl space-y-4 ${
              isDark ? 'bg-[#0f172a] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-white/10">
              <h3 className="font-bold text-sm">Install on iPhone / iPad</h3>
              <button onClick={() => setShowIOSModal(false)} className="text-slate-400">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed space-y-1.5">
              1. Tap Safari&apos;s <strong>Share</strong> button (bottom bar).<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Open the app from home screen to enable status bar notifications!
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
