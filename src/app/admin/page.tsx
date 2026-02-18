"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogOut, CheckCircle, XCircle, BarChart3, Plus, Bell, Users, Search } from "lucide-react";
import { collection, query, onSnapshot, doc, updateDoc, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserData {
    uid: string;
    email: string;
    displayName: string;
    role: string;
    status: string;
}

interface Registration {
    id: string;
    courseId: string;
    courseTitle: string;
    userId: string;
    userEmail: string;
    userName: string;
    status: string; // interested, attracted, converted
    createdAt: any;
}

export default function AdminPage() {
    const { user, userData, loading, logout } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'whitelist' | 'registrations'>('registrations');

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        if (!loading && userData && userData.role !== 'admin') {
            router.push("/");
            return;
        }

        if (user && userData?.role === 'admin') {
            const unsubUsers = onSnapshot(query(collection(db, "users")), (snap) => {
                const usersData: UserData[] = [];
                snap.forEach((doc) => usersData.push(doc.data() as UserData));
                setUsers(usersData);
            });

            const unsubRegs = onSnapshot(query(collection(db, "registrations"), orderBy("createdAt", "desc")), (snap) => {
                const regsData: Registration[] = [];
                snap.forEach((doc) => regsData.push({ id: doc.id, ...doc.data() } as Registration));
                setRegistrations(regsData);
                setLoadingData(false);
            });

            return () => {
                unsubUsers();
                unsubRegs();
            }
        }
    }, [user, userData, loading, router]);

    if (loading || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const toggleStatus = async (uid: string, currentStatus: string) => {
        const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
        try {
            await updateDoc(doc(db, "users", uid), { status: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            Coordinator Dashboard
                        </h1>
                        <p className="text-slate-400 mt-1">Manage cohorts, traction, and course access</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-medium text-white">{userData.displayName}</p>
                            <p className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                {userData.role.toUpperCase()}
                            </p>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Quick Actions / Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{users.length}</p>
                            <p className="text-xs text-slate-400">Total Students</p>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{registrations.length}</p>
                            <p className="text-xs text-slate-400">Course Interests</p>
                        </div>
                    </div>

                    <Link href="/admin/courses/create" className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center gap-2 font-bold hover:shadow-lg hover:shadow-blue-600/20 transition-all">
                        <Plus className="w-5 h-5" /> Announce New Course
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1">
                    <button
                        onClick={() => setActiveTab('registrations')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'registrations' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Interest & Traction
                        {activeTab === 'registrations' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('whitelist')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'whitelist' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        User Whitelist
                        {activeTab === 'whitelist' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                    </button>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden min-h-[400px]">
                    {activeTab === 'registrations' && (
                        <div>
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Incoming Registrations (Traction)</h2>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Search..." className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm" />
                                </div>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-slate-400">
                                    <tr>
                                        <th className="p-4 font-medium">Student</th>
                                        <th className="p-4 font-medium">Interested In</th>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {registrations.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">No registrations yet. Announce a course!</td></tr>
                                    ) : registrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-slate-800/30">
                                            <td className="p-4">
                                                <p className="font-medium text-white">{reg.userName}</p>
                                                <p className="text-xs text-slate-400">{reg.userEmail}</p>
                                            </td>
                                            <td className="p-4 text-blue-300">{reg.courseTitle}</td>
                                            <td className="p-4 text-slate-500 text-sm">
                                                {reg.createdAt?.toDate ? new Date(reg.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                            </td>
                                            <td className="p-4">
                                                {reg.status === 'completed' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                                        <CheckCircle className="w-3 h-3" /> Certified
                                                    </span>
                                                ) : (
                                                    <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 border border-emerald-500/20 opacity-50 cursor-not-allowed" title="Not yet implemented">
                                                        Convert to Paid
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'whitelist' && (
                        <div>
                            <div className="p-6 border-b border-slate-800">
                                <h2 className="text-xl font-semibold">Global Key (Whitelist)</h2>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-slate-400">
                                    <tr>
                                        <th className="p-4 font-medium">Name</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {users.map((u) => (
                                        <tr key={u.uid} className="hover:bg-slate-800/30">
                                            <td className="p-4">
                                                <div className="font-medium">{u.displayName}</div>
                                                <div className="text-xs text-slate-400">{u.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.status === 'approved'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm capitalize">{u.role}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => toggleStatus(u.uid, u.status)}
                                                    disabled={u.role === 'admin'}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${u.status === 'approved'
                                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                        }`}
                                                >
                                                    {u.status === 'approved' ? 'Revoke Access' : 'Approve Key'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
