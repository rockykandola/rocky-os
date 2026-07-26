import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { aiEnabled, chatModel } from "./openai";

export const brainDumpSuggestionSchema = z.object({
  type: z.enum(["TASK", "PROJECT", "NOTE", "EVENT", "CONTACT", "JOURNAL", "UNSURE"]),
  title: z.string().max(120).describe("A short, actionable title, cleaned up from the raw text"),
  rationale: z.string().max(200).describe("One sentence on why this categorization fits"),
});

export type BrainDumpSuggestion = z.infer<typeof brainDumpSuggestionSchema>;

const SYSTEM_PROMPT = `You are the categorization engine for Rocky OS, a personal operating system.
Given a raw brain-dump snippet, classify it into exactly one of: TASK (a concrete action item),
PROJECT (a larger, multi-step initiative), NOTE (information worth keeping but no action),
EVENT (something scheduled at a specific time), CONTACT (info about a person to remember),
JOURNAL (a reflection or feeling), or UNSURE if none fit clearly.
Also produce a short, cleaned-up title suitable for a task/project/note heading.`;

/** Best-effort keyword heuristic used when no OPENAI_API_KEY is configured. */
function heuristicCategorize(rawText: string): BrainDumpSuggestion {
  const text = rawText.toLowerCase();
  const title = rawText.trim().replace(/\s+/g, " ").slice(0, 100);

  if (/\b(project|launch|build|redesign|initiative)\b/.test(text)) {
    return { type: "PROJECT", title, rationale: "Mentions a larger multi-step initiative." };
  }
  if (/\b(meeting|call|appointment|at \d|on (mon|tue|wed|thu|fri|sat|sun))\b/.test(text)) {
    return { type: "EVENT", title, rationale: "Looks like something scheduled at a specific time." };
  }
  if (/\b(feel|feeling|grateful|frustrated|excited|anxious)\b/.test(text)) {
    return { type: "JOURNAL", title, rationale: "Sounds like a personal reflection." };
  }
  if (/\b(remember that|fyi|idea:|note:)\b/.test(text)) {
    return { type: "NOTE", title, rationale: "Reads like information to keep, not an action." };
  }
  return { type: "TASK", title, rationale: "Defaulted to a task — configure OPENAI_API_KEY for smarter sorting." };
}

export async function categorizeBrainDumpText(rawText: string): Promise<BrainDumpSuggestion> {
  if (!aiEnabled) return heuristicCategorize(rawText);

  try {
    const { object } = await generateObject({
      model: chatModel,
      schema: brainDumpSuggestionSchema,
      system: SYSTEM_PROMPT,
      prompt: rawText,
    });
    return object;
  } catch (err) {
    console.error("[categorizeBrainDumpText] falling back to heuristic:", err);
    return heuristicCategorize(rawText);
  }
}
