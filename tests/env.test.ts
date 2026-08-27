import { describe, it, expect } from "vitest";
import { validateEnv } from "@/lib/env";

describe("validateEnv", () => {
  it("returns parsed env when DATABASE_URL is set", () => {
    const original = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/test";
    try {
      const env = validateEnv();
      expect(env.DATABASE_URL).toBe("postgresql://user:pass@localhost:5432/test");
    } finally {
      if (original !== undefined) {
        process.env.DATABASE_URL = original;
      } else {
        delete process.env.DATABASE_URL;
      }
    }
  });

  it("throws when DATABASE_URL is missing", () => {
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      expect(() => validateEnv()).toThrow(/environment variables/i);
    } finally {
      if (original !== undefined) {
        process.env.DATABASE_URL = original;
      }
    }
  });

  it("throws when DATABASE_URL is invalid URL", () => {
    const original = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "not-a-url";
    try {
      expect(() => validateEnv()).toThrow();
    } finally {
      if (original !== undefined) {
        process.env.DATABASE_URL = original;
      } else {
        delete process.env.DATABASE_URL;
      }
    }
  });

  it("applies defaults for optional variables", () => {
    const original = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/test";
    const originalBaseUrl = process.env.OPENAI_BASE_URL;
    const originalModel = process.env.OPENAI_MODEL;
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL;
    try {
      const env = validateEnv();
      expect(env.OPENAI_BASE_URL).toBe("https://api.openai.com/v1");
      expect(env.OPENAI_MODEL).toBe("gpt-4o-mini");
    } finally {
      if (original !== undefined) {
        process.env.DATABASE_URL = original;
      }
      if (originalBaseUrl !== undefined) {
        process.env.OPENAI_BASE_URL = originalBaseUrl;
      }
      if (originalModel !== undefined) {
        process.env.OPENAI_MODEL = originalModel;
      }
    }
  });
});
