import { z } from "zod";

const envSchema = z.object({
  MISTRAL_API_KEY: z.string().min(1, "MISTRAL_API_KEY is required"),
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.format();
    throw new Error(`❌ Invalid environment variables:\n${JSON.stringify(errors, null, 2)}`);
  }

  return result.data;
}
