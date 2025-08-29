export async function generateText(prompt, model = "gemini-1.5-flash") {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model })
  });
  if (!res.ok) throw new Error("Gemini request failed");
  return res.json();
}