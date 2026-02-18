import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Define the schema for the monograph
// This structure supports recursive sections for deep research
const SECTION_SCHEMA = {
    type: "OBJECT",
    properties: {
        heading: { type: "STRING", description: "Section title" },
        content: { type: "STRING", description: "Detailed explanatory text for this section. Should be comprehensive." },
        key_concepts: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "List of key concepts or terms introduced in this section"
        },
        subsections: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    heading: { type: "STRING" },
                    content: { type: "STRING" },
                    key_concepts: { type: "ARRAY", items: { type: "STRING" } },
                }
            }
        }
    },
    required: ["heading", "content"]
};

const MONOGRAPH_SCHEMA = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING", description: "The main title of the monograph" },
        summary: { type: "STRING", description: "A high-level executive summary of the topic" },
        sections: {
            type: "ARRAY",
            items: SECTION_SCHEMA
        },
        quiz: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    question: { type: "STRING" },
                    options: { type: "ARRAY", items: { type: "STRING" } },
                    answer: { type: "STRING", description: "The correct answer option" },
                    explanation: { type: "STRING" }
                }
            }
        }
    },
    required: ["title", "summary", "sections", "quiz"]
};

export async function POST(req: Request) {
    try {
        const { topic } = await req.json();
        const apiKey = req.headers.get("x-google-api-key") || process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key not provided" }, { status: 401 });
        }

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `
You are a distinguished academic researcher and writer.
Your goal is to produce a "Deep Research Monograph" on the provided topic.

**Topic**: ${topic}

**Requirements**:
1.  **Exhaustive Depth**: Do not produce surface-level content. Dive deep into mechanics, history, controversy, and advanced applications.
2.  **Structure**: Create a logical flow with multiple detailed sections.
3.  **Educational Value**: Define key concepts clearly.
4.  **Interactive Quiz**: Generate 5 challenging questions to test understanding.

**Thinking Process**:
- Use your "Thinking Mode" to plan the monograph structure before generating.
- critically evaluate sources (simulated) and ensure accuracy.

Box content in a verified JSON structure matching the schema.
    `;

        // Helper to generate content with fallback
        let response;
        try {
            // Try gemini-3-pro-preview first
            response = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: [
                    { role: "user", parts: [{ text: systemPrompt }] }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: MONOGRAPH_SCHEMA as any,
                    thinkingConfig: {
                        thinkingLevel: "HIGH" as any
                    }
                }
            });
        } catch (error: any) {
            console.warn("Gemini 3.0 Preview failed, falling back to Gemini 2.0 Flash:", error.message);
            // Fallback to gemini-2.0-flash
            response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [
                    { role: "user", parts: [{ text: systemPrompt }] }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: MONOGRAPH_SCHEMA as any,
                }
            });
        }

        const responseText = response.text;
        if (!responseText) {
            throw new Error("No response generated from Gemini");
        }

        const monograph = JSON.parse(responseText);

        return NextResponse.json(monograph);

    } catch (error) {
        console.error("Research API Error:", error);
        return NextResponse.json({ error: "Failed to generate monograph" }, { status: 500 });
    }
}
