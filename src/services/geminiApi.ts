import { GoogleGenerativeAI } from "@google/generative-ai"; // Keep if you still need types, but the direct usage will be removed.

interface AnalysisResponse {
  result: string;
  tamilResult: string;
  hindiResult: string;
  error?: string;
}

// REMOVED HARDCODED API KEY AND DIRECT GEMINI CLIENT INITIALIZATION
// const API_KEY = "AIzaSyAdyN09Y30-aznrohcmIqK5OuHQGgFrSh4";
// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Modify analyzeImage to call your backend /api/analyze-image endpoint
export async function analyzeImage(imageData: string): Promise<AnalysisResponse> {
  try {
    // Frontend sends the imageData (base64) to your backend
    const response = await fetch("http://localhost:5000/api/analyze-image", { //
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

// This function is no longer needed in the frontend as parsing happens on backend
// function parseMultiLanguageResponse(response: string): { english: string; tamil: string; hindi: string } {
//   const sections = response.split(/(?:ENGLISH:|TAMIL:|HINDI:)/).map(s => s.trim());
//   return {
//     english: sections[1] || "Analysis not available in English",
//     tamil: sections[2] || "தமிழில் பகுப்பாய்வு கிடைக்கவில்லை",
//     hindi: sections[3] || "हिंदी में विश्लेषण उपलब्ध नहीं है"
//   };
// }


// Keep getGeminiResponse as it already correctly calls the backend
export async function getGeminiResponse(userMessage: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:5000/api/chat", {
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