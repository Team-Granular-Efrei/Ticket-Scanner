"use server";

import { Mistral } from "@mistralai/mistralai";
import { getSystemPrompt, type ReceiptData, ReceiptSchema } from "@/lib/schema";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Define the shape of our state to ensure type safety
export type AnalysisState = {
  status: "idle" | "success" | "error";
  data?: ReceiptData;
  error?: string;
};

export async function analyzeReceipt(_prevState: AnalysisState, formData: FormData): Promise<AnalysisState> {
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { status: "error", error: "No file provided" };
  }

  try {
    console.log("[analyze] Starting analysis for file:", file.name, file.type, file.size);

    // 1. Prepare Image for Mistral
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
    console.log("[analyze] Image converted to base64");

    // 2. Mistral OCR
    console.log("[analyze] Calling Mistral OCR...");
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: { type: "image_url", imageUrl: base64Image },
    });
    const rawText = ocrResponse.pages.map((p) => p.markdown).join("\n");
    console.log("[analyze] OCR result:", rawText.slice(0, 200));

    // 3. Mistral Analysis with the Schema-Driven Prompt
    console.log("[analyze] Calling Mistral chat...");
    const analysisResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: rawText },
      ],
      responseFormat: { type: "json_object" },
    });

    const content = analysisResponse.choices?.[0]?.message?.content;
    console.log("[analyze] Chat response:", content?.slice(0, 200));

    if (!content) {
      return { status: "error", error: "No response from AI" };
    }

    const rawJson = JSON.parse(content);
    console.log("[analyze] Parsed JSON:", Object.keys(rawJson));

    // VALIDATE with Zod (The Safety Net)
    // If Mistral hallucinates a field, this line throws a clear error
    const validatedData = ReceiptSchema.parse(rawJson);
    console.log("[analyze] Validation passed");

    // Fallback if AI didn't find a date on the receipt
    if (!validatedData.date) {
      validatedData.date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    }

    return { status: "success", data: validatedData };
  } catch (err) {
    console.error("[analyze] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to analyze receipt";
    return { status: "error", error: message };
  }
}
