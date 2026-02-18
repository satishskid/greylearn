"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, Check, GraduationCap, LayoutDashboard, Loader2, Lock, Sparkles, Users, Calendar, Bell } from "lucide-react";
import { collection, getDocs, query, where, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Course {
  id: string;
  title: string;
  description: string;
  authorId?: string;
  status?: string; // upcoming, published
  startDate?: string;
  price?: string;
}

const SCRAPED_COURSES: Course[] = [
  {
    id: "gen-ai-doctors-express",
    title: "Generative AI For Doctors - Express",
    description: "Empowering doctors, clinicians, and healthcare innovators to harness the potential of GenAI responsibly, effectively, and ethically.",
    status: "published"
  },
  {
    id: "gen-ai-healthcare-pros",
    title: "Generative AI For Healthcare Professionals",
    description: "Learn how to safely and effectively apply Generative AI in clinical practice, research, documentation, diagnostics, and healthcare operations.",
    status: "published"
  },
  {
    id: "medical-models-data",
    title: "Medical Models and Data Analytics with AI",
    description: "Covers healthcare-specific datasets, medical data analysis, and model deployment for clinical decision support and research.",
    status: "published"
  },
  {
    id: "super-agents",
    title: "Super Agents: How to Hire AI to Work For You",
    description: "Teaches you how to \"hire\" and delegate research, analysis, and strategic planning tasks to specialized AI agents.",
    status: "published"
  }
];

export default function LandingPage() {
  const { user, userData, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      const fetchRegistrations = async () => {
        const q = query(collection(db, "registrations"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const regs: Record<string, string> = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          regs[data.courseId] = data.status;
        });
        setUserRegistrations(regs);
      };
      fetchRegistrations();
    }
  }, [user]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"));
        const querySnapshot = await getDocs(q);
        const dbCourses: Course[] = [];
        querySnapshot.forEach((doc) => {
          dbCourses.push({ id: doc.id, ...doc.data() } as Course);
        });

        if (dbCourses.length > 0) {
          setCourses(dbCourses);
        } else {
          setCourses(SCRAPED_COURSES);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses(SCRAPED_COURSES);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">GreyLearn</span>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : user ? (
              <div className="flex items-center gap-4">
                {userData?.role === 'admin' && (
                  <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                    Coordinator Admin
                  </Link>
                )}
                <Link
                  href={userData?.role === 'admin' ? "/admin" : "/"}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-semibold text-slate-700 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Log in
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm text-blue-700 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Assisted by AI • Supervised by Teachers</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            GreyLearn Academy <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Deep Learning Made Easy</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Learn in your own way, assisted by AI, supervised by a real teacher.
            Experience the ease of learning with utmost depth—a level of understanding that has never happened before.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/#courses"
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
            >
              Explore Courses <ArrowRight className="w-4 h-4" />
            </Link>
            {!user && (
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold hover:bg-slate-50 transition-colors"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>
      </section>

      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<BrainCircuit className="w-8 h-8 text-blue-600" />}
              title="AI-Powered Tutor"
              description="Get instant answers and personalized explanations for any topic within your course."
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
              title="Interactive Content"
              description="Learn through executing code, viewing diagrams, and engaging with deep-dive modules."
            />
            <FeatureCard
              icon={<GraduationCap className="w-8 h-8 text-emerald-600" />}
              title="Verified Certificates"
              description="Earn certificates upon completion that are verifiable and shareable."
            />
          </div>
        </div>
      </section>

      <section id="courses" className="py-24 px-6 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Courses</h2>
              <p className="text-slate-600 text-lg">Explore our most popular AI-generated curriculums.</p>
            </div>
          </div>

          {loadingCourses ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  user={user}
                  userData={userData}
                  userRegistrationStatus={userRegistrations[course.id]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900">No Courses Yet</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                The library is currently empty. Check back soon for new content.
              </p>
              {userData?.role === 'admin' && (
                <Link href="/admin/courses/create" className="px-6 py-2 bg-blue-600 rounded-full text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                  Create First Course
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 bg-white border-t border-slate-200 px-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} GreyLearn Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="text-left group">
      <div className="mb-6 w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}

function CourseCard({ course, user, userData, userRegistrationStatus }: { course: Course, user: any, userData: any, userRegistrationStatus?: string }) {
  const isUpcoming = course.status === 'upcoming';
  const isLocked = user && userData?.status !== 'approved' && userData?.role !== 'admin';
  const isGuest = !user;
  const isCompleted = userRegistrationStatus === 'completed';

  // Logic for displaying button
  // 1. Upcoming -> "Register Interest"
  // 2. Published + Locked -> "Locked"
  // 3. Published + Unlocked -> "Start Learning"
  // 4. Guest -> "Sign in"

  const [isRegistering, setIsRegistering] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  // Sync local HasRegistered with prop if available
  useEffect(() => {
    if (userRegistrationStatus) {
      setHasRegistered(true);
    }
  }, [userRegistrationStatus]);


  const handleRegisterInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGuest) {
      window.location.href = '/login?mode=signup';
      return;
    }
    setIsRegistering(true);
    try {
      await addDoc(collection(db, "registrations"), {
        courseId: course.id,
        courseTitle: course.title,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Unknown',
        status: 'interested',
        createdAt: serverTimestamp()
      });
      setHasRegistered(true);
    } catch (error) {
      console.error("Error registering interest:", error);
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="group relative flex flex-col p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
      <div className="absolute top-6 right-6 flex gap-2">
        {course.price && (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold tracking-wide border border-slate-200">
            {course.price}
          </span>
        )}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${isUpcoming ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
          }`}>
          {isUpcoming ? 'Upcoming' : 'Course'}
        </span>
      </div>

      <div className="mb-8 mt-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md ${isUpcoming ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20' : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-600/20'
          }`}>
          {course.title.charAt(0)}
        </div>
        <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[56px]">
          {course.title}
        </h3>
        <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed h-[60px]">
          {course.description || "No description provided."}
        </p>
        {course.startDate && (
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            Starts {course.startDate}
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
        {isUpcoming ? (
          <div className="w-full">
            {hasRegistered ? (
              <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-100">
                <Check className="w-4 h-4" /> Registered
              </div>
            ) : (
              <button
                onClick={handleRegisterInterest}
                disabled={isRegistering}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
              >
                {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                {isGuest ? "Sign In to Register" : "Register Interest"}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-400">
                  <Users className="w-3 h-3" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-slate-600">
                +120
              </div>
            </div>

            {isLocked ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold bg-slate-50 px-3 py-1.5 rounded-full">
                <Lock className="w-4 h-4" />
                <span>Locked</span>
              </div>
            ) : isCompleted ? (
              <Link
                href={`/certificates/${course.id}`}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-bold group-hover:translate-x-1 transition-transform"
              >
                <Check className="w-4 h-4" /> Completed
              </Link>
            ) : (
              <Link
                href={`/courses/${course.id}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold group-hover:translate-x-1 transition-transform"
              >
                {isGuest ? "Sign in to View" : "Start Learning"} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </>
        )}
      </div>

      {/* Overlay link for whole card if unlocked and not upcoming */}
      {!isLocked && !isUpcoming && (
        <Link href={isGuest ? "/login" : (isCompleted ? `/certificates/${course.id}` : `/courses/${course.id}`)} className="absolute inset-0 z-10" aria-label={`View ${course.title}`} />
      )}
    </div>
  )
}
