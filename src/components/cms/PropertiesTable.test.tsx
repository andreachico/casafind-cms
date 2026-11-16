import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PropertiesTable from "./PropertiesTable";

const listPropertiesMock = vi.fn();

vi.mock("@/lib/propertiesApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/propertiesApi")>();

  return {
    ...actual,
    listProperties: (...args: unknown[]) => listPropertiesMock(...args),
    deleteProperty: vi.fn(),
  };
});

describe("PropertiesTable", () => {
  beforeEach(() => {
    listPropertiesMock.mockReset();
  });

  it("shows an error when property data cannot load instead of silently showing zero listings", async () => {
    listPropertiesMock.mockRejectedValue(new Error("Failed to connect to backend"));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PropertiesTable />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load properties/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to connect to backend/i)).toBeInTheDocument();
  });
});
