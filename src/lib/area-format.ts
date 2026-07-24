export const AREA_LABEL: Record<string, string> = {
  BUSINESS: "Business",
  HEALTH: "Health",
  FAMILY: "Family",
  FINANCE: "Finance",
  PERSONAL_GROWTH: "Personal Growth",
  RELATIONSHIPS: "Relationships",
  HOME: "Home",
  OTHER: "Other",
};

export const AREA_OPTIONS = Object.entries(AREA_LABEL).map(([value, label]) => ({ value, label }));
