"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextType {
    googleApiKey: string;
    groqApiKey: string;
    preferredProvider: 'google' | 'groq';
    setGoogleApiKey: (key: string) => void;
    setGroqApiKey: (key: string) => void;
    setPreferredProvider: (provider: 'google' | 'groq') => void;
    isSettingsOpen: boolean;
    setIsSettingsOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Initialize state from localStorage if available
    const [googleApiKey, setGoogleApiKeyState] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem("google_api_key") || "";
        return "";
    });
    const [groqApiKey, setGroqApiKeyState] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem("groq_api_key") || "";
        return "";
    });
    const [preferredProvider, setPreferredProviderState] = useState<'google' | 'groq'>(() => {
        if (typeof window !== 'undefined') return (localStorage.getItem("preferred_provider") as 'google' | 'groq') || "google";
        return "google";
    });

    const setGoogleApiKey = (key: string) => {
        setGoogleApiKeyState(key);
        localStorage.setItem("google_api_key", key);
    };

    const setGroqApiKey = (key: string) => {
        setGroqApiKeyState(key);
        localStorage.setItem("groq_api_key", key);
    };

    const setPreferredProvider = (provider: 'google' | 'groq') => {
        setPreferredProviderState(provider);
        localStorage.setItem("preferred_provider", provider);
    };

    return (
        <SettingsContext.Provider
            value={{
                googleApiKey,
                groqApiKey,
                preferredProvider,
                setGoogleApiKey,
                setGroqApiKey,
                setPreferredProvider,
                isSettingsOpen,
                setIsSettingsOpen,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
