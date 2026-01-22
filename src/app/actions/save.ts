"use server";

import { revalidatePath } from "next/cache";
import { type ReceiptData, ReceiptSchema } from "@/lib/schema";

export type SaveState = {
  message: string;
  success?: boolean;
};

export async function saveReceipt(data: ReceiptData): Promise<SaveState> {
  try {
    // Validate the object (Double check server-side)
    const validatedData = ReceiptSchema.parse(data);

    // Save to JSON Server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts`, {
      method: "POST",
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

export async function deleteReceipt(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete receipt");
    }

    // Refresh data
    revalidatePath("/");
    return { success: true, message: "Receipt deleted successfully!" };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Failed to delete receipt" };
  }
}

export async function updateReceipt(id: string, data: Partial<ReceiptData>) {
  try {
    // Validate the object (Double check server-side)
    const validatedData = ReceiptSchema.partial().parse(data);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validatedData,
        savedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update receipt");
    }

    // Refresh data
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, error: "Could not update receipt." };
  }
}
