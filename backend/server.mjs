import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import os from 'os';

import fetch from 'node-fetch'; // Needed for getBotResponse function

dotenv.config();

const app = express();
const port = 5000;
const API_KEY = GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.use(cors());
app.use(bodyParser.json());

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

    // Extract the three language sections
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
