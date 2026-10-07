import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { originalImage, referenceImage, mode, lang } = await req.json();

    const systemPrompt = `
      You are an expert packaging designer and brand strategist.
      Compare Image A (User's Packaging) with Image B (Reference Packaging).
      Analyze contrast, typography readability, logo visual hierarchy, compliance, material texture, and overall market appeal.
      Return the response ONLY in raw JSON format with the following structure:
      {
        "score": 85,
        "pros": ["Point 1", "Point 2"],
        "cons": ["Point 1", "Point 2"],
        "recommendations": ["Recommendation 1", "Recommendation 2"]
      }
      Language of output values MUST be in ${lang === 'tr' ? 'Turkish' : 'English'}.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze Image A vs Image B. Mode: ${mode}` },
            { type: "image_url", image_url: { url: originalImage } },
            { type: "image_url", image_url: { url: referenceImage } }
          ]
        }
      ]
    });

    const data = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: "Analiz sırasında hata oluştu" }, { status: 500 });
  }
}
