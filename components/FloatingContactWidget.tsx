import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

export const FloatingContactWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('01339-482917');

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .eq('key', 'footer_phone')
          .maybeSingle();
        if (data?.value) {
          setPhone(data.value);
        }
      } catch (err) {
        console.error('FloatingContactWidget phone fetch error:', err);
      }
    };
    fetchPhone();
  }, []);

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const whatsappNumber = phone.replace(/[^0-9]/g, '').replace(/^0/, '880') || '8801339482917';

  return (
    <div
      className="fixed bottom-6 right-6 z-[9990] flex items-center gap-3 select-none"
      aria-label="Quick Contact Actions"
    >
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Phone Call Action Button */}
            <motion.a
              key="call-btn"
              href={`tel:${cleanPhone}`}
              initial={{ opacity: 0, x: 24, scale: 0.7 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26, delay: 0.04 }}
              aria-label={`Call us at ${phone}`}
              title={`Call ${phone}`}
              className="w-13 h-13 rounded-full bg-[#FF5A5F] hover:bg-[#ff4248] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(255,90,95,0.45)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              style={{ width: '52px', height: '52px' }}
            >
              {/* Solid Phone Handset SVG matching screenshot */}
              <svg viewBox="0 0 24 24" width="23" height="23" fill="currentColor" aria-hidden="true">
                <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2Z" />
              </svg>
            </motion.a>

            {/* WhatsApp Action Button */}
            <motion.a
              key="whatsapp-btn"
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: 16, scale: 0.7 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 14, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              aria-label="Chat on WhatsApp"
              title="Chat on WhatsApp"
              className="w-13 h-13 rounded-full bg-[#FF5A5F] hover:bg-[#ff4248] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(255,90,95,0.45)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              style={{ width: '52px', height: '52px' }}
            >
              {/* WhatsApp Icon SVG matching screenshot */}
              <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor" aria-hidden="true">
                <path d="M17.47 14.38c-.29-.15-1.7-.84-1.97-.93-.26-.1-.46-.15-.65.15-.2.29-.75.93-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.6-1.99-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.2-.29.29-.48.1-.2.05-.36-.02-.51-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5h-.56c-.2 0-.51.07-.78.36-.26.29-1.02 1-1.02 2.43s1.05 2.82 1.19 3.01c.15.19 2.06 3.14 4.99 4.4.7.3 1.24.48 1.66.61.7.22 1.34.19 1.84.12.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34ZM12.02 22h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.9 9.9 0 0 1 2.1 12C2.1 6.53 6.55 2.08 12.03 2.08c2.65 0 5.14 1.03 7.01 2.91a9.83 9.83 0 0 1 2.9 6.99c0 5.47-4.45 9.92-9.92 9.92Zm8.4-18.32A11.82 11.82 0 0 0 12.03.1C5.4.1.02 5.48.02 12.1c0 2.1.55 4.15 1.6 5.96L0 24l6.1-1.6a11.94 11.94 0 0 0 5.92 1.5h.01c6.62 0 12-5.38 12-12 0-3.2-1.25-6.22-3.5-8.22Z" />
              </svg>
            </motion.a>
          </>
        )}
      </AnimatePresence>

      {/* Main Toggle Button (Speech Bubble when closed, X when open) */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close contact menu' : 'Open WhatsApp and Call menu'}
        title={isOpen ? 'Close' : 'Contact Us'}
        className="rounded-full bg-[#FF5A5F] hover:bg-[#ff4248] text-white flex items-center justify-center shadow-[0_8px_28px_rgba(255,90,95,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
        style={{ width: '54px', height: '54px' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.svg
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat-icon"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.18 }}
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              aria-hidden="true"
            >
              {/* Speech bubble with tail on bottom-right and two horizontal text lines matching reference */}
              <path
                d="M5 5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3l-3.5 3.5V18H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                fill="currentColor"
              />
              <line
                x1="8"
                y1="10"
                x2="14"
                y2="10"
                stroke="#FF5A5F"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="8"
                y1="13"
                x2="12"
                y2="13"
                stroke="#FF5A5F"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
