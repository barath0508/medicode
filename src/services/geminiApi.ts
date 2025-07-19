import { GoogleGenerativeAI } from "@google/generative-ai";

interface AnalysisResponse {
  result: string;
  tamilResult: string;
  hindiResult: string;
  error?: string;
}

// Replace this with your actual Gemini API key
const API_KEY = GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function analyzeImage(imageData: string): Promise<AnalysisResponse> {
  try {
    const base64Data = imageData.split(",")[1];

    const prompt = `You are an AI assistant designed to explain medicine prescriptions or medical reports in the simplest and most understandable way possible, especially for individuals with limited education or literacy.

Analyze the image of medicine or prescription and provide information in THREE languages: English, Tamil, and Hindi. For each language, focus on:
1. The name of the medicine or test shown in the image
2. What the medicine is used for, or what the test measures
3. Important information about usage or purpose

Write in simple, direct language that anyone can understand. Avoid medical jargon. Format your response EXACTLY as follows:

ENGLISH:
[Your English analysis here]

TAMIL:
[Your Tamil analysis here - write in Tamil script]

HINDI:
[Your Hindi analysis here - write in Devanagari script]

Remember to emphasize that this is general information only and not a substitute for a doctor's advice in all three languages.`;


    const result = await model.generateContent([
      { inlineData: { mimeType: "image/jpeg", data: base64Data } },
      prompt
    ]);

    const text = result.response.text();
    const { english, tamil, hindi } = parseMultiLanguageResponse(text);

    return {
      result: english,
      tamilResult: tamil,
      hindiResult: hindi
    };

  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      result: "Analysis failed. Please check the image and try again.",
      tamilResult: "பகுப்பாய்வு தோல்வியடைந்தது. படத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
      hindiResult: "विश्लेषण असफल। कृपया छवि की जांच करें और पुनः प्रयास करें।",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function parseMultiLanguageResponse(response: string): { english: string; tamil: string; hindi: string } {
  const sections = response.split(/(?:ENGLISH:|TAMIL:|HINDI:)/).map(s => s.trim());
  return {
    english: sections[1] || "Analysis not available in English",
    tamil: sections[2] || "தமிழில் பகுப்பாய்வு கிடைக்கவில்லை",
    hindi: sections[3] || "हिंदी में विश्लेषण उपलब्ध नहीं है"
  };
}


export async function getGeminiResponse(userMessage: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage })
    });

    if (!response.ok) throw new Error("Failed to connect to Gemini API");

    const data = await response.json();
    return data.response;
  } catch (err) {
    console.error("Gemini API error:", err);
    throw err;
  }
}