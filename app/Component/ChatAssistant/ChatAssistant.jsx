

'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Gamepad2, Zap, Check, Ban } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatService } from '../../../services/client/chatService';
import { toast } from 'sonner'



export default function ChatAssistant({ variant = "fixed", customWelcomeMessage = null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [confirmingIndex, setConfirmingIndex] = useState(null);

    // 1. הוספת דגל לבדיקה אם אנחנו בדפדפן
    const [mounted, setMounted] = useState(false);// דגל שמראה אם הקומפוננטה כבר רונדרה בצד הלקוח
    const messagesEndRef = useRef(null);


    // 2. עדכון הדגל בטעינה ראשונה
    useEffect(() => {
        setMounted(true);
    }, []);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const initialText = customWelcomeMessage || "היי גיימר! אני כאן כדי לעזור לך לנצח. מה עושים היום?";
            setMessages([{ text: initialText, user: "bot" }]);
        }
    }, [isOpen, customWelcomeMessage, messages.length]);

    useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const currentInput = input;
        const userMessage = { text: currentInput, user: "me" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await chatService.getAnswer({ prompt: currentInput });

            console.log("Server Response:", response);

            const botText = response?.text || "משהו השתבש בקבלת התשובה";
            const isActionMessage = response?.isAction || false;

            setMessages((prev) => [...prev, {
                text: botText,
                user: "bot",
                isAction: isActionMessage,
                requiresConfirmation: response?.requiresConfirmation || false,
                confirmAction: response?.confirmAction || null,
                items: response?.items || [],
                status: response?.status || null,
                confirmationHandled: false,
            }]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { text: "שגיאה בחיבור לשרת...", user: "bot" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmation = async (messageIndex, approved) => {
        const message = messages[messageIndex];
        if (!message?.requiresConfirmation || message.confirmationHandled) return;

        if (!approved) {
            setMessages((prev) => prev.map((msg, idx) => idx === messageIndex ? {
                ...msg,
                confirmationHandled: true,
                text: `${msg.text}\n\nהפעולה בוטלה.`,
            } : msg));
            return;
        }

        setConfirmingIndex(messageIndex);

        try {
            const response = await chatService.confirmAction(message.confirmAction);
            setMessages((prev) => prev.map((msg, idx) => idx === messageIndex ? {
                ...msg,
                confirmationHandled: true,
            } : msg));
            setMessages((prev) => [...prev, {
                text: response?.text || "הפעולה הסתיימה.",
                user: "bot",
                isAction: true,
                status: response?.status || null,
            }]);
            toast.success("הפעולה בוצעה");
        } catch (error) {
            console.error("Confirmation Error:", error);
            setMessages((prev) => [...prev, { text: "לא הצלחתי לבצע את הפעולה.", user: "bot", isAction: true }]);
        } finally {
            setConfirmingIndex(null);
        }
    };

    // 3. אם אנחנו עדיין בשרת, מחזירים null או שלד ריק כדי למנוע Mismatch
    if (!mounted) return null;

    // הגדרת מיקום חלון הצ'אט לפי ה-variant
    const chatWindowStyles = variant === "fixed"
        ? "fixed bottom-24 right-6"
        : "absolute top-full mt-4 right-0";

    return (
        <div className={variant === "fixed" ? "" : "relative"}>
            {/* כפתור הפתיחה */}
            <motion.div
                initial={variant === "fixed" ? { scale: 0, rotate: -45 } : { opacity: 0 }}
                animate={variant === "fixed" ? { scale: 1, rotate: 0 } : { opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={variant === "fixed" ? "fixed bottom-6 right-6 z-[9999]" : "z-[9999]"}
            >
                {/* הילה פועמת (רק במצב Fixed) */}
                {variant === "fixed" && !isOpen && (
                    <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                )}

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative flex items-center justify-center overflow-hidden group transition-all
                        ${variant === "fixed"
                            ? "w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl border border-white/30 shadow-2xl"
                            : "px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl gap-2 text-sm text-white font-medium"
                        }`}
                >
                    {/* אפקט סריקה (Shimmer) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    {isOpen ? <X className="w-6 h-6" /> : (
                        <>
                            <Gamepad2 className={variant === "fixed" ? "w-8 h-8" : "w-4 h-4 text-blue-400"} />
                        </>
                    )}
                    {!isOpen && <Zap className="absolute top-1 right-1 w-3 h-3 text-yellow-300 fill-yellow-300 animate-bounce" />}
                </button>
            </motion.div>

            {/* חלון הצ'אט */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`${chatWindowStyles} w-[350px] md:w-[380px] h-[550px] bg-slate-950/95 backdrop-blur-2xl border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.7)] flex flex-col z-[10000] overflow-hidden`}
                    >
                        {/* RGB Header Line */}
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 w-full" />

                        <div className="p-4 bg-white/5 flex justify-between items-center border-b border-white/10 text-right" dir="rtl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)] text-blue-400">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm tracking-wide">CORTEX AI</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] text-slate-400 uppercase tracking-widest">System Live</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition-all text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white/5" dir="rtl">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.user === 'me' ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={`flex ${msg.user === 'me' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.user === 'me'
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg'
                                        : 'bg-slate-800/90 text-slate-100 border border-white/5 rounded-tl-none'
                                        }`}>
                                        {/* כאן קורה השינוי: */}
                                        {msg.user === 'bot' ? (
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                {msg.requiresConfirmation && (
                                                    <div className="not-prose mt-3 border-t border-white/10 pt-3">
                                                        {msg.items?.length > 0 && (
                                                            <div className="mb-3 space-y-1.5">
                                                                {msg.items.slice(0, 6).map((item) => (
                                                                    <div key={`${item.id}-${item.title || item.content || item.gameTitle}`} className="rounded-lg bg-white/5 px-2.5 py-2 text-xs text-slate-200">
                                                                        <span className="font-semibold text-white">{item.title || item.gameTitle || `#${item.id}`}</span>
                                                                        {item.content && <span className="block text-slate-400 line-clamp-2">{item.content}</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleConfirmation(idx, true)}
                                                                disabled={msg.confirmationHandled || confirmingIndex === idx}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <Check size={14} />
                                                                כן, בצע
                                                            </button>
                                                            <button
                                                                onClick={() => handleConfirmation(idx, false)}
                                                                disabled={msg.confirmationHandled || confirmingIndex === idx}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <Ban size={14} />
                                                                בטל
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-1.5 p-2 bg-slate-800/50 w-fit rounded-full px-4 border border-white/5">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-950 border-t border-white/10">
                            <div className="flex gap-2 items-center bg-slate-900 rounded-2xl p-1.5 border border-white/5 focus-within:border-blue-500/40 transition-all shadow-inner" dir="rtl">
                                <input
                                    className="flex-1 bg-transparent p-2 text-white outline-none text-sm placeholder:text-slate-600"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder="שלח הודעה למערכת..."
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim()}
                                    className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-30"
                                >
                                    <Send size={16} className="text-white transform rotate-180" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2s infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}
