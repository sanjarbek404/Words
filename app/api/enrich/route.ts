import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key sozlanmagan." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { word } = await req.json();

    if (!word || typeof word !== 'string') {
        return NextResponse.json({ error: "So'z kiritilmadi." }, { status: 400 });
    }

    const prompt = `You are an expert English-Uzbek dictionary and language learning assistant.
    Provide details for the English word/phrase: "${word}".
    Respond ONLY with a valid JSON object matching this exact schema. Do not output markdown blocks or extra text:
    {
      "uzbek": "translation in Uzbek (make it accurate and culturally appropriate)",
      "definition": "simple, easy to understand English definition",
      "example": "a practical example sentence in English using the word"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text || "{}";
    
    // Clean up potential markdown formatting from AI output
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    const parsedData = JSON.parse(text);
    return NextResponse.json(parsedData);
    
  } catch (error) {
    console.error("AI bilan bog'lanishda xatolik:", error);
    return NextResponse.json({ error: "Ma'lumotni shakllantirishda xatolik yuz berdi." }, { status: 500 });
  }
}
