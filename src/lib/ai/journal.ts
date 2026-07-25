import "server-only";
import { generateText } from "ai";
import { aiEnabled, chatModel } from "./openai";

export async function generateJournalSummary(body: string, mood: number | null): Promise<string | null> {
  if (!body.trim()) return null;
  if (!aiEnabled) return null;

  try {
    const { text } = await generateText({
      model: chatModel,
      system:
        "You are a warm, concise personal coach inside Rocky OS. Write a one-sentence reflective summary of this journal entry. No preamble.",
      prompt: `Mood (1-5, 5 is best): ${mood ?? "not specified"}.\nEntry: ${body}`,
    });
    return text.trim();
  } catch {
    return null;
  }
}
