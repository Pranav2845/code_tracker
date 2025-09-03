import api from "./axios";

export async function generateText(prompt, model = "gemini-1.5-flash") {
  const { data } = await api.post("/ai/generate", { prompt, model });
  return data;
}