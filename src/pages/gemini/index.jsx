import React, { useState } from "react";
import { generateText } from "../../api/gemini";
import Header from "../../components/ui/Header";

export default function GeminiPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    try {
      const { text } = await generateText(prompt);
      setResponse(text);
    } catch (error) {
      setResponse("⚠️ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main
        id="main-content"
        className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24"
      >
        <h1 className="text-xl mb-4">
          Ask AI: Get clear, accurate answers to your questions
        </h1>

        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full max-w-6xl border p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary h-16 resize-none 
                       bg-background text-text-primary placeholder-text-secondary"
            placeholder="Type your question here..."
          />

          <div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>

        {/* Loader */}
        {loading && (
          <p className="mt-4 text-text-secondary animate-pulse">
            Generating response...
          </p>
        )}

        {/* Answer Box */}
        {!loading && response && (
          <div className="mt-6 p-4 border rounded-lg bg-surface shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-text-primary">
              AI Response
            </h2>
            <pre className="whitespace-pre-wrap text-text-secondary">
              {response}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
