"use node";
import { Groq } from "groq-sdk";

export async function callLLM(params: {
  messages: any[];
  tools: any[];
  systemPrompt: string;
}) {
  try {
    // Primary: DeepSeek 3.2 (DigitalOcean)
    console.log("LLM: Calling Primary (DeepSeek 3.2)...");
    return await callDeepSeek(params);
  } catch (error: any) {
    console.error("Primary LLM (DeepSeek 3.2) failed:", error.message);
    
    // Fallback: Groq (Llama 3.3 70B)
    console.log("LLM: Falling back to Groq...");
    try {
      return await callGroq(params);
    } catch (fallbackError: any) {
      console.error("Fallback LLM (Groq) also failed:", fallbackError.message);
      throw fallbackError;
    }
  }
}

async function callDeepSeek(params: { messages: any[]; tools: any[]; systemPrompt: string }) {
  const apiKey = process.env.DO_AI_API_KEY;
  if (!apiKey) throw new Error("Missing DO_AI_API_KEY");

  const endpoint = process.env.DO_AI_ENDPOINT || "https://inference.do-ai.run/v1/chat/completions";

  // Defensive message building for strict APIs
  const cleanMessages = params.messages
    .filter(m => m && (m.role === "user" || m.role === "assistant" || m.role === "tool"))
    .map(m => {
      // Workaround: some OpenAI proxies fail on role: "tool" or misinterpret it.
      // We map "tool" role to "user" with a clear prefix for the model.
      if (m.role === "tool") {
        return {
          role: "user",
          content: `[TOOL_RESULT: ${m.name || "unknown"}] ${m.content || " "}`,
        };
      }
      return {
        ...m,
        content: (m.content && m.content.trim() !== "") ? m.content : " ",
      };
    });

  const body = {
    model: process.env.DO_AI_MODEL || "deepseek-3.2",
    messages: [
      { role: "system", content: params.systemPrompt || "You are a helpful assistant." },
      ...cleanMessages,
    ],
    tools: params.tools,
    tool_choice: "auto",
    max_tokens: 2048,
    temperature: 0.1,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      // LOG ROLES FOR DEBUGGING
      console.error("DeepSeek 400 Debug - Roles:", body.messages.map(m => m.role).join(" -> "));
      if (body.messages.length > 2) {
        console.error("DeepSeek 400 Debug - Message[2]:", JSON.stringify(body.messages[2]));
      }
      throw new Error(`DeepSeek 3.2 API error ${res.status}: ${errText}`);
    }

    return await res.json();
  } catch (err: any) {
    if (err.name === "AbortError") throw new Error("DeepSeek 3.2 request timed out");
    throw err;
  }
}

async function callGroq(params: { messages: any[]; tools: any[]; systemPrompt: string }) {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const cleanMessages = params.messages
    .filter(m => m && (m.role === "user" || m.role === "assistant" || m.role === "tool"))
    .map(m => ({
      ...m,
      content: (m.content && m.content.trim() !== "") ? m.content : " ",
    }));

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: params.systemPrompt },
      ...cleanMessages,
    ],
    tools: params.tools,
    tool_choice: "auto",
    max_tokens: 2048,
    temperature: 0.1,
  });

  return response;
}
