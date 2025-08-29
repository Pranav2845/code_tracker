import React, { useState } from "react";
import { generateText } from "../../api/gemini";

export default function GeminiPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { text } = await generateText(prompt);
    setResponse(text);
  };

  return (
    <main className="p-4">
      <h1 className="text-xl mb-4">Gemini Playground</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full border p-2"
        />
        <button className="bg-primary text-white px-4 py-2 rounded">
          Generate
        </button>
      </form>
      {response && (
        <pre className="mt-4 whitespace-pre-wrap">{response}</pre>
      )}
    </main>
  );
}