/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Send, 
  Settings, 
  Terminal as TerminalIcon, 
  AlertCircle, 
  CheckCircle2, 
  Zap,
  Skull,
  Activity
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('1');
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = 0;
    }
  }, [logs]);

  const initiateProtocol = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      addLog('PROTOCOL FAILED: Invalid target number identifier.', 'error');
      return;
    }

    const count = parseInt(amount);
    if (isNaN(count) || count <= 0) {
      addLog('PROTOCOL FAILED: Invalid volume parameter.', 'error');
      return;
    }

    setIsSending(true);
    addLog(`INITIATING HYBRID PROTOCOL: TARGET=${phoneNumber}, AMOUNT=${count}`, 'info');

    for (let i = 1; i <= count; i++) {
       if (!isSending && i > 1) {
         // This check is a bit tricky with sync loop, but for prototype it's okay
       }
       
       addLog(`BATCH [${i}/${count}]: Sequence synchronized...`, 'info');
       
       // Hybrid mode - send both
       try {
         // Medeasy
         const res1 = await fetch('/api/send', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ number: phoneNumber, type: 'medeasy' })
         });
         if (res1.ok) {
           addLog(`BATCH [${i}] API_1: Transmitted successfully.`, 'success');
         } else {
           const err = await res1.json();
           addLog(`BATCH [${i}] API_1: Transmission failed (${res1.status})`, 'error');
         }

         // Small delay within hybrid burst
         await new Promise(r => setTimeout(r, 500));

         // Bikroy
         const res2 = await fetch('/api/send', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ number: phoneNumber, type: 'bikroy' })
         });
         if (res2.ok) {
           addLog(`BATCH [${i}] API_2: Transmitted successfully.`, 'success');
         } else {
           addLog(`BATCH [${i}] API_2: Transmission failed (${res2.status})`, 'error');
         }

         // Mandatory 3s delay between batches as requested to avoid 429
         if (i < count) {
           addLog(`COOLDOWN: Synchronizing next sequence (3s)...`, 'info');
           await new Promise(r => setTimeout(r, 3000));
         }
       } catch (error) {
         addLog(`CRITICAL ERROR in sequence ${i}: Communication link severed.`, 'error');
       }
    }

    addLog('PROTOCOL COMPLETE: Area clear.', 'success');
    setIsSending(false);
  };

  const terminateProtocol = () => {
    setIsSending(false);
    addLog('PROTOCOL TERMINATED: Manual override active.', 'error');
    window.location.reload(); // Quickest way to stop the loop for a prototype
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
      
      {/* Header */}
      <header className="border-b border-[#1F1F1F] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              <Zap size={18} className="text-white fill-current" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">
              𝗦𝗠𝗦 <span className="text-red-500">𝗕𝗢𝗠𝗕𝗘𝗥</span> 𝗢𝗙𝗙𝗜𝗖𝗘
            </h1>
          </div>
          <div className="flex items-center gap-4 text-[#444444] text-[10px] font-mono uppercase tracking-widest leading-none">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Mainnet Online
            </div>
            <div className="h-4 w-[1px] bg-[#1F1F1F]" />
            v2.4.0
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Input Panel */}
          <div className="md:col-span-12 space-y-8">
            <section className="bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Skull size={120} />
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Settings size={20} className="text-red-500" />
                    Protocol Configuration
                  </h2>
                  <p className="text-[#444444] text-sm font-mono">
                    System will automatically utilize Hybrid API bursts for maximum throughput.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-mono uppercase text-[#444444] tracking-wider">Target Number</label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444] group-focus-within:text-red-500 transition-colors" size={20} />
                      <input 
                        type="text" 
                        placeholder="017XXXXXXXX"
                        className="w-full bg-[#050505] border border-[#1F1F1F] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all font-mono placeholder:text-[#222222]"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isSending}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-mono uppercase text-[#444444] tracking-wider">SMS Amount</label>
                    <div className="relative group">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444] group-focus-within:text-red-500 transition-colors" size={20} />
                      <input 
                        type="number" 
                        placeholder="Volume"
                        className="w-full bg-[#050505] border border-[#1F1F1F] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all font-mono placeholder:text-[#222222]"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isSending}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  {!isSending ? (
                    <button 
                      onClick={initiateProtocol}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-tighter py-4 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <Zap size={20} className="fill-current" />
                      Initiate Protocol
                    </button>
                  ) : (
                    <button 
                      onClick={terminateProtocol}
                      className="flex-1 bg-white text-black font-black uppercase tracking-tighter py-4 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 animate-pulse"
                    >
                      <Skull size={20} />
                      Terminate Protocol
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Terminal Console */}
            <section className="bg-[#050505] border border-[#1F1F1F] rounded-2xl overflow-hidden flex flex-col h-[400px]">
              <div className="px-6 py-4 bg-[#0F0F0F] border-b border-[#1F1F1F] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TerminalIcon size={16} className="text-red-500" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest">Protocol Console Log</span>
                </div>
                {isSending && (
                  <motion.div 
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex items-center gap-2 text-[10px] font-mono text-red-500"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    LIVE_TRANSMISSION
                  </motion.div>
                )}
              </div>
              
              <div ref={consoleRef} className="flex-1 p-6 font-mono text-sm overflow-y-auto scrollbar-hide space-y-3">
                {logs.length === 0 && (
                  <div className="text-[#222222] italic">Waiting for command input... System idle.</div>
                )}
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-4 border-l-2 border-transparent pl-4 hover:border-red-500/20 transition-colors py-1"
                    >
                      <span className="text-[#333333] shrink-0 text-xs">[{log.timestamp}]</span>
                      <div className="flex items-start gap-2">
                        {log.type === 'success' && <CheckCircle2 size={14} className="text-green-500 mt-1 shrink-0" />}
                        {log.type === 'error' && <AlertCircle size={14} className="text-red-500 mt-1 shrink-0" />}
                        {log.type === 'info' && <activity size={14} className="text-blue-500 mt-1 shrink-0 opacity-20" />}
                        <span className={`
                          ${log.type === 'success' ? 'text-green-400' : ''}
                          ${log.type === 'error' ? 'text-red-400' : ''}
                          ${log.type === 'info' ? 'text-[#888888]' : ''}
                        `}>
                          {log.message}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* Meme/Style Footer Section */}
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-full max-w-sm"
              >
                <div className="bg-[#0F0F0F] border border-red-500/20 p-4 rounded-xl text-center space-y-4">
                  <div className="text-[10px] font-mono text-red-500 uppercase tracking-[0.3em]">Maximum Overdrive</div>
                  <div className="h-1 bg-[#050505] rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-1/2 h-full bg-red-600"
                    />
                  </div>
                  <div className="text-xs text-[#444444] font-serif italic">"Silence is not an option."</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
