"use server";

import { revalidatePath } from "next/cache";

export type SaveState = {
  message: string;
  success?: boolean;
};

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
