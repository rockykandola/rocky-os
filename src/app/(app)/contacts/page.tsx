import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { getContacts } from "@/server/data/contacts";
import { RELATIONSHIP_LABEL } from "@/lib/contact-format";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { ImportContactsButton } from "@/components/contacts/import-contacts-button";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function ContactsPage() {
  const user = await requireUser();
  const contacts = await getContacts(user.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">Family, friends, clients — everyone that matters.</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportContactsButton />
          <ContactFormDialog />
        </div>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No contacts yet. Import from Gmail, or add your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
