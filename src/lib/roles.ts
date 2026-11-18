// Canonical 3-role model. Legacy "AGENT"/"OWNER" values may still appear in
// data and are treated as "LISTER".
export const CMS_ROLES = ["ADMIN", "LISTER", "SEEKER"] as const;

export type CmsRoleGroup = "ADMIN" | "LISTER" | "SEEKER";

export const CMS_ACCOUNT_MANAGEMENT_ROLES = ["ADMIN"] as const;

// Collapse any stored role (including legacy AGENT/OWNER) into a canonical group.
export const normalizeRole = (role?: string | null): CmsRoleGroup => {
  if (role === "ADMIN") return "ADMIN";
  if (role === "SEEKER") return "SEEKER";
  return "LISTER";
};

export const ROLE_LABELS: Record<CmsRoleGroup, string> = {
  ADMIN: "Admin",
  LISTER: "Lister",
  SEEKER: "Seeker",
};

export const isCmsAdminRole = (role?: string | null, verified = true): boolean =>
  role === "ADMIN" && verified !== false;

// Whether a role may access the CMS at all (verification is checked separately).
// ADMIN and lister-types (LISTER/AGENT/OWNER) may access; SEEKER may not.
export const isCmsAccessRole = (role?: string | null): boolean =>
  normalizeRole(role) !== "SEEKER";

export const canManageCmsUsers = (role?: string | null, verified = true): boolean =>
  isCmsAdminRole(role, verified) &&
  CMS_ACCOUNT_MANAGEMENT_ROLES.includes(role as (typeof CMS_ACCOUNT_MANAGEMENT_ROLES)[number]);
