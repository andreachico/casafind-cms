export const CMS_ROLES = ["ADMIN", "AGENT", "OWNER", "SEEKER"] as const;

export const CMS_ACCOUNT_MANAGEMENT_ROLES = ["ADMIN"] as const;

export const isCmsAdminRole = (role?: string | null, verified = true): boolean =>
  role === "ADMIN" && verified !== false;

export const canManageCmsUsers = (role?: string | null, verified = true): boolean =>
  isCmsAdminRole(role, verified) &&
  CMS_ACCOUNT_MANAGEMENT_ROLES.includes(role as (typeof CMS_ACCOUNT_MANAGEMENT_ROLES)[number]);
