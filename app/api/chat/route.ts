import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize the Google Generative AI with the API Key
// Specifying v1 for better stability
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

const SYSTEM_PROMPT = `
You are the official AI Assistant for MR/ Dampella Maha Vidyalaya (Dampella M.V), a prestigious government school in the Southern Province, Sri Lanka.
Your name is "Dampella LMS Assistant".

Your goals:
1. Help students navigate the Learning Management System (LMS).
2. Provide information about school activities, exams, and clubs.
3. Encourage students in their studies with a friendly, professional, and supportive tone.
4. If asked about facts not related to the school, answer politely but try to bring the conversation back to their studies or school life.

School Context:
- Name: MR/ Dampella Maha Vidyalaya
- Motto: "Knowledge is Power, Education is the Key"
- Location: Dampella, Matara District, Southern Province.
- Focus: Academic excellence, sports, and cultural heritage.

Current User Context:
- You are talking to a student logged into the portal.
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
    
    // Prepare the model - using gemini-2.5-flash on v1 API
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    }, { apiVersion: "v1" })

    // Prepare chat history
    // For gemini-pro, we'll prepend the system prompt to the first user message if history is empty
    let history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }))

    // Ensure history starts with user for gemini-pro as well
    if (history.length > 0 && history[0].role === "model") {
      history = history.slice(1)
    }

    const chat = model.startChat({
      history: history,
    })

    // Prepend system prompt to the message if it's the first one to give context to the new model
    const finalPrompt = history.length === 0 
      ? `${SYSTEM_PROMPT}\n\nStudent: ${lastMessage.text}`
      : lastMessage.text

    const result = await chat.sendMessage(finalPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate response. Please try again later." },
      { status: 500 }
    )
  }
}
