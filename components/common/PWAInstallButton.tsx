import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  theme?: 'light' | 'dark';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ theme = 'dark' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const isDark = theme === 'dark';

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          isDark
            ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300'
            : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800'
        }`}
        title="Install Carelink app to your phone for native notification bar alerts"
      >
        <Download size={14} />
        <span className="hidden md:inline">Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isDark
              ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
        >
          <Smartphone size={14} />
          <span className="hidden sm:inline">Install on iPhone</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl space-y-4 ${
                isDark
                  ? 'bg-[#0d121d] border-[#232f45] text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Install Carelink on iPhone</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                To receive alerts directly in your iPhone notification bar and lock screen:
              </p>
              <ol
                className={`text-xs space-y-2 list-decimal pl-4 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <li>
                  Tap the <strong>Share</strong> icon in Safari toolbar at the bottom.
                </li>
                <li>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </li>
                <li>
                  Open the installed <strong>Carelink</strong> app from your Home Screen and tap{' '}
                  <strong>Enable Phone Alerts</strong>.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
