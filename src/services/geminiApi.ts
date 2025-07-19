const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { GoogleGenerativeAI } from "@google/generative-ai"; // Keep if you still need types, but the direct usage will be removed.

interface AnalysisResponse {
  result: string;
  tamilResult: string;
  hindiResult: string;
  error?: string;
}

export async function analyzeImage(imageData: string): Promise<AnalysisResponse> {
  try {
    // Frontend sends the imageData (base64) to your backend
    const response = await fetch(`${BACKEND_URL}/api/analyze-image`, { // <-- USE BACKEND_URL HERE
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageData }), // Send the image data to the backend
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to analyze image via backend"); // Use error from backend
    }

    // The backend will return the parsed response
    return await response.json();

  } catch (error) {
    console.error("Error analyzing image (frontend call to backend):", error);
    return {
      result: "Analysis failed. Please check the image and try again.",
      tamilResult: "பகுப்பாய்வு தோல்வியடைந்தது. படத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
      hindiResult: "विश्लेषण असफल। कृपया छवि की जांच करें और पुनः प्रयास करें।",
      error: error instanceof Error ? error.message : "Unknown error on frontend"
    };
  }
}

// Keep getGeminiResponse as it already correctly calls the backend
export async function getGeminiResponse(userMessage: string): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, { // <-- USE BACKEND_URL HERE
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage })
    });

    if (!response.ok) {
        // Parse error from backend if available
        const errorBody = await response.json();
        throw new Error(errorBody.error || "Failed to connect to backend chat API");
    }

    const data = await response.json();
    // Assuming backend returns { result, tamilResult, hindiResult, timestamp }
    // You might want to return a more structured object or just the English result for simplicity here.
    // Based on your server.mjs, data.response is not directly returned, but data.result
    return data.result; // Return the English result or modify as needed
  } catch (err) {
    console.error("Gemini API (via backend) error:", err);
    throw err;
  }
}