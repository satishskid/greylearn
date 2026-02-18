"use client";

import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import ApiKeySettings from "@/components/ApiKeySettings";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <AuthProvider>
                {children}
                <ApiKeySettings />
            </AuthProvider>
        </SettingsProvider>
    );
}
