import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { aiEnabled, chatModel } from "./openai";

export type TriageInput = { id: string; subject: string; from: string; snippet: string };
export type TriageResult = { id: string; isSpam: boolean; needsAction: boolean };

// Ask for results by array position, not by echoing back Gmail's opaque message id — if the
// model alters an id even slightly, a lookup-by-id match silently fails with no error thrown.
const triageSchema = z.object({
  results: z.array(
    z.object({
      index: z.number().describe("The 0-based position of this email in the input list"),
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
        "You triage a busy small-business owner's inbox. For each email below (numbered by position, " +
        "starting at 0), decide: " +
        "isSpam — true for marketing, newsletters, automated receipts/notifications, surveys, cold outreach, " +
        "AND always true for lender/funding solicitations (business loans, 'working capital', merchant cash " +
        "advance, 'you were pre-approved', factoring offers) even when personalized with his name or business — " +
        "these are mass outreach regardless of how tailored they look. " +
        "For everything else: false for real messages from real people or businesses he actually works with, " +
        "even if short. " +
        "needsAction — true only when it clearly needs a reply or decision from him soon; false for FYI-only, " +
        "already-resolved threads, or anything marked isSpam. Be conservative on isSpam otherwise: when unsure, " +
        "mark isSpam false. Return exactly one result per input email, using its position as `index` — do not " +
        "skip any, and do not invent extra ones.",
      prompt: JSON.stringify(
        messages.map((m, index) => ({ index, from: m.from, subject: m.subject, snippet: m.snippet })),
      ),
    });

    const byIndex = new Map(object.results.map((r) => [r.index, r]));
    return messages.map((m, index) => {
      const r = byIndex.get(index);
      return { id: m.id, isSpam: r?.isSpam ?? false, needsAction: r?.needsAction ?? false };
    });
  } catch (err) {
    console.error("[classifyEmails] falling back to unclassified:", err);
    return safeDefault(messages);
  }
}
