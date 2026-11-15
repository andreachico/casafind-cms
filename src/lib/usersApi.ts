// Talks to the CasaFind FastAPI/GraphQL backend so users created here can log
// in on the CasaFind website (they share one `users` table with bcrypt-hashed
// passwords and roles).
export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export type UserRole = "ADMIN" | "AGENT" | "OWNER" | "SEEKER";

export interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  contact_number: string | null;
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

const USER_FIELDS = `
  id
  firstName
  lastName
  email
  role
  verified
  contactNumber
`;

type RawUser = Record<string, unknown>;

function normalize(r: RawUser): ApiUser {
  return {
    id: Number(r.id),
    first_name: String(r.firstName ?? ""),
    last_name: String(r.lastName ?? ""),
    email: String(r.email ?? ""),
    role: (r.role as UserRole) ?? "SEEKER",
    verified: Boolean(r.verified),
    contact_number: (r.contactNumber as string | null) ?? null,
  };
}

export async function listUsers(): Promise<ApiUser[]> {
  const data = await gql<{ users: RawUser[] }>(`query { users { ${USER_FIELDS} } }`);
  return (data.users ?? []).map(normalize);
}

export interface CreateUserInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
  verified?: boolean;
  contact_number?: string | null;
}

export async function createUser(input: CreateUserInput): Promise<ApiUser> {
  const data = await gql<{ createUser: RawUser }>(
    `mutation Create($firstName: String!, $lastName: String!, $email: String!, $password: String!, $role: String!, $contactNumber: String, $verified: Boolean) {
      createUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password, role: $role, contactNumber: $contactNumber, verified: $verified) { ${USER_FIELDS} }
    }`,
    {
      firstName: input.first_name,
      lastName: input.last_name,
      email: input.email,
      password: input.password,
      role: input.role,
      contactNumber: input.contact_number ?? null,
      verified: input.verified ?? (input.role !== "ADMIN"),
    }
  );
  return normalize(data.createUser);
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string | null;
  role?: UserRole;
  verified?: boolean;
  contact_number?: string | null;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<ApiUser> {
  const data = await gql<{ updateUser: RawUser }>(
    `mutation Update($id: Int!, $firstName: String, $lastName: String, $email: String, $password: String, $role: String, $contactNumber: String, $verified: Boolean) {
      updateUser(id: $id, firstName: $firstName, lastName: $lastName, email: $email, password: $password, role: $role, contactNumber: $contactNumber, verified: $verified) { ${USER_FIELDS} }
    }`,
    {
      id,
      firstName: input.first_name,
      lastName: input.last_name,
      email: input.email,
      password: input.password || null,
      role: input.role,
      contactNumber: input.contact_number ?? null,
      verified: input.verified,
    }
  );
  return normalize(data.updateUser);
}

export async function deleteUser(id: number): Promise<void> {
  await gql<{ deleteUser: boolean }>(
    `mutation Delete($id: Int!) { deleteUser(id: $id) }`,
    { id }
  );
}
