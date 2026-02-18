import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { submission, context } = await req.json();
        const apiKey = req.headers.get("x-google-api-key") || process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key not provided" }, { status: 401 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `
You are an expert medical examiner. 
Your task is to grade a student's answer to an assignment based on the provided course material.

Course Material:
${context}

Student Submission:
${submission}

Evaluate the submission for accuracy and completeness based strictly on the course material.
If the submission is correct and demonstrates understanding, mark it as 'passed'.
If it is incorrect or missing key information, mark it as 'failed'.
Provide constructive feedback explaining the grade.

Return ONLY a valid JSON object with the following structure:
{
  "status": "passed" | "failed",
  "feedback": "string"
}
    `;

        // Using gemini-3-pro-preview with High Thinking for superior reasoning
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] }
            ],
            config: {
                responseMimeType: "application/json",
                // specific thinking config might need to be typed/checked against docs if using exact types
                // relying on auto-behavior or simple config property if supported by SDK types
                // SKILL.md example: config: { thinkingConfig: { thinkingLevel: "high" } }
                thinkingConfig: {
                    thinkingLevel: "HIGH" as any
                }
            }
        });

        const responseText = response.text;
        if (!responseText) {
            throw new Error("No response generated");
        }

        const grade = JSON.parse(responseText);

        return NextResponse.json(grade);
    } catch (error) {
        console.error("Grading API Error:", error);
        return NextResponse.json({ error: "Failed to grade assignment" }, { status: 500 });
    }
}
