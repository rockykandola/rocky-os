import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { aiEnabled, chatModel } from "./openai";

export type TriageInput = { id: string; subject: string; from: string; snippet: string };
export type TriageResult = { id: string; isSpam: boolean; needsAction: boolean };

const triageSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      isSpam: z.boolean().describe("True for marketing blasts, newsletters, automated notifications, surveys, or anything not a real personal/business message"),
      needsAction: z.boolean().describe("True only if this looks like it genuinely needs a reply or action from Rocky"),
    }),
  ),
});

function safeDefault(messages: TriageInput[]): TriageResult[] {
  return messages.map((m) => ({ id: m.id, isSpam: false, needsAction: false }));
}

export async function classifyEmails(messages: TriageInput[]): Promise<TriageResult[]> {
  if (messages.length === 0) return [];
  if (!aiEnabled) return safeDefault(messages);

  try {
    const { object } = await generateObject({
      model: chatModel,
      schema: triageSchema,
      system:
        "You triage a busy small-business owner's inbox. For each email (by id), decide: " +
        "isSpam — true for marketing, newsletters, automated receipts/notifications, surveys, cold outreach, " +
        "AND always true for lender/funding solicitations (business loans, 'working capital', merchant cash " +
        "advance, 'you were pre-approved', factoring offers) even when personalized with his name or business — " +
        "these are mass outreach regardless of how tailored they look. " +
        "For everything else: false for real messages from real people or businesses he actually works with, " +
        "even if short. " +
        "needsAction — true only when it clearly needs a reply or decision from him soon; false for FYI-only, " +
        "already-resolved threads, or anything marked isSpam. Be conservative on isSpam otherwise: when unsure, " +
        "mark isSpam false.",
      prompt: JSON.stringify(
        messages.map((m) => ({ id: m.id, from: m.from, subject: m.subject, snippet: m.snippet })),
      ),
    });
    return object.results;
  } catch {
    return safeDefault(messages);
  }
}
