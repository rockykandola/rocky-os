import { createOpenAI } from "@ai-sdk/openai";

export const aiEnabled = Boolean(process.env.OPENAI_API_KEY);

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

/** Override via OPENAI_MODEL if this model id is retired by the time you run this. */
export const chatModel = openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
