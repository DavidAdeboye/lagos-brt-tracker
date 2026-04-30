export const AI_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_AI_API_KEY!,
  baseURL: process.env.EXPO_PUBLIC_AI_BASE_URL!,
  model: process.env.EXPO_PUBLIC_AI_MODEL!,
};

export async function askAI(messages: { role: string; content: string }[]) {
  const res = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages,
      max_tokens: 512,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content as string;
}