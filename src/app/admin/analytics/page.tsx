"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { Loader2, Users, BookOpen, GraduationCap, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
    totalUsers: number;
    verifiedUsers: number;
    totalCourses: number;
    recentSignups: any[];
}

export default function AnalyticsPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && (!user || userData?.role !== 'admin')) {
            router.push("/");
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch Users
                const usersSnap = await getDocs(collection(db, "users"));
                const totalUsers = usersSnap.size;
                const verifiedUsers = usersSnap.docs.filter(doc => doc.data().status === 'approved').length;

                // Fetch Courses
                const coursesSnap = await getDocs(collection(db, "courses"));
                const totalCourses = coursesSnap.size;

                // Fetch Recent Signups (mocking sort for now as created_at might need index)
                const recentSignups = usersSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds)
                    .slice(0, 5);

                setData({
                    totalUsers,
                    verifiedUsers,
                    totalCourses,
                    recentSignups
                });
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoadingData(false);
            }
        };

        if (user && userData?.role === 'admin') {
            fetchData();
        }
    }, [user, userData, loading, router]);

    if (loading || loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-slate-900 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Platform Analytics
                    </h1>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Users"
                        value={data?.totalUsers || 0}
                        icon={<Users className="w-6 h-6 text-blue-400" />}
                        trend="+12% from last week"
                    />
                    <MetricCard
                        title="Verified Students"
                        value={data?.verifiedUsers || 0}
                        icon={<CheckUserIcon className="w-6 h-6 text-emerald-400" />}
                        trend="Active Learners"
                    />
                    <MetricCard
                        title="Live Courses"
                        value={data?.totalCourses || 0}
                        icon={<BookOpen className="w-6 h-6 text-purple-400" />}
                        trend="Content Library"
                    />
                    <MetricCard
                        title="Avg. Engagement"
                        value="84%"
                        icon={<TrendingUp className="w-6 h-6 text-orange-400" />}
                        trend="Completion Rate"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Visualizations Placeholder */}
                    <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            User Growth
                        </h3>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {[40, 65, 45, 80, 55, 90, 100].map((h, i) => (
                                <div key={i} className="w-full bg-slate-800 rounded-t-lg relative group">
                                    <div
                                        style={{ height: `${h}%` }}
                                        className="absolute bottom-0 w-full bg-blue-600/50 rounded-t-lg transition-all group-hover:bg-blue-500"
                                    ></div>
                                    <div className="absolute -bottom-6 w-full text-center text-xs text-slate-500">Day {i + 1}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-500" />
                            Recent Signups
                        </h3>
                        <div className="space-y-4">
                            {data?.recentSignups.map((signup) => (
                                <div key={signup.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                        {signup.displayName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{signup.displayName || 'Unknown User'}</p>
                                        <p className="text-xs text-slate-400">{signup.email}</p>
                                    </div>
                                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${signup.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {signup.status}
                                    </span>
                                </div>
                            ))}
                            {data?.recentSignups.length === 0 && (
                                <p className="text-slate-500 text-center py-4">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: number | string, icon: React.ReactNode, trend: string }) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
                <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{trend}</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}

function CheckUserIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <polyline points="17 11 19 13 23 9" />
        </svg>
    )
}
