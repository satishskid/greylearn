"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle, Award } from "lucide-react";
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";
import { useParams } from "next/navigation";

interface CourseData {
    id: string;
    title: string;
    content: string;
    description: string;
}

import ChatSidebar from "@/components/ChatSidebar";
import Assignment from "@/components/Assignment";

export default function CourseViewerPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const [course, setCourse] = useState<CourseData | null>(null);
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        if (!loading && userData && userData.status !== 'approved' && userData.role !== 'admin') {
            router.push("/");
            return;
        }

        const fetchCourseAndStatus = async () => {
            if (!courseId) return;
            try {
                // Fetch Course
                const docRef = doc(db, "courses", courseId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() } as CourseData);
                } else {
                    console.log("No such course!");
                    // Fallback for demo/scraped courses if not in DB?
                    // For now, assuming DB only for detailed view
                }

                // Check Completion/Registration Status
                if (user) {
                    const q = query(
                        collection(db, "registrations"),
                        where("userId", "==", user.uid),
                        where("courseId", "==", courseId)
                    );
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        const status = snapshot.docs[0].data().status;
                        if (status === 'completed') {
                            setIsCompleted(true);
                        }
                    }
                }

            } catch (error) {
                console.error("Error fetching course:", error);
            } finally {
                setLoadingCourse(false);
            }
        };

        if (user) {
            fetchCourseAndStatus();
        }

    }, [user, userData, loading, courseId, router]);

    const handleCompleteCourse = async () => {
        if (!user || !course) return;
        setCompleting(true);
        try {
            // Check if registration exists
            const q = query(
                collection(db, "registrations"),
                where("userId", "==", user.uid),
                where("courseId", "==", courseId)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Update existing
                const regDoc = snapshot.docs[0];
                await updateDoc(doc(db, "registrations", regDoc.id), {
                    status: 'completed',
                    completedAt: serverTimestamp()
                });
            } else {
                // Create new as completed (if they didn't register interest but were accessing directly, e.g. admin or open course)
                await addDoc(collection(db, "registrations"), {
                    courseId: course.id,
                    courseTitle: course.title,
                    userId: user.uid,
                    userEmail: user.email,
                    userName: user.displayName || 'Student',
                    status: 'completed',
                    completedAt: serverTimestamp(),
                    createdAt: serverTimestamp()
                });
            }
            setIsCompleted(true);
            router.push(`/certificates/${courseId}`);
        } catch (error) {
            console.error("Error completing course:", error);
        } finally {
            setCompleting(false);
        }
    };

    if (loading || loadingCourse) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
                <h1 className="text-2xl font-bold">Course Not Found</h1>
                <Link href="/" className="text-blue-400 hover:text-blue-300">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Main Content Area */}
            <main className="flex-1 max-w-4xl mx-auto p-8 relative flex flex-col min-h-screen">
                <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors self-start">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <article className="prose prose-invert prose-lg max-w-none flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
                                {course.title}
                            </h1>
                            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
                                {course.description}
                            </p>
                        </div>
                        {isCompleted && (
                            <Link
                                href={`/certificates/${courseId}`}
                                className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/50 transition-all font-bold shadow-lg shadow-emerald-900/20"
                            >
                                <Award className="w-5 h-5" />
                                View Certificate
                            </Link>
                        )}
                    </div>

                    <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 mb-12">
                        <MarkdownRenderer content={course.content} />
                    </div>

                    {/* Completion Section */}
                    <div className="border-t border-slate-800 pt-12 pb-20 flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                            <CheckCircle className={`w-8 h-8 ${isCompleted ? 'text-emerald-500' : 'text-slate-600'}`} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Course Completion</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                {isCompleted
                                    ? "You have successfully completed this course. Your certificate is ready."
                                    : "Finished reading? Mark this course as complete to earn your certificate."}
                            </p>
                        </div>

                        {!isCompleted ? (
                            <button
                                onClick={handleCompleteCourse}
                                disabled={completing}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                            >
                                {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                Complete Course & Get Certificate
                            </button>
                        ) : (
                            <div className="px-6 py-2 bg-emerald-500/10 text-emerald-400 rounded-full font-medium border border-emerald-500/20">
                                Completed on {new Date().toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    {/* Assignments */}
                    {/* <Assignment courseContext={course.content} courseId={course.id} /> */}
                </article>
            </main>

            {/* AI Sidebar */}
            <div className="hidden xl:block w-96 shrink-0 relative">
                <div className="fixed top-0 bottom-0 w-96 border-l border-slate-800 bg-slate-900/50">
                    <ChatSidebar courseContext={course.content || ""} />
                </div>
            </div>
        </div>
    );
}
