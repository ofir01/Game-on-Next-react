'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, RefreshCw, AlertCircle, Bot, User, Sparkles, WandSparkles, Gamepad2, Newspaper, Trophy, Flame, } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { chatService } from '../../../services/client/chatService';

const quickActions = [
  {
    icon: WandSparkles,
    label: 'Writing Help',
    value: 'Help me rewrite this clearly and professionally.',
  },
  {
    icon: Gamepad2,
    label: 'Game Details',
    value: 'Give me details about this game.',
  },
  {
    icon: Newspaper,
    label: 'What’s New',
    value: 'What is new on the site?',
  },
  {
    icon: Trophy,
    label: 'Top Games',
    value: 'What are the top games right now?',
  },
  {
    icon: Flame,
    label: 'Trending',
    value: 'Show me what is trending right now.',
  },
];

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isChatMaxedOut = messages.length >= 8;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleResetChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleQuickAction = (value) => {
    setInput(value);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isChatMaxedOut) return;

    const updatedMessages = [...messages, { role: 'user', content: input }];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // הוספת הודעת בוט ריקה שתתמלא בחלקים (Stream)
    setMessages((prev) => [...prev, { role: 'bot', content: '' }]);

    try {
      // שימוש ב-fetch ישיר במקום chatService.getAnswer כדי לתמוך ב-Streaming
      const response = await chatService.getAnswer(updatedMessages);

      if (!response) throw new Error('No response body');

      const reader = response.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let isFirstChunk = true;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunkValue = decoder.decode(value, { stream: true });

        if (chunkValue) {
          if (isFirstChunk) {
            setIsLoading(false); // ברגע שמתחיל להגיע טקסט, מפסיקים את אנימציית הטעינה
            isFirstChunk = false;
          }

          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: newMessages[lastIndex].content + chunkValue
            };
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        // במקרה של שגיאה, אם ההודעה נשארה ריקה, נציג הודעת שגיאה
        if (!newMessages[lastIndex].content) {
          newMessages[lastIndex].content = 'אופס, משהו השתבש בחיבור. נסה שוב.';
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[9999]"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-[0_0_35px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_0_45px_rgba(99,102,241,0.55)]"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white/90" />
          ) : (
            <MessageSquare className="h-6 w-6 text-white" />
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            className="fixed bottom-24 right-6 z-[10000] flex h-[min(72vh,650px)] min-h-[480px] w-[min(92vw,430px)] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur-2xl"
            dir="rtl"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.14),transparent_35%),radial-gradient(circle_at_right,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_30%)]" />
              <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
              <div className="absolute -top-24 left-[-40px] h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="absolute right-[-40px] top-24 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
              <div className="absolute bottom-[-60px] left-1/4 h-44 w-44 rounded-full bg-violet-500/12 blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02),transparent)] opacity-25" />
            </div>

            <div className="relative flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-cyan-500/20 text-indigo-300 shadow-lg">
                  <Bot size={21} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </div>

                <div>
                  <h3 className="text-sm font-bold tracking-wide text-white">
                    AI Assistant
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Premium gaming interface
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-300">
                  {Math.floor(messages.length / 2)}/4
                </span>
                <button
                  onClick={handleResetChat}
                  className="rounded-xl p-2 text-slate-400 transition-all hover:bg-white/5 hover:text-indigo-300"
                  title="Reset chat"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div className="relative border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-400">
                <Sparkles size={13} className="text-indigo-300" />
                <span>Quick prompts</span>
              </div>

              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {quickActions.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.button
                      key={item.label}
                      onClick={() => handleQuickAction(item.value)}
                      dir="ltr"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * index, duration: 0.35 }}
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-slate-200 shadow-lg transition-all hover:border-indigo-400/40 hover:text-white"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-indigo-300 transition-all group-hover:bg-indigo-400/15">
                        <Icon size={13} />
                      </span>
                      <span className="relative whitespace-nowrap font-medium">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="relative flex-1 space-y-4 overflow-y-auto px-4 py-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 px-5 py-8 text-center shadow-lg">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-cyan-500/20 text-indigo-300">
                    <Sparkles size={26} />
                  </div>
                  <h4 className="text-base font-semibold text-white">
                    Start with a shortcut
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Pick one of the quick prompts above or type your own message.
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`flex max-w-[88%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${msg.role === 'user'
                        ? 'border-indigo-400/20 bg-indigo-500 text-white'
                        : 'border-white/10 bg-white/5 text-indigo-300'
                        }`}
                    >
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>


                    <div
                      className={`rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-lg ${msg.role === 'user'
                        ? 'rounded-tl-sm border border-indigo-400/20 bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-white'
                        : 'rounded-tr-sm border border-white/10 bg-slate-900/80 text-slate-200'
                        }`}
                    >
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">

                        {msg.role === 'bot' && !msg.content ? (
                          <div className="flex items-center gap-1.5 py-2">
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.2s]" />
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.4s]" />
                          </div>
                        ) : (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              
              <div ref={messagesEndRef} />
            </div>

            <div className="relative border-t border-white/10 bg-slate-950/90 px-4 py-4">
              <AnimatePresence>
                {isChatMaxedOut && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-3 overflow-hidden"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-3">
                      <div className="flex items-center gap-2 text-sm text-indigo-300">
                        <AlertCircle size={16} />
                        <span>Chat limit reached. Start a new conversation.</span>
                      </div>
                      <button
                        onClick={handleResetChat}
                        className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                      >
                        New chat
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isChatMaxedOut && (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 shadow-inner transition-colors focus-within:border-indigo-400/40">
                  <input
                    ref={inputRef}
                    className="flex-1 bg-transparent p-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 transition-all hover:scale-[1.03] hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send size={16} className="rotate-180 text-white" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.35);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.65);
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}