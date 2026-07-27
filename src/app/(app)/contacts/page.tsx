import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { getContacts } from "@/server/data/contacts";
import { RELATIONSHIP_LABEL } from "@/lib/contact-format";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { ImportContactsButton } from "@/components/contacts/import-contacts-button";
import { ImportVCardButton } from "@/components/contacts/import-vcard-button";
import { ImportHubSpotCSVButton } from "@/components/contacts/import-hubspot-csv-button";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const user = await requireUser();
  const { contacts, total } = await getContacts(user.id, { query: q });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">Family, friends, clients — everyone that matters.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ImportContactsButton />
          <ImportVCardButton />
          <ImportHubSpotCSVButton />
          <ContactFormDialog />
        </div>
      </div>

      <form className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name, email, phone, or company…"
          className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </form>

      {total === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {q ? `No contacts match "${q}".` : "No contacts yet. Import from Gmail, or add your first one."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Showing {contacts.length} of {total} contact{total === 1 ? "" : "s"}
            {!q && total > contacts.length ? " — search to narrow it down" : ""}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact) => (
              <Link key={contact.id} href={`/contacts/${contact.id}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {initials(contact.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{contact.fullName}</p>
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {RELATIONSHIP_LABEL[contact.relationship]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
