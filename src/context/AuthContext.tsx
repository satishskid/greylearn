"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'student' | 'admin';
    status: 'pending' | 'approved';
    createdAt: any;
    lastLoginAt: any;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Fetch user data from Firestore
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserData(userSnap.data() as UserData);
                } else {
                    // If accessing via direct link without sign-in flow logic execution, 
                    // we might want to create it here too, but usually sign-in does it.
                    // For safety, let's just leave userData null until they sign in again or we implement auto-creation here.
                    // Or we can try to create it here if it doesn't exist?
                    // Let's keep it simple: if not found, they might need to sign in again.
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Create/Update user document
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                const newUserData: UserData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    role: 'student', // Default role
                    status: 'pending', // Default status
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp(),
                };

                // Auto-approve/admin specific emails
                // Replace with your actual admin emails or environment variables
                const adminEmails = ["satish@skids.health", "satish.rath@gmail.com", "drpratichi@skids.health"];
                if (user.email && adminEmails.includes(user.email)) {
                    newUserData.role = 'admin';
                    newUserData.status = 'approved';
                }

                await setDoc(userRef, newUserData);
                setUserData(newUserData);
            } else {
                await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
                setUserData(userSnap.data() as UserData);
            }
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUserData(null);
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
