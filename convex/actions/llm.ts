"use node";
import { Groq } from "groq-sdk";

export async function callLLM(params: {
  messages: any[];
  tools: any[];
  systemPrompt: string;
}) {
  try {
    return await callGroq(params);
  } catch (error) {
    console.error("Groq failed, falling back to DeepSeek R1 (DigitalOcean):", error);
    return await callDeepSeek(params);
  }
}

async function callGroq(params: { messages: any[]; tools: any[]; systemPrompt: string }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ],
    tools: params.tools,
    tool_choice: "auto",
    max_tokens: 1200,
    temperature: 0.3,
  });

  return response;
}

// DigitalOcean GenAI — OpenAI-compatible endpoint
// Model: deepseek-r1 (tool-calling capable variant)
async function callDeepSeek(params: { messages: any[]; tools: any[]; systemPrompt: string }) {
  const apiKey = process.env.DO_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing DO_AI_API_KEY");
  }

  const endpoint = process.env.DIGITALOCEAN_AI_KEY || "https://inference.do-ai.run/v1/chat/completions";

  const body = {
    model: process.env.DO_AI_MODEL || "deepseek-r1",
    messages: [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ],
    tools: params.tools,
    tool_choice: "auto",
    max_tokens: 1200,
    temperature: 0.3,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek/DigitalOcean API error ${res.status}: ${errText}`);
  }

  const data = await res.json() as any;
  return data;
}
