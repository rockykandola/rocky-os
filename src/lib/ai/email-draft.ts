import "server-only";
import { generateText } from "ai";
import { aiEnabled, chatModel } from "./openai";

export type ThreadHistoryEntry = {
  from: string;
  date: string;
  body: string;
  isFromMe: boolean;
};

export async function generateEmailDraftReply(input: {
  subject: string;
  latestFrom: string;
  latestBody: string;
  threadHistory: ThreadHistoryEntry[];
  voiceNotes: string | null;
  writingSamples: string[];
  businessNames: string[];
}): Promise<string> {
  const fallback = `Hi,\n\nThanks for your email — I'll get back to you on this shortly.`;
  if (!aiEnabled) {
    return `${fallback}\n\n(Set a valid OPENAI_API_KEY to get an actual AI-drafted reply instead of this placeholder.)`;
  }

  const historyText = input.threadHistory.length
    ? input.threadHistory
        .map((m) => `${m.isFromMe ? "Rocky" : m.from} — ${m.date}:\n${m.body}`)
        .join("\n\n---\n\n")
    : "(no earlier messages in this thread)";

  const samplesText = input.writingSamples.length
    ? input.writingSamples.map((s, i) => `Sample ${i + 1}:\n${s}`).join("\n\n")
    : "(no samples available — default to a warm, direct, no-nonsense tone)";

  const businessText = input.businessNames.length
    ? input.businessNames.join(", ")
    : "several small businesses";

  const system = [
    "You ghostwrite email replies AS Rocky — in his voice, first person, not \"on behalf of\" him.",
    `Rocky currently runs: ${businessText}. Use this to understand context, not to force a mention.`,
    "Below are real examples of emails Rocky has actually sent — match his tone, greeting style, " +
      "sentence length, and sign-off exactly as shown, don't default to generic corporate-assistant phrasing.",
    samplesText,
    input.voiceNotes ? `Rocky's own notes on his voice: ${input.voiceNotes}` : "",
    "You'll also get the full thread so far for context — only write the reply to the latest message, " +
      "don't re-litigate or re-answer earlier messages.",
    "Plain text only, no markdown, no subject line. Don't invent facts, commitments, prices, or dates " +
      "that aren't already in the thread — where a specific answer is needed, leave a bracketed " +
      "placeholder like [confirm date] instead of guessing.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = `Conversation so far:\n${historyText}\n\nSubject: ${input.subject}\nLatest message, from ${input.latestFrom}:\n${input.latestBody}`;

  try {
    const { text } = await generateText({ model: chatModel, system, prompt });
    return text.trim();
  } catch {
    return `${fallback}\n\n(AI drafting failed — check that OPENAI_API_KEY is a valid, active key.)`;
  }
}
