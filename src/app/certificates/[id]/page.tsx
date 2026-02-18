"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Download, Share2, ArrowLeft } from "lucide-react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Certificate from "@/components/Certificate";

export default function CertificatePage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const [courseTitle, setCourseTitle] = useState("");
    const [completionDate, setCompletionDate] = useState("");
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState("");

    const certificateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login?redirect=/certificates/" + courseId);
            return;
        }

        const verifyCompletion = async () => {
            if (!user || !courseId) return;

            try {
                // Check if user has completed the course
                const q = query(
                    collection(db, "registrations"),
                    where("userId", "==", user.uid),
                    where("courseId", "==", courseId),
                    where("status", "==", "completed")
                );

                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    // Also check specifically for admin who might just want to preview
                    if (userData?.role === 'admin') {
                        setCourseTitle("Demo Course Title (Admin Preview)");
                        setCompletionDate(new Date().toLocaleDateString());
                    } else {
                        setError("Certificate not found. You have not completed this course yet.");
                    }
                } else {
                    const data = snapshot.docs[0].data();
                    setCourseTitle(data.courseTitle);
                    setCompletionDate(new Date(data.completedAt?.toDate()).toLocaleDateString());
                }
            } catch (err) {
                console.error("Error verifying certificate:", err);
                setError("Failed to verify certificate.");
            } finally {
                setVerifying(false);
            }
        };

        if (user) verifyCompletion();

    }, [user, userData, loading, courseId, router]);

    const handlePrint = () => {
        window.print();
    };

    if (loading || verifying) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🚫</span>
            </div>
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-slate-400">{error}</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white py-12 px-4 flex flex-col items-center print:bg-white print:p-0">
            <div className="w-full max-w-4xl flex items-center justify-between mb-8 print:hidden">
                <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <div className="flex gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>

            <div ref={certificateRef} className="w-full max-w-4xl print:w-[100vw] print:h-[100vh] print:max-w-none">
                <Certificate
                    studentName={user?.displayName || "Student"}
                    courseTitle={courseTitle}
                    completionDate={completionDate}
                />
            </div>
        </div>
    );
}
