import { z } from "zod";

// 1. Budget Categories
export const BudgetCategory = z.enum(["Groceries", "Dining", "Transport", "Entertainment", "Utilities", "Shopping", "Health", "Services", "Other"]);

const ItemSchema = z.object({
  name: z.string().describe("Cleaned up product name"),
  price: z.number(),
  quantity: z.number().default(1),
  tags: z.array(z.string()).optional(),
});

export const ReceiptSchema = z.object({
  merchant: z.object({
    name: z.string().describe("The name of the store/vendor"),
    // 🔥 ROBUST FIX: If AI hallucinates "Food", Zod auto-corrects to "Other"
    type: BudgetCategory.catch("Other"),
  }),

  date: z.string().optional().describe("ISO Date (YYYY-MM-DD) found on receipt"),
  time: z.string().optional().describe("Time (HH:MM) found on receipt"),

  total_spent: z.number(),
  currency: z.string().default("EUR"),
  tax_amount: z.number().optional(),

  items: z.array(ItemSchema).transform((items) =>
    items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    })),
  ),

  analysis: z.object({
    health_score: z.number().min(0).max(100),
    financial_advice: z.string().describe("Brief, ruthless budget advice (max 1 sentence)"),
  }),
});

export type ReceiptData = z.infer<typeof ReceiptSchema>;

export function getSystemPrompt() {
  // 🔥 DYNAMIC PROMPT: We inject the actual Enum values into the prompt.
  // If you add "Travel" to the Enum later, the AI automatically knows about it.
  const categories = BudgetCategory.options.join(", ");

  return `
    You are an expert financial auditor. Analyze the receipt image.
    
    EXTRACT:
    - Merchant Name & Category.
    - **CRITICAL**: The Category MUST be one of: [${categories}].
    - Date (Format YYYY-MM-DD) & Time
    - Total & Tax
    - Line Items (Name, Price, Qty)
    
    ANALYZE:
    - Assign a "health_score" (0-100) based on nutritional or financial responsibility.
    - Give "financial_advice": A single, punchy sentence.

    OUTPUT JSON ONLY matching this structure:
    ${JSON.stringify(
      {
        merchant: { name: "string", type: "CategoryEnum" },
        date: "YYYY-MM-DD",
        time: "HH:MM",
        total_spent: 0,
        currency: "EUR",
        tax_amount: 0,
        items: [{ name: "string", price: 0, quantity: 1, tags: ["string"] }],
        analysis: { health_score: 0, financial_advice: "string" },
      },
      null,
      2,
    )}
  `;
}
