import { describe, expect, it } from "vitest";
import { normalizeProperty } from "./propertiesApi";

describe("propertiesApi", () => {
  it("keeps imageUrl in the normalized property payload and resolves relative URLs", () => {
    const result = normalizeProperty({
      id: "p-1",
      title: "Test Condo",
      description: "Nice condo",
      listingType: "sale",
      price: 1500000,
      roomCount: 2,
      bathroomCount: 2,
      parkingCount: 1,
      propertySize: 60,
      lotSize: null,
      imageUrl: "/uploads/test.jpg",
      detailImageUrl: "/uploads/detail-test.jpg",
    });

    expect(result.image_url).toBe("http://127.0.0.1:8000/uploads/test.jpg");
    expect(result.detail_image_url).toBe("http://127.0.0.1:8000/uploads/detail-test.jpg");
  });
});
