export const RELATIONSHIP_LABEL: Record<string, string> = {
  FAMILY: "Family",
  FRIEND: "Friend",
  COLLEAGUE: "Colleague",
  CLIENT: "Client",
  PARTNER: "Partner",
  ACQUAINTANCE: "Acquaintance",
  OTHER: "Other",
};

export const RELATIONSHIP_OPTIONS = Object.entries(RELATIONSHIP_LABEL).map(([value, label]) => ({ value, label }));

export const INTERACTION_TYPE_LABEL: Record<string, string> = {
  CALL: "Call",
  MEETING: "Meeting",
  MESSAGE: "Message",
  EMAIL: "Email",
  EVENT: "Event",
  NOTE: "Note",
};

export const INTERACTION_TYPE_OPTIONS = Object.entries(INTERACTION_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}));
