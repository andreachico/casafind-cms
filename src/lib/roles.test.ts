import { describe, expect, it } from "vitest";
import {
  canManageCmsUsers,
  isCmsAccessRole,
  isCmsAdminRole,
  normalizeRole,
} from "./roles";

describe("CMS role permissions", () => {
  it("requires a verified admin before account management is allowed", () => {
    expect(isCmsAdminRole("ADMIN", true)).toBe(true);
    expect(isCmsAdminRole("ADMIN", false)).toBe(false);
    expect(isCmsAdminRole("AGENT")).toBe(false);
    expect(canManageCmsUsers("ADMIN", true)).toBe(true);
    expect(canManageCmsUsers("ADMIN", false)).toBe(false);
    expect(canManageCmsUsers("OWNER")).toBe(false);
  });

  it("normalizes legacy roles into the canonical 3-role model", () => {
    expect(normalizeRole("AGENT")).toBe("LISTER");
    expect(normalizeRole("OWNER")).toBe("LISTER");
    expect(normalizeRole("LISTER")).toBe("LISTER");
    expect(normalizeRole("ADMIN")).toBe("ADMIN");
    expect(normalizeRole("SEEKER")).toBe("SEEKER");
  });

  it("allows CMS access for admins and listers but not seekers", () => {
    expect(isCmsAccessRole("SEEKER")).toBe(false);
    expect(isCmsAccessRole("LISTER")).toBe(true);
    expect(isCmsAccessRole("AGENT")).toBe(true);
    expect(isCmsAccessRole("ADMIN")).toBe(true);
  });
});
