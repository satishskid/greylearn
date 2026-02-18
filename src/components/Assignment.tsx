"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

interface AssignmentProps {
    courseContext: string;
    courseId: string;
}

export default function Assignment({ courseContext, courseId }: AssignmentProps) {
    const { user } = useAuth();
    const { googleApiKey, setIsSettingsOpen } = useSettings();
    const [submission, setSubmission] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ status: 'passed' | 'failed', feedback: string } | null>(null);

    useEffect(() => {
        const loadProgress = async () => {
            if (!user || !courseId) return;
            try {
                const docRef = doc(db, "users", user.uid, "assignments", courseId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSubmission(data.submission);
                    setResult({ status: data.status, feedback: data.feedback });
                }
            } catch (error) {
                console.error("Error loading progress:", error);
            }
        };
        loadProgress();
    }, [user, courseId]);

    const handleSubmit = async () => {
        if (!submission.trim() || loading || !user) return;

        setLoading(true);
        setResult(null);

        try {
            if (!googleApiKey) {
                alert("Please set your API Key in settings.");
                setIsSettingsOpen(true);
                return;
            }

            const response = await fetch("/api/grade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-google-api-key": googleApiKey
                },
                body: JSON.stringify({ submission, context: courseContext }),
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                // Save to Firestore
                await setDoc(doc(db, "users", user.uid, "assignments", courseId), {
                    submission,
                    status: data.status,
                    feedback: data.feedback,
                    timestamp: serverTimestamp()
                });
            } else {
                alert("Failed to submit assignment. Please try again.");
            }
        } catch (error) {
            console.error("Grading error:", error);
            alert("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="mt-12 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-center">
                <p className="text-slate-400">Please log in to submit assignments.</p>
            </div>
        );
    }

    return (
        <div className="mt-12 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                Knowledge Check
            </h2>
            <p className="text-slate-400 mb-4">
                Synthesize what you&apos;ve learned. Describe the core mechanism discussed in this module.
            </p>

            <textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-none h-32 mb-4"
            />

            <div className="flex items-center justify-between">
                <button
                    onClick={handleSubmit}
                    disabled={loading || !submission.trim()}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Assignment"}
                </button>

                {result && (
                    <div className={`flex items-center gap-2 ${result.status === 'passed' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.status === 'passed' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <span className="font-semibold uppercase">{result.status}</span>
                    </div>
                )}
            </div>

            {result && (
                <div className={`mt-4 p-4 rounded-lg text-sm border ${result.status === 'passed'
                    ? 'bg-emerald-950/30 border-emerald-900 text-emerald-200'
                    : 'bg-red-950/30 border-red-900 text-red-200'
                    }`}>
                    <strong>Feedback:</strong> {result.feedback}
                </div>
            )}
        </div>
    );
}
