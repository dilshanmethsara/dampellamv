import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize the Google Generative AI with the API Key
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
    
    // Prepare the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT
    })

    // Prepare chat history for context (Gemini format)
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }))

    const chat = model.startChat({
      history: history,
    })

    const result = await chat.sendMessage(lastMessage.text)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error("Gemini API Error:", error)
    return NextResponse.json(
      { error: "Failed to generate response. Please try again later." },
      { status: 500 }
    )
  }
}
