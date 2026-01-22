"use server";

import type { ReceiptData } from "@/lib/schema";

export async function saveReceipt(data: ReceiptData) {
  try {
    // We send the *edited* data to your JSON server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        savedAt: new Date().toISOString(), // Track when the user actually clicked save
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save to database");
    }

    return { success: true };
  } catch {
    return { success: false, error: "Could not save receipt." };
  }
}
