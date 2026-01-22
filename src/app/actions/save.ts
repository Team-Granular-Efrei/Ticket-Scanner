"use server";

import { revalidatePath } from "next/cache";
import { type ReceiptData, ReceiptSchema } from "@/lib/schema";

export type SaveState = {
  message: string;
  success?: boolean;
};

export async function saveReceipt(data: ReceiptData, receiptId?: string): Promise<SaveState> {
  try {
    // Validate the object (Double check server-side)
    const validatedData = ReceiptSchema.parse(data);

    // Save to JSON Server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts${receiptId ? `/${receiptId}` : ""}`, {
      method: receiptId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validatedData,
        savedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save to database");
    }

    // Refresh data
    revalidatePath("/");

    return { success: true, message: "Receipt saved successfully!" };
  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, message: "Failed to save receipt. Check inputs." };
  }
}
