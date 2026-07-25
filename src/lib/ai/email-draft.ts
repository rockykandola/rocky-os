import "server-only";
import { generateText } from "ai";
import { aiEnabled, chatModel } from "./openai";

export async function generateEmailDraftReply(input: {
  subject: string;
  from: string;
  body: string;
}): Promise<string> {
  const fallback = `Hi,\n\nThanks for your email — I'll get back to you on this shortly.`;
  if (!aiEnabled) {
    return `${fallback}\n\n(Set a valid OPENAI_API_KEY to get an actual AI-drafted reply instead of this placeholder.)`;
  }

  try {
    const { text } = await generateText({
      model: chatModel,
      system:
        "You draft email replies for a busy small-business owner who runs several companies. " +
        "Write a clear, professional, friendly reply in plain text — no markdown, no subject line, " +
        "just the body. Keep it concise. Don't invent facts, commitments, prices, or dates that " +
        "aren't in the original email — where a specific answer is needed, leave a bracketed " +
        "placeholder like [confirm date] instead of guessing.",
      prompt: `From: ${input.from}\nSubject: ${input.subject}\n\n${input.body}`,
    });
    return text.trim();
  } catch {
    return `${fallback}\n\n(AI drafting failed — check that OPENAI_API_KEY is a valid, active key.)`;
  }
}
