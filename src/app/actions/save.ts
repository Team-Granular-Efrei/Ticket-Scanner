"use server";

import { revalidatePath } from "next/cache";
import type { ReceiptData } from "@/lib/schema";

export async function saveReceipt(data: ReceiptData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        savedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save to database");
    }

    revalidatePath("/history");
    return { success: true };
  } catch {
    return { success: false, error: "Could not save receipt." };
  }
}

export async function deleteReceipt(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete receipt");
    }

    revalidatePath("/history");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete receipt." };
  }
}

export async function updateReceipt(id: string, data: Partial<ReceiptData>) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update receipt");
    }

    revalidatePath("/history");
    revalidatePath(`/history/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Could not update receipt." };
  }
}
