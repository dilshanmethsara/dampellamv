import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not configured." },
        { status: 500 }
      )
    }

    const { pdfBase64, numQuestions = 10, subject = "", grade = "", language = "en" } = await req.json()

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF provided." }, { status: 400 })
    }

    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: "v1" }
    )

    const isSinhala = language === "si"

    const prompt = `You are an expert Sri Lankan school teacher creating a multiple-choice quiz.

Read the lesson content in the attached PDF carefully.

Generate exactly ${numQuestions} MCQ questions based ONLY on the content in this PDF.
${subject ? `Subject: ${subject}` : ""}
${grade ? `Target Grade: ${grade}` : ""}

LANGUAGE REQUIREMENT: 
- Generate the entire response (questions and options) in ${isSinhala ? 'SINHALA (සිංහල)' : 'ENGLISH'}.
${isSinhala ? '- Use formal academic Sinhala suitable for school assessments.' : ''}

STRICT RULES:
- Each question must have EXACTLY 4 answer options (A, B, C, D)
- Exactly ONE option must be correct
- Questions should test understanding, not just memorization
- Vary difficulty: mix easy, medium, and hard questions
- Make all 4 options plausible (no obviously wrong options)
- Keep questions clear and concise

Respond with ONLY valid JSON, no markdown, no explanation:
{
  "questions": [
    {
      "question_text": "Question text here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_option_index": 0,
      "points": 1
    }
  ]
}

The correct_option_index is 0-based (0=A, 1=B, 2=C, 3=D).`

    // Implement simple retry logic for 503 errors
    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent([
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
          { text: prompt },
        ])
        break; // Success!
      } catch (e: any) {
        retries--;
        if (retries === 0) throw e;
        if (e.message?.includes("503") || e.message?.includes("Service Unavailable")) {
          await new Promise(res => setTimeout(res, 2000)); // Wait 2s before retry
          continue;
        }
        throw e;
      }
    }

    if (!result) throw new Error("AI failed to return a response.");
    const responseText = result.response.text().trim()

    // Strip markdown code fences if Gemini wraps in ```json
    const cleanedJson = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim()

    const parsed = JSON.parse(cleanedJson)

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("AI returned invalid structure")
    }

    // Sanitize each question
    const questions = parsed.questions
      .slice(0, numQuestions)
      .map((q: any) => ({
        question_text: String(q.question_text || "").trim(),
        question_text_si: "",
        options: Array.isArray(q.options)
          ? q.options.slice(0, 4).map((o: any) => String(o).trim())
          : ["", "", "", ""],
        options_si: ["", "", "", ""],
        correct_option_index:
          typeof q.correct_option_index === "number"
            ? Math.min(Math.max(q.correct_option_index, 0), 3)
            : 0,
        points: typeof q.points === "number" ? q.points : 1,
      }))
      // Ensure all have exactly 4 options
      .map((q: any) => ({
        ...q,
        options:
          q.options.length === 4
            ? q.options
            : [...q.options, ...["", "", "", ""]].slice(0, 4),
        options_si: ["", "", "", ""],
      }))

    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error("AI Quiz Generation Error:", error)
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to generate questions. Please try again.",
      },
      { status: 500 }
    )
  }
}
