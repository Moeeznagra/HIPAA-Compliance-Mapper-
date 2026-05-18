import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini analysis
  app.post("/api/analyze-controls", async (req, res) => {
    try {
      const { controlText, safeguardId, safeguardTitle, safeguardDescription } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following organizational control against the HIPAA safeguard requirement.
        
HIPAA Safeguard: ${safeguardId} - ${safeguardTitle}
Requirement Description: ${safeguardDescription}
Organizational Control Data: ${controlText}

Tasks:
1. Map the control to NIST SP 800-66 Rev. 2 guidance if applicable.
2. Perform a gap analysis.
3. Determine detailed compliance status.
4. Provide actionable remediation steps.

Return the result in strictly valid JSON format:
{
  "status": "COMPLIANT" | "PARTIALLY_COMPLIANT" | "NON_COMPLIANT",
  "nistMapping": "...",
  "gapAnalysis": "...",
  "recommendations": "...",
  "confidenceScore": 0.95
}`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a Senior HIPAA Compliance Auditor and NIST SP 800-66 Expert. Your goal is to provide precise, professional, and actionable audit reports. Be critical but constructive."
        }
      });
      
      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
