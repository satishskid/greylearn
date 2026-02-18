"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Sparkles, FileText, Upload, Eye } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function CreateCoursePage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState("draft"); // draft, upcoming, published
    const [price, setPrice] = useState("");
    const [startDate, setStartDate] = useState("");

    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'import'>('edit');

    useEffect(() => {
        if (!loading && (!user || userData?.role !== 'admin')) {
            router.push(user ? "/" : "/login");
        }
    }, [user, userData, loading, router]);

    if (loading || !userData) return null;

    const handleSave = async () => {
        if (!title || !description) return;
        setSaving(true);
        try {
            await addDoc(collection(db, "courses"), {
                title,
                description,
                content, // Can be empty if "Upcoming"
                authorId: user?.uid,
                status,
                price,
                startDate,
                createdAt: serverTimestamp(),
            });
            router.push("/admin");
        } catch (error) {
            console.error("Error saving course:", error);
        } finally {
            setSaving(false);
        }
    };

    const generateOutline = async () => {
        setGenerating(true);
        // Placeholder for AI Generation
        setTimeout(() => {
            setContent(prev => prev + `\n\n## AI Generated Outline\n- Module 1: Introduction\n- Module 2: Core Concepts\n`);
            setGenerating(false);
            setActiveTab('edit');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Course Coordinator Studio
                    </h1>
                    <div className="flex items-center gap-4">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="draft">Draft (Hidden)</option>
                            <option value="upcoming">Upcoming (Announce)</option>
                            <option value="published">Published (Live)</option>
                        </select>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {status === 'upcoming' ? 'Announce Course' : 'Save Course'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
                    {/* Editor Column */}
                    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
                        {/* Metadata Card */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                            <input
                                type="text"
                                placeholder="Course Title (e.g. Advanced AI Strategy)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <textarea
                                placeholder="Short Description (Hook performance...)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Price (e.g. Free, $49)"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Start Date (e.g. March 1st)"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="flex-1 flex flex-col relative bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="bg-slate-800/80 p-2 flex gap-2 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
                                <button
                                    onClick={() => setActiveTab('edit')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    <FileText className="w-3.5 h-3.5" /> Write
                                </button>
                                <button
                                    onClick={() => setActiveTab('import')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'import' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    <Upload className="w-3.5 h-3.5" /> Manual Import
                                </button>
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    <Eye className="w-3.5 h-3.5" /> Preview
                                </button>
                                <div className="flex-1"></div>
                                <button
                                    onClick={generateOutline}
                                    disabled={generating}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-400/10 transition-colors border border-amber-400/20"
                                >
                                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    AI Assist
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden relative">
                                {activeTab === 'edit' && (
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="# Course Content\n\nStart writing or paste your NotebookLM output here..."
                                        className="w-full h-full bg-transparent p-6 font-mono text-sm focus:outline-none resize-none text-slate-300 leading-relaxed"
                                    />
                                )}
                                {activeTab === 'import' && (
                                    <div className="p-6 h-full flex flex-col gap-4">
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-300">
                                            <p className="font-semibold mb-1">Backup Generator / Manual Upload</p>
                                            <p>If the AI module fails, generate content externally (e.g. NotebookLM, ChatGPT) and paste it below. We support <strong>Markdown</strong>, <strong>Mermaid Diagrams</strong>, and code blocks.</p>
                                        </div>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Paste Markdown content here..."
                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none text-slate-400"
                                        />
                                    </div>
                                )}
                                {activeTab === 'preview' && (
                                    <div className="h-full overflow-y-auto p-8 prose prose-invert max-w-none">
                                        <MarkdownRenderer content={content || "*No content to preview*"} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Column */}
                    <div className="hidden lg:flex flex-col bg-white text-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                        <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Student View</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10">
                            <div className="max-w-2xl mx-auto">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 mb-6 uppercase tracking-wide">
                                    {status === 'upcoming' ? 'Coming Soon' : 'Course Preview'}
                                </div>
                                <h1 className="text-4xl font-bold text-slate-900 mb-4">{title || "Course Title"}</h1>
                                <p className="text-xl text-slate-600 mb-8 leading-relaxed">{description || "Course description..."}</p>

                                {status === 'upcoming' && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-center">
                                        <p className="font-semibold text-slate-900 mb-2">Registration Opens: {startDate || "Soon"}</p>
                                        <button className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold shadow-lg opacity-50 cursor-not-allowed">
                                            Register Interest (Preview)
                                        </button>
                                    </div>
                                )}

                                <div className="prose prose-slate prose-lg max-w-none">
                                    <MarkdownRenderer content={content} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
