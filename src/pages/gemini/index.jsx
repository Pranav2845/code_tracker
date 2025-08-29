import React, { useState } from "react";
import { generateText } from "../../api/gemini";
import Header from "../../components/ui/Header";

export default function GeminiPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { text } = await generateText(prompt);
    setResponse(text);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <h1 className="text-xl mb-4">
          Ask AI: Get clear, accurate answers to your questions
        </h1>

        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full max-w-6xl border p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary h-16 resize-none"
            placeholder="Type your question here..."
          />
          <div>
            <button className="bg-primary text-white px-4 py-2 rounded-md">
              Generate
            </button>
          </div>
        </form>

        {response && (
          <pre className="mt-4 whitespace-pre-wrap">{response}</pre>
        )}
      </main>
    </div>
  );
}
