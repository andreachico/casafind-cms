import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  type AuthUser,
  type RegisterInput,
} from "@/lib/authApi";
import { isCmsAccessRole } from "@/lib/roles";

const STORAGE_KEY = "casafind_cms_auth";

interface StoredAuth {
  user: AuthUser;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLister: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStored(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

// Only staff roles may use the CMS; property seekers are public-site only.
function assertCmsRole(user: AuthUser): void {
  if (!isCmsAccessRole(user.role)) {
    throw new Error(
      "This account is not allowed to access the CMS. Seekers can use the CasaFind website."
    );
  }

  if (user.role === "ADMIN") {
    if (!user.verified) {
      throw new Error("This admin account is pending verification.");
    }
    return;
  }

  // Lister-type account (LISTER/AGENT/OWNER).
  if (!user.verified) {
    throw new Error("Please verify your email before accessing the CMS.");
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [stored, setStored] = useState<StoredAuth | null>(() => readStored());

  useEffect(() => {
    if (stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [stored]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    assertCmsRole(result.user);
    setStored({ user: result.user, token: result.token });
    return result.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await apiRegister(input);
    assertCmsRole(result.user);
    setStored({ user: result.user, token: result.token });
    return result.user;
  }, []);

  const logout = useCallback(() => setStored(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: stored?.user ?? null,
      token: stored?.token ?? null,
      isAuthenticated: !!stored,
      isAdmin: stored?.user.role === "ADMIN" && stored.user.verified !== false,
      isLister:
        !!stored &&
        stored.user.role !== "ADMIN" &&
        stored.user.role !== "SEEKER",
      login,
      register,
      logout,
    }),
    [stored, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
