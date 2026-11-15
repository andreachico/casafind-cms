// Talks to the CasaFind FastAPI/GraphQL backend so properties created here
// appear on the CasaFind public website (they share one database).
export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export interface ApiProperty {
  id: string;
  title: string;
  description: string | null;
  listing_type: "sale" | "rent";
  price: number;
  room_count: number;
  bathroom_count: number;
  parking_count: number;
  property_size: number | null;
  lot_size: number | null;
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

const PROPERTY_FIELDS = `
  id
  title
  description
  listingType
  price
  roomCount
  bathroomCount
  parkingCount
  propertySize
  lotSize
`;

type RawProperty = Record<string, unknown>;

function normalize(r: RawProperty): ApiProperty {
  return {
    id: String(r.id),
    title: String(r.title),
    description: (r.description as string | null) ?? null,
    listing_type: (r.listingType as "sale" | "rent") ?? "sale",
    price: Number(r.price ?? 0),
    room_count: Number(r.roomCount ?? 0),
    bathroom_count: Number(r.bathroomCount ?? 0),
    parking_count: Number(r.parkingCount ?? 0),
    property_size:
      r.propertySize === null || r.propertySize === undefined
        ? null
        : Number(r.propertySize),
    lot_size:
      r.lotSize === null || r.lotSize === undefined ? null : Number(r.lotSize),
  };
}

export async function listProperties(): Promise<ApiProperty[]> {
  const data = await gql<{ properties: RawProperty[] }>(
    `query { properties { ${PROPERTY_FIELDS} } }`
  );
  return (data.properties ?? []).map(normalize);
}

export interface PropertyInput {
  title: string;
  description?: string | null;
  listing_type: "sale" | "rent";
  price: number;
  room_count: number;
  bathroom_count: number;
  parking_count: number;
  property_size?: number | null;
  lot_size?: number | null;
}

export async function createProperty(input: PropertyInput): Promise<ApiProperty> {
  const data = await gql<{ createProperty: RawProperty }>(
    `mutation Create($title: String!, $description: String, $listingType: String!, $price: Float!, $roomCount: Int!, $bathroomCount: Int!, $parkingCount: Int!, $propertySize: Float, $lotSize: Float) {
      createProperty(title: $title, description: $description, listingType: $listingType, price: $price, roomCount: $roomCount, bathroomCount: $bathroomCount, parkingCount: $parkingCount, propertySize: $propertySize, lotSize: $lotSize) { ${PROPERTY_FIELDS} }
    }`,
    {
      title: input.title,
      description: input.description ?? null,
      listingType: input.listing_type,
      price: input.price,
      roomCount: input.room_count,
      bathroomCount: input.bathroom_count,
      parkingCount: input.parking_count,
      propertySize: input.property_size ?? null,
      lotSize: input.lot_size ?? null,
    }
  );
  return normalize(data.createProperty);
}

export async function updateProperty(
  id: string,
  input: PropertyInput
): Promise<ApiProperty> {
  const data = await gql<{ updateProperty: RawProperty }>(
    `mutation Update($id: String!, $title: String, $description: String, $listingType: String, $price: Float, $roomCount: Int, $bathroomCount: Int, $parkingCount: Int, $propertySize: Float, $lotSize: Float) {
      updateProperty(id: $id, title: $title, description: $description, listingType: $listingType, price: $price, roomCount: $roomCount, bathroomCount: $bathroomCount, parkingCount: $parkingCount, propertySize: $propertySize, lotSize: $lotSize) { ${PROPERTY_FIELDS} }
    }`,
    {
      id,
      title: input.title,
      description: input.description ?? null,
      listingType: input.listing_type,
      price: input.price,
      roomCount: input.room_count,
      bathroomCount: input.bathroom_count,
      parkingCount: input.parking_count,
      propertySize: input.property_size ?? null,
      lotSize: input.lot_size ?? null,
    }
  );
  return normalize(data.updateProperty);
}

export async function deleteProperty(id: string): Promise<void> {
  await gql<{ deleteProperty: boolean }>(
    `mutation Delete($id: String!) { deleteProperty(id: $id) }`,
    { id }
  );
}
