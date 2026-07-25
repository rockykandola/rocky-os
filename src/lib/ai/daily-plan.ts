import "server-only";
import { generateText } from "ai";
import { aiEnabled, chatModel } from "./openai";

export async function generateMorningSummary(input: {
  intentions: string | null;
  taskTitles: string[];
}): Promise<string> {
  const fallback = input.taskTitles.length > 0
    ? `Today's focus: ${input.taskTitles.slice(0, 3).join(", ")}.`
    : "No tasks selected yet.";

  if (!aiEnabled) return `${fallback} Set OPENAI_API_KEY for an AI-generated plan.`;

  try {
    const { text } = await generateText({
      model: chatModel,
      system:
        "You are a concise, encouraging personal coach inside Rocky OS. Write a short (2-3 sentence) morning plan summary that helps the user focus. No preamble, no markdown headers.",
      prompt: `Intentions for today: ${input.intentions || "none stated"}.\nPlanned tasks: ${
        input.taskTitles.length ? input.taskTitles.join(", ") : "none selected"
      }.`,
    });
    return text.trim();
  } catch {
    return fallback;
  }
}

export async function generateEveningSummary(input: {
  wins: string | null;
  challenges: string | null;
  gratitude: string | null;
}): Promise<string> {
  const fallback = "Nice work wrapping up the day.";
  if (!aiEnabled) return `${fallback} Set OPENAI_API_KEY for an AI-generated reflection.`;

  try {
    const { text } = await generateText({
      model: chatModel,
      system:
        "You are a warm, reflective personal coach inside Rocky OS. Write a short (2-3 sentence) evening reflection that acknowledges the day and offers one gentle suggestion for tomorrow. No preamble, no markdown headers.",
      prompt: `Wins: ${input.wins || "none noted"}.\nChallenges: ${input.challenges || "none noted"}.\nGratitude: ${
        input.gratitude || "none noted"
      }.`,
    });
    return text.trim();
  } catch {
    return fallback;
  }
}
