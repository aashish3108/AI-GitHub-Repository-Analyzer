import { z } from "zod";

const envSchema = z.object({
  GITHUB_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional().default("https://api.openai.com/v1"),
  OPENAI_MODEL: z.string().optional().default("gpt-4o-mini"),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => String(e.path.join("."))).join(", ");
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
}

// NOTE: We intentionally do NOT call validateEnv() at module load time.
// Doing so would throw during test runs or static type analysis before env is set.
// Callers should invoke validateEnv() when they actually need the values.
export const env = process.env;
