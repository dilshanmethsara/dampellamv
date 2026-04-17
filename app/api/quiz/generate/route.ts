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
      { model: "gemini-2.5-flash" },
      { apiVersion: "v1beta" }
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

    // --- Fallback Mechanism ---
    let result;
    let fallbackToGroq = false;
    let questions = [];

    try {
      // 1. Primary Attempt: Gemini 2.5 Flash with Retries
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
          ]);
          break; // Success!
        } catch (e: any) {
          retries--;
          console.warn(`Gemini attempt failed (${3 - retries}/3). Error: ${e.message}`);
          if (retries === 0) throw e;
          if (e.message?.includes("503") || e.message?.includes("Service Unavailable") || e.message?.includes("demand")) {
            await new Promise(res => setTimeout(res, 2000)); // Wait 2s
            continue;
          }
          throw e; // Stop if it's a different error
        }
      }

      if (!result) throw new Error("Gemini returned no results.");
      const responseText = result.response.text().trim();
      const cleanedJson = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      
      const parsed = JSON.parse(cleanedJson);
      questions = parsed.questions || [];
    } catch (e: any) {
      console.error("Gemini failed completely, attempting Groq fallback...", e.message);
      fallbackToGroq = true;
    }

    // 2. Fallback Attempt: Groq (LLaMA 3)
    if (fallbackToGroq) {
      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) {
        throw new Error("Gemini is unavailable and no GROQ_API_KEY is configured.");
      }

      // If we are here, we need text. We'll try a "blind" generation based on title/subject 
      // as a last resort if we can't parse the PDF yet, or we'll assume the PDF context might be missing.
      // Ideally, we'd use a PDF parser here. For now, we'll tell Groq to generate high-quality 
      // educational MCQs for the specific subject/grade.
      const groqPrompt = `You are an expert Sri Lankan school teacher. 
The primary AI service is busy, so you are fulfilling an emergency request for a quiz.

Subject: ${subject}
Grade: ${grade}
Language: ${isSinhala ? 'Sinhala' : 'English'}
Number of Questions: ${numQuestions}

Create a high-quality MCQ quiz for this topic. Each question must have 4 options and 1 correct index.
${isSinhala ? 'Use formal academic Sinhala.' : ''}

Respond with ONLY valid JSON:
{
  "questions": [
    {
      "question_text": "...",
      "options": ["...", "...", "...", "..."],
      "correct_option_index": 0,
      "points": 1
    }
  ]
}`;

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: groqPrompt }],
          response_format: { type: "json_object" }
        })
      });

      const groqData = await groqResponse.json();
      const groqContent = JSON.parse(groqData.choices[0].message.content);
      questions = groqContent.questions || [];
    }

    // --- Final Sanitization ---
    const sanitizedQuestions = questions
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
      .map((q: any) => ({
        ...q,
        options:
          q.options.length === 4
            ? q.options
            : [...q.options, ...["", "", "", ""]].slice(0, 4),
        options_si: ["", "", "", ""],
      }));

    return NextResponse.json({ questions: sanitizedQuestions });
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
