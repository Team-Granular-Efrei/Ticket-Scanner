import { z } from "zod";

// 1. Budget Categories (Now applied to ITEMS)
export const BudgetCategory = z.enum([
  "Groceries",
  "Dining",
  "Transport",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Housing",
  "Services",
  "Healthcare",
  "Tech",
  "Clothing",
  "Other",
]);

const ItemSchema = z.object({
  name: z.string().describe("Cleaned up product name"),
  price: z.number(),
  quantity: z.number().default(1),
  category: BudgetCategory.describe("The budget category for this specific item").default("Other"),
});

export const ReceiptSchema = z.object({
  // Auto-generated ID on parse (Server-side)
  id: z.string().default(() => crypto.randomUUID()),

  merchant: z.object({
    name: z.string().describe("The name of the store/vendor"),
    address: z.string().optional(),
    type: z.string().optional().describe("Generic store type (e.g. Supermarket, Restaurant)"),
  }),

  date: z.string().optional().describe("ISO Date (YYYY-MM-DD) found on receipt"),
  time: z.string().optional().describe("Time (HH:MM) found on receipt"),

  total_spent: z.number(),
  currency: z.string().default("EUR"),

  tax_amount: z.number().default(0),
  discount: z.number().default(0),
  service_charge: z.number().default(0),

  items: z.array(ItemSchema).transform((items) =>
    items.map((item) => ({
      ...item,
      id: crypto.randomUUID(), // Item IDs
    })),
  ),

  analysis: z.object({
    insight: z.string().describe("A brief observation about this spending (e.g. 'Heavy on tech items')"),
  }),

  note: z.string().optional().describe("Optional user note about this receipt"),
});

export type ReceiptData = z.infer<typeof ReceiptSchema>;

export function getSystemPrompt() {
  const categories = BudgetCategory.options.join(", ");

  return `
    You are an expert financial auditor. Analyze the receipt image.
    
    CRITICAL INSTRUCTION: **Categorize every single line item**.
    A receipt from "Walmart" is not just "Groceries". Look at the item name:
    - "Banana" -> Groceries
    - "T-Shirt" -> Clothing
    - "AA Batteries" -> Tech
    
    Allowed Categories: [${categories}]
    
    EXTRACT:
    - Date (YYYY-MM-DD) & Time (HH:MM)
    - Total, Tax, Discount, Service Charge
    - Line Items (Name, Price, Qty, Category)
    - Merchant: {
      name: The name of the store/vendor",
      address: The address of the store/vendor",
      type: Generic store type (e.g. Supermarket, Restaurant)
    },
    - Insight: A brief observation about this spending (e.g. 'Heavy on tech items')

    Note: Item with no visible price should be excluded. You must make sure the sum of line items equals the total.
    If the sum is higher than the total, prioritize the total and remove low-value items until they match. About The item price, 
    keep it as it is on the receipt, do not modify or try co calculate based on quantity, tax or discount.

    RESPOND IN THE FOLLOWING JSON FORMAT STRICTLY:
    
    OUTPUT JSON ONLY:
    ${JSON.stringify(
      {
        merchant: { name: "string", address: "string", type: "string" },
        date: "YYYY-MM-DD",
        time: "HH:MM",
        total_spent: 0,
        currency: "EUR",
        tax_amount: 0,
        discount: 0,
        service_charge: 0,
        items: [
          {
            name: "string",
            price: 0,
            quantity: 1,
            category: "CategoryEnum", // AI must pick best fit
          },
        ],
        analysis: { insight: "string" },
      },
      null,
      2,
    )}
  `;
}
