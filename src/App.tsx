/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Volume2, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [time, setTime] = useState(new Date());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasBnVoice, setHasBnVoice] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-load voices and check for Bengali support
  useEffect(() => {
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const found = voices.some(v => 
        v.lang.toLowerCase().includes('bn') || 
        v.lang.toLowerCase().includes('bengali')
      );
      setHasBnVoice(found);
    };

    checkVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = checkVoices;
    }
  }, []);

  const formatTimeBengali = (date: Date) => {
    return new Intl.DateTimeFormat('bn-BD', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const formatDateBengali = (date: Date) => {
    return new Intl.DateTimeFormat('bn-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const speakTime = useCallback(() => {
    if (isSpeaking) return;
    
    // Ensure we have voices loaded
    const voices = window.speechSynthesis.getVoices();
    
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const hour12 = hours % 12 || 12;
    
    // Convert numbers to Bengali digits for speech
    const toBengaliDigits = (num: number) => num.toLocaleString('bn-BD');
    
    const timeText = `এখন সময় ${toBengaliDigits(hour12)} টা ${minutes > 0 ? toBengaliDigits(minutes) + ' মিনিট' : ''}`;

    const utterance = new SpeechSynthesisUtterance(timeText);
    
    // Try to find a Bengali voice specifically
    const bnVoice = voices.find(v => v.lang.toLowerCase().includes('bn') || v.lang.toLowerCase().includes('bengali'));
    
    if (bnVoice) {
      utterance.voice = bnVoice;
      utterance.lang = bnVoice.lang;
    } else {
      // Fallback to standard Bengali code
      utterance.lang = 'bn-BD';
    }

    utterance.rate = 0.85; // Slightly slower for better clarity in Bengali
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("SpeechSynthesis Error:", event);
      setIsSpeaking(false);
      // If it fails, we might want to alert the user or try a different approach
    };

    // Cancel any ongoing speech before starting new one
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [time, isSpeaking]);

  return (
    <div className="fixed inset-0 bg-[#f5f5f0] flex flex-col items-center justify-between p-6 font-serif overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white rounded-[40px] shadow-2xl p-8 sm:p-10 text-center border border-[#5A5A40]/10 flex flex-col items-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#5A5A40]/5 rounded-full">
              <Clock className="w-10 h-10 text-[#5A5A40]" />
            </div>
          </div>

          <h1 className="text-[#5A5A40] text-xs sm:text-sm uppercase tracking-[0.25em] font-sans font-bold mb-4">
            বর্তমান সময়
          </h1>

          <motion.div 
            key={time.getMinutes()}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl sm:text-7xl font-bold text-[#1a1a1a] mb-4 tracking-tighter leading-none"
          >
            {formatTimeBengali(time)}
          </motion.div>

          <p className="text-[#5A5A40]/70 text-base sm:text-lg mb-10 italic leading-relaxed">
            {formatDateBengali(time)}
          </p>

          <div className="w-full space-y-4">
            {!hasBnVoice && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-amber-700 text-xs mb-4 bg-amber-50 p-3 rounded-2xl border border-amber-100 leading-snug"
              >
                আপনার ফোনে বাংলা ভয়েস পাওয়া যায়নি। সময় শুনতে সমস্যা হতে পারে।
              </motion.p>
            )}
            <button
              onClick={speakTime}
              disabled={isSpeaking}
              className={`
                w-full py-5 px-8 rounded-full flex items-center justify-center gap-3 text-xl font-bold transition-all duration-300
                active:scale-95 touch-manipulation
                ${isSpeaking 
                  ? 'bg-[#5A5A40]/20 text-[#5A5A40] cursor-not-allowed' 
                  : 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20'}
              `}
            >
              <Volume2 className={`w-7 h-7 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span>সময় শুনুন</span>
            </button>
          </div>
        </motion.div>
      </div>

      <footer className="pb-4 text-[#5A5A40]/40 text-[10px] uppercase tracking-[0.3em] font-sans font-medium">
        &copy; ২০২৬ Kawser Ahmed Roni.
      </footer>
    </div>
  );
}
