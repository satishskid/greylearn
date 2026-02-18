"use client";

import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { X, Check, AlertCircle, Loader2, Key } from "lucide-react";

export default function ApiKeySettings() {
    const { googleApiKey, setGoogleApiKey, groqApiKey, setGroqApiKey, preferredProvider, setPreferredProvider, isSettingsOpen, setIsSettingsOpen } = useSettings();
    const [validating, setValidating] = useState(false);
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

    if (!isSettingsOpen) return null;

    const validateKey = async (provider: 'google' | 'groq') => {
        const key = provider === 'google' ? googleApiKey : groqApiKey;
        if (!key) return;
        setValidating(true);
        setStatus('idle');
        try {
            const res = await fetch("/api/validate-key", {
                method: "POST",
                body: JSON.stringify({ apiKey: key, provider }),
            });
            const data = await res.json();
            setStatus(data.valid ? 'valid' : 'invalid');
        } catch {
            setStatus('invalid');
        } finally {
            setValidating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-500" /> API Settings
                    </h2>
                    <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">Preferred AI Provider</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPreferredProvider('google')}
                                className={`flex-1 py-3 px-4 rounded-xl border transition-all relative overflow-hidden ${preferredProvider === 'google'
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <div className="font-semibold">Google Gemini</div>
                                <div className="text-[10px] opacity-70">Multimodal & Reasoning</div>
                            </button>
                            <button
                                onClick={() => setPreferredProvider('groq')}
                                className={`flex-1 py-3 px-4 rounded-xl border transition-all relative overflow-hidden ${preferredProvider === 'groq'
                                        ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <div className="font-semibold">Groq</div>
                                <div className="text-[10px] opacity-70">Ultra-Fast Inference</div>
                            </button>
                        </div>
                    </div>

                    {/* Google Input */}
                    <div className={preferredProvider === 'google' ? 'block' : 'hidden'}>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Google Gemini API Key</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={googleApiKey}
                                onChange={(e) => {
                                    setGoogleApiKey(e.target.value);
                                    setStatus('idle');
                                }}
                                placeholder="AIzaSy..."
                                className={`flex-1 bg-slate-800 border ${status === 'valid' && preferredProvider === 'google' ? 'border-emerald-500' :
                                    status === 'invalid' && preferredProvider === 'google' ? 'border-red-500' : 'border-slate-700'
                                    } rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                            />
                            <button
                                onClick={() => validateKey('google')}
                                disabled={validating || !googleApiKey}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                            >
                                {validating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Test"}
                            </button>
                        </div>
                        <p className="text-slate-500 text-xs mt-2">Get key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 hover:underline">Google AI Studio</a>.</p>
                    </div>

                    {/* Groq Input */}
                    <div className={preferredProvider === 'groq' ? 'block' : 'hidden'}>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Groq API Key</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={groqApiKey}
                                onChange={(e) => {
                                    setGroqApiKey(e.target.value);
                                    setStatus('idle');
                                }}
                                placeholder="gsk_..."
                                className={`flex-1 bg-slate-800 border ${status === 'valid' && preferredProvider === 'groq' ? 'border-emerald-500' :
                                    status === 'invalid' && preferredProvider === 'groq' ? 'border-red-500' : 'border-slate-700'
                                    } rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                            />
                            <button
                                onClick={() => validateKey('groq')}
                                disabled={validating || !groqApiKey}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-50"
                            >
                                {validating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Test"}
                            </button>
                        </div>
                        <p className="text-slate-500 text-xs mt-2">Get key from <a href="https://console.groq.com/keys" target="_blank" className="text-orange-400 hover:underline">Groq Console</a>.</p>
                    </div>

                    {status === 'valid' && <p className="text-emerald-500 text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Key is valid.</p>}
                    {status === 'invalid' && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Invalid API Key.</p>}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                    <button
                        onClick={() => setIsSettingsOpen(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
