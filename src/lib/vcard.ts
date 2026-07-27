import "server-only";

export type VCardEntry = {
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  birthday: Date | null;
};

function unfoldLines(text: string): string[] {
  const rawLines = text.split(/\r\n|\r|\n/);
  const lines: string[] = [];
  for (const line of rawLines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

function parseLine(line: string): { name: string; value: string } | null {
  const idx = line.indexOf(":");
  if (idx === -1) return null;
  const name = line.slice(0, idx).split(";")[0].toUpperCase();
  return { name, value: line.slice(idx + 1) };
}

function decodeValue(value: string): string {
  return value.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").trim();
}

function parseBirthday(value: string): Date | null {
  const cleaned = value.replace(/[^0-9-]/g, "");
  const match = cleaned.match(/^(\d{4})-?(\d{2})-?(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Parses a .vcf export (iCloud/iPhone contacts) into a flat list of entries. */
export function parseVCards(text: string): VCardEntry[] {
  const lines = unfoldLines(text);
  const entries: VCardEntry[] = [];
  let current: Record<string, string> | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^BEGIN:VCARD$/i.test(line)) {
      current = {};
      continue;
    }
    if (/^END:VCARD$/i.test(line)) {
      if (current) {
        const fn = current.FN ? decodeValue(current.FN) : "";
        let fullName = fn;
        if (!fullName && current.N) {
          const parts = decodeValue(current.N).split(";");
          fullName = [parts[1], parts[0]].filter(Boolean).join(" ").trim();
        }
        entries.push({
          fullName,
          email: current.EMAIL ? decodeValue(current.EMAIL).toLowerCase() : null,
          phone: current.TEL ? decodeValue(current.TEL) : null,
          company: current.ORG ? decodeValue(current.ORG).split(";")[0].trim() : null,
          birthday: current.BDAY ? parseBirthday(current.BDAY) : null,
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const parsed = parseLine(line);
    // Keep only the first occurrence of each field — exports usually list the preferred one first.
    if (parsed && !(parsed.name in current)) {
      current[parsed.name] = parsed.value;
    }
  }

  return entries;
}
