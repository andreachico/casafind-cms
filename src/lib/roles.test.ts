import { describe, expect, it } from "vitest";
import { canManageCmsUsers, isCmsAdminRole } from "./roles";

describe("CMS role permissions", () => {
  it("requires a verified admin before account management is allowed", () => {
    expect(isCmsAdminRole("ADMIN", true)).toBe(true);
    expect(isCmsAdminRole("ADMIN", false)).toBe(false);
    expect(isCmsAdminRole("AGENT")).toBe(false);
    expect(canManageCmsUsers("ADMIN", true)).toBe(true);
    expect(canManageCmsUsers("ADMIN", false)).toBe(false);
    expect(canManageCmsUsers("OWNER")).toBe(false);
  });
});
