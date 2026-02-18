import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, context } = await req.json();

        // Headers
        const provider = req.headers.get("x-provider") || "google";
        const googleKey = req.headers.get("x-google-api-key") || process.env.GOOGLE_API_KEY;
        const groqKey = req.headers.get("x-groq-api-key");

        // --- GROQ PROVIDER LOGIC ---
        if (provider === 'groq') {
            if (!groqKey) {
                return NextResponse.json({ error: "Groq API Key missing" }, { status: 401 });
            }

            const systemPrompt = `You are an expert medical tutor for the MedAI Academy.
Goal: Help students understand course material.
Answer strictly based on the Context below. If not found, say "I cannot find the answer in the course material."
Keep answers concise and educational.

Context:
${context}
            `;

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${groqKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3-70b-8192", // Fast & capable model
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message }
                    ],
                    temperature: 0.5,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Groq API Error: ${err}`);
            }

            const data = await response.json();
            return NextResponse.json({ reply: data.choices[0].message.content });
        }

        // --- GOOGLE GEMINI LOGIC (Default) ---
        if (!googleKey) {
            return NextResponse.json({ error: "API Key not provided. Please set it in settings." }, { status: 401 });
        }

        // Initialize new SDK client
        const ai = new GoogleGenAI({ apiKey: googleKey });

        const systemPrompt = `
You are an expert medical tutor for the MedAI Academy.
Your goal is to help students understand the course material.
Answer the student's question based strictly on the provided course context.
If the answer is not in the context, say "I cannot find the answer in the course material."
Keep answers concise and educational.

Course Context:
${context}
    `;

        // Use gemini-3-flash-preview for fast, high-quality chat
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "user", parts: [{ text: message }] }
            ],
            config: {
                temperature: 0.5,
            }
        });

        const text = response.text || "No response generated.";
        return NextResponse.json({ reply: text });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
