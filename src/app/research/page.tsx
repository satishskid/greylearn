"use client";

import React, { useState } from 'react';
import { MonographViewer } from '@/components/MonographViewer';
import { Loader2, Search, BookOpenCheck, Settings } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function ResearchPage() {
    const { googleApiKey, setIsSettingsOpen } = useSettings();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [monographData, setMonographData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleJsonData = (data: any) => {
        // Validate basic structure if needed, for now assuming API returns correct schema
        setMonographData(data);
    };

    const generateMonograph = async () => {
        if (!topic.trim()) return;

        setLoading(true);
        setError(null);
        setMonographData(null);

        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (googleApiKey) {
                headers['x-google-api-key'] = googleApiKey;
            }

            const response = await fetch('/api/research', {
                method: 'POST',
                headers,
                body: JSON.stringify({ topic }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate monograph');
            }

            const data = await response.json();
            handleJsonData(data);
        } catch (err) {
            setError('Failed to generate monograph. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 md:p-8 relative">
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors z-10"
                aria-label="Open Settings"
            >
                <Settings className="w-6 h-6" />
            </button>
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                {/* Header / Search Area */}
                <div className={`transition-all duration-500 ease-in-out ${monographData ? 'mb-8' : 'flex-1 flex flex-col justify-center items-center'}`}>
                    <div className={`w-full max-w-2xl ${monographData ? '' : 'text-center space-y-8'}`}>
                        {!monographData && (
                            <>
                                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
                                    <BookOpenCheck size={40} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                                    Deep Research Monograph
                                </h1>
                                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
                                    Generate exhaustive, interactive study guides on any topic using Gemini 3.0&apos;s advanced reasoning engine.
                                </p>
                            </>
                        )}

                        <div className="relative group w-full">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && generateMonograph()}
                                placeholder="Enter a topic needed for deep research (e.g., 'Quantum Entanglement history')..."
                                className="w-full p-4 pl-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-lg"
                                disabled={loading}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <button
                                onClick={generateMonograph}
                                disabled={loading || !topic.trim()}
                                className="absolute right-2 top-2 bottom-2 px-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate'}
                            </button>
                        </div>

                        {loading && (
                            <div className="mt-8 text-center animate-pulse">
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Thinking deeply...</p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">Gemini 3.0 is structuring a comprehensive analysis.</p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                {monographData && (
                    <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <MonographViewer data={monographData} />
                    </div>
                )}
            </div>
        </div>
    );
}
