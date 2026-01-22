"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { deleteReceipt } from "@/app/actions/save";
import { useToast } from "@/providers/toast";

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteReceipt(id);
    if (result.success) {
      success("Receipt deleted successfully");
      router.push("/history");
    } else {
      error(result.error || "Failed to delete receipt");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button type="button" onClick={() => setShowConfirm(false)} className="btn btn-ghost btn-sm" disabled={isDeleting}>
          Cancel
        </button>
        <button type="button" onClick={handleDelete} className="btn btn-error btn-sm" disabled={isDeleting}>
          {isDeleting ? <span className="loading loading-spinner loading-xs" /> : "Confirm"}
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setShowConfirm(true)} className="btn btn-ghost btn-sm text-error">
      <LuTrash2 className="h-4 w-4" />
      Delete
    </button>
  );
}
