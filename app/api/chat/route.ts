import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize the Google Generative AI with the API Key
// Specifying v1 for better stability
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

const SYSTEM_PROMPT = `
You are the "Atelier Tutor," a sophisticated AI Academic Mentor for students at MR/ Dampella Maha Vidyalaya. 
Your persona is defined by the "Intellectual Atelier" design system: scholarly, high-fidelity, and focused on deep analytical inquiry.

Your goals:
1. Provide rigorous academic guidance that goes beyond simple answers. 
2. Use a professional, scholarly, and supportive tone.
3. Structure your responses with clear headings, key principles, and (where relevant) academic citations or pedagogical context.
4. Encourage critical thinking by asking deepening questions at the end of your responses.
5. If students ask about non-academic topics, politely steer them back to their "Intellectual Inquiry" or scholarly growth.

Context:
- School: MR/ Dampella Maha Vidyalaya
- Motto: "Knowledge is Power, Education is the Key"
- Atmosphere: An "Atelier" (workshop) for the mind, where every inquiry is a step toward mastery.

Formatting Guidelines:
- Use Markdown for structure.
- If you provide a deep analysis, try to follow a structure similar to:
  ### [Subject Title]
  [Brief high-level explanation]
  **Key Principles:**
  - [Principle Name]: [Description]
  ...
  **Citations/Context:**
  [Relevant academic references or background]
`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not configured. Please add GOOGLE_GEMINI_API_KEY to your .env.local file." },
        { status: 500 }
      )
    }

    // Get the latest message from the history
    const lastMessage = messages[messages.length - 1]

    // Prepare the model - using gemini-1.5-flash with v1beta for stability
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash"
    }, { apiVersion: "v1beta" })

    // Prepare chat history
    let history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }))

    if (history.length > 0 && history[0].role === "model") {
      history = history.slice(1)
    }

    const finalPrompt = lastMessage.text
    const fullPrompt = history.length === 0 
      ? `${SYSTEM_PROMPT}\n\nStudent: ${finalPrompt}`
      : finalPrompt

    // --- Logical Flow with Fallback ---
    let responseText = "";
    let fallbackToGroq = false;

    // 1. Primary Attempt: Gemini with Retries
    try {
      const chat = model.startChat({ history: history })
      let retries = 3;
      while (retries > 0) {
        try {
          const result = await chat.sendMessage(fullPrompt);
          responseText = result.response.text();
          break; 
        } catch (e: any) {
          retries--;
          const is503 = e.message?.includes("503") || e.message?.includes("Service Unavailable") || e.message?.includes("demand") || e.message?.includes("404");
          if (is503 && retries > 0) {
            await new Promise(res => setTimeout(res, 1500));
            continue;
          }
          throw e;
        }
      }
    } catch (e: any) {
      console.warn("Gemini service unavailable for Tutor, falling back to Groq...", e.message);
      fallbackToGroq = true;
    }

    // 2. Fallback Attempt: Groq (LLaMA 3)
    if (fallbackToGroq || !responseText) {
      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) {
        throw new Error("AI services are currently busy. Please try again in a few moments.");
      }

      // Map chat history to Groq format
      const groqMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role === "user" || m.role === "student" ? "user" : "assistant",
          content: m.text || m.content
        }))
      ];

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      const groqData = await groqResponse.json();
      if (groqData.choices?.[0]?.message?.content) {
        responseText = groqData.choices[0].message.content;
      } else {
        throw new Error("AI Mentor is navigating high volume. Please try again later.");
      }
    }

    return NextResponse.json({ text: responseText })
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate response. Please try again later." },
      { status: 500 }
    )
  }
}
