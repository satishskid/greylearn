"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User as UserIcon, Settings } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import { useSettings } from "@/context/SettingsContext";

interface Message {
    role: "user" | "model";
    text: string;
}

interface ChatSidebarProps {
    courseContext: string;
}

export default function ChatSidebar({ courseContext }: ChatSidebarProps) {
    const { googleApiKey, groqApiKey, preferredProvider, setIsSettingsOpen } = useSettings();
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: "Hello! I'm your AI tutor. Configure your API key to start chatting." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        if (!googleApiKey) {
            setMessages(prev => [...prev, { role: "model", text: "Please set your Google API Key in settings to continue." }]);
            setIsSettingsOpen(true);
            return;
        }

        const userMessage: Message = { role: "user", text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            if (preferredProvider === 'google' && !googleApiKey) {
                setMessages(prev => [...prev, { role: "model", text: "Please set your Google API Key in settings." }]);
                setIsSettingsOpen(true);
                return;
            }
            if (preferredProvider === 'groq' && !groqApiKey) {
                setMessages(prev => [...prev, { role: "model", text: "Please set your Groq API Key in settings." }]);
                setIsSettingsOpen(true);
                return;
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-google-api-key": googleApiKey || "",
                    "x-groq-api-key": groqApiKey || "",
                    "x-provider": preferredProvider
                },
                body: JSON.stringify({ message: userMessage.text, context: courseContext }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { role: "model", text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "model", text: "Network error. Please check your connection." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <aside className="w-96 border-l border-slate-800 bg-slate-900/50 flex flex-col h-screen sticky top-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${(preferredProvider === 'google' && googleApiKey) || (preferredProvider === 'groq' && groqApiKey)
                            ? 'bg-emerald-500' : 'bg-red-500'
                        } animate-pulse`}></div>
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-slate-300 leading-none">MedAI Tutor</h3>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            {preferredProvider === 'groq' ? '⚡ Groq Fast Inference' : '✨ Gemini 2.0 Flash'}
                        </span>
                    </div>
                </div>
                <button onClick={() => setIsSettingsOpen(true)} className="text-slate-500 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                            {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`rounded-2xl p-3 text-sm max-w-[85%] ${msg.role === 'user'
                            ? 'bg-blue-600/20 text-blue-100 rounded-tr-sm'
                            : 'bg-slate-800 text-slate-300 rounded-tl-sm'
                            }`}>
                            {msg.role === 'model' ? (
                                <MarkdownRenderer content={msg.text} />
                            ) : (
                                <p>{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            <span className="text-xs text-slate-400">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-white placeholder:text-slate-500 resize-none h-[50px] max-h-[120px]"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-600 mt-2">
                    AI can make mistakes. Verify important medical info.
                </p>
            </div>
        </aside>
    );
}
