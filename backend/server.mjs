import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser'; // Import bodyParser
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const app = express();
const port = 5000;

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Error: GOOGLE_GEMINI_API_KEY environment variable is not set.");
  console.error("Please ensure you have a .env file with GOOGLE_GEMINI_API_KEY=YOUR_ACTUAL_KEY or it's set in your hosting environment.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.use(cors({
  origin: 'https://medicode4.netlify.app' // Replace with your actual frontend domain
}));

// Configure bodyParser.json() to accept a larger payload size
// For example, to accept up to 50MB (adjust as needed based on your expected image sizes)
app.use(bodyParser.json({ limit: '50mb' })); // Changed this line
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // Also good practice for urlencoded

app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;

    const prompt = `
You are a multilingual AI medical assistant with advanced knowledge of medical terminology, human anatomy, diseases, symptoms, drug interactions, and diagnostic procedures. You are capable of understanding complex medical questions and explaining them in clear, simple terms in three languages: English, Tamil, and Hindi.

When given a user message related to any health issue, respond with:

1. An accurate medical explanation of the condition or question
2. Common causes and symptoms (if applicable)
3. Recommended treatments or general advice
4. When to see a doctor or specialist
5. A disclaimer that this is not a substitute for professional medical advice

Respond in this exact format:

ENGLISH:
[Simple, clear medical explanation in English]

TAMIL:
[தமிழில் மிக எளிமையாகவும் தெளிவாகவும் பதில் அளிக்கவும்]

HINDI:
[हिंदी में सीधा, सरल और समझने योग्य उत्तर दें]

Make sure:
- Medical terms are explained in layman’s language
- Advice is generalized and non-diagnostic
- You include the disclaimer at the end in all 3 languages

Example disclaimer:
"This is general health information, not medical advice. Please consult a doctor for diagnosis or treatment."

Always be compassionate and non-alarming in tone.

User Message: ${userMessage}
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const responseText = result.response.text();

    const [english, tamil, hindi] = ["ENGLISH", "TAMIL", "HINDI"].map(lang => {
      const match = responseText.match(new RegExp(`${lang}:\\s*([\\s\\S]*?)(?=(\\n[A-Z]+:|$))`));
      return match ? match[1].trim() : "";
    });

    res.json({
      result: english,
      tamilResult: tamil,
      hindiResult: hindi,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Failed to process your request.' });
  }
});

app.post('/api/analyze-image', async (req, res) => {
    try {
        const { imageData } = req.body;
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

        const responseText = result.response.text();
        const { english, tamil, hindi } = parseMultiLanguageResponse(responseText);

        res.json({
            result: english,
            tamilResult: tamil,
            hindiResult: hindi
        });

    } catch (error) {
        console.error("Error analyzing image on backend:", error);
        res.status(500).json({
            result: "Analysis failed on server. Please check the image and try again.",
            tamilResult: "சேவையகத்தில் பகுப்பாய்வு தோல்வியடைந்தது. படத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
            hindiResult: "सर्वर पर विश्लेषण विफल। कृपया छवि की जांच करें और पुनः प्रयास करें।",
            error: error instanceof Error ? error.message : "Unknown error on backend"
        });
    }
});

function parseMultiLanguageResponse(response) {
  const sections = response.split(/(?:ENGLISH:|TAMIL:|HINDI:)/).map(s => s.trim());
  return {
    english: sections[1] || "Analysis not available in English",
    tamil: sections[2] || "தமிழில் பகுப்பாய்வு கிடைக்கவில்லை",
    hindi: sections[3] || "हिंदी में विश्लेषण उपलब्ध नहीं है"
  };
}

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Backend running at http://${getLocalIPAddress()}:${port}`);
});

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}