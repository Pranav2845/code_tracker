// backend/routes/gemini.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
  try {
    const { prompt, model = 'gemini-1.5-flash' } = req.body;
    const result = await genAI
      .getGenerativeModel({ model })
      .generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gemini request failed' });
  }
});

export default router;
