import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, apiKey, provider } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ valid: false, error: "API Key is missing" }, { status: 400 });
        }

        if (provider === "google") {
            try {
                const genAI = new GoogleGenAI({ apiKey });
                // Use a lightweight model for validation
                await genAI.models.generateContent({
                    model: "gemini-1.5-flash",
                    contents: [{ role: "user", parts: [{ text: "Test" }] }]
                });
                return NextResponse.json({ valid: true });
            } catch (error) {
                console.error("Gemini Validation Error:", error);
                return NextResponse.json({ valid: false, error: "Invalid Gemini Key" }, { status: 400 });
            }
        }

        // Placeholder for Groq
        if (provider === "groq") {
            // Implement Groq validation when ready
            return NextResponse.json({ valid: true });
        }

        return NextResponse.json({ valid: false, error: "Unknown provider" }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
    }
}
