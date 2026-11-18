// Authentication against the CasaFind FastAPI/GraphQL backend. The CMS shares
// the same `users` table (bcrypt-hashed passwords, JWT tokens) as the public
// CasaFind website, so accounts created here can be used across both apps.
export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export type UserRole = "ADMIN" | "LISTER" | "SEEKER" | "AGENT" | "OWNER";

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  contact_number: string | null;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

type RawAuth = {
  user: {
    id: number | string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    verified?: boolean | null;
    contactNumber?: string | null;
  };
  token: string;
};

const AUTH_FIELDS = `
  user {
    id
    firstName
    lastName
    email
    role
    verified
    contactNumber
  }
  token
`;

function normalize(raw: RawAuth): AuthResult {
  return {
    user: {
      id: Number(raw.user.id),
      first_name: raw.user.firstName ?? "",
      last_name: raw.user.lastName ?? "",
      email: raw.user.email ?? "",
      role: (raw.user.role as UserRole) ?? "SEEKER",
      verified: raw.user.verified ?? false,
      contact_number: raw.user.contactNumber ?? null,
    },
    token: raw.token,
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const data = await gql<{ login: RawAuth }>(
    `mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) { ${AUTH_FIELDS} }
    }`,
    { email, password }
  );
  return normalize(data.login);
}

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
  contact_number?: string | null;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const data = await gql<{ register: RawAuth }>(
    `mutation Register($firstName: String!, $lastName: String!, $email: String!, $password: String!, $role: String!, $contactNumber: String) {
      register(firstName: $firstName, lastName: $lastName, email: $email, password: $password, role: $role, contactNumber: $contactNumber) { ${AUTH_FIELDS} }
    }`,
    {
      firstName: input.first_name,
      lastName: input.last_name,
      email: input.email,
      password: input.password,
      role: input.role,
      contactNumber: input.contact_number ?? null,
    }
  );
  return normalize(data.register);
}
