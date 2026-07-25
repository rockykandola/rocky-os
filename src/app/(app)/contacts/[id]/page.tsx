import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Mail, Phone, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { getContactDetail } from "@/server/data/contacts";
import { RELATIONSHIP_LABEL, INTERACTION_TYPE_LABEL } from "@/lib/contact-format";
import { LogInteractionForm } from "@/components/contacts/log-interaction-form";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const contact = await getContactDetail(user.id, id);
  if (!contact) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-medium">
            {initials(contact.fullName)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{contact.fullName}</h1>
            <Badge variant="outline" className="mt-1 text-[10px]">
              {RELATIONSHIP_LABEL[contact.relationship]}
            </Badge>
          </div>
        </div>
        <DeleteContactButton contactId={contact.id} name={contact.fullName} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {contact.email && (
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> {contact.email}
          </span>
        )}
        {contact.phone && (
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> {contact.phone}
          </span>
        )}
        {contact.company && (
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> {contact.company}
          </span>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Log an interaction</h2>
        <LogInteractionForm contactId={contact.id} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">History</h2>
        {contact.interactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing logged yet.</p>
        ) : (
          contact.interactions.map((interaction) => (
            <div key={interaction.id} className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">
                  {INTERACTION_TYPE_LABEL[interaction.type]}
                </Badge>
                {format(new Date(interaction.occurredAt), "MMM d, yyyy · h:mm a")}
              </div>
              <p className="text-sm">{interaction.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
