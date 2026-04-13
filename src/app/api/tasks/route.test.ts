import { describe, it, expect, vi, beforeEach } from "vitest";

// Wire up in-memory doubles BEFORE importing the route module so the
// module-scope `db.collection("tasks")` call resolves against our mock.
const get = vi.fn();
const orderBy = vi.fn(() => ({ get }));
const add = vi.fn();
const collection = vi.fn(() => ({ orderBy, add }));

vi.mock("@/lib/firebaseAdmin", () => ({
  db: { collection },
}));

vi.mock("@/lib/serverUtils", () => ({
  nowTimestamp: () => "NOW_TS",
  toIso: (v: unknown) => (v ? "2026-04-13T00:00:00.000Z" : undefined),
  toTimestamp: (v: unknown) => v ?? null,
}));

import { GET, POST } from "./route";

describe("api/tasks route", () => {
  beforeEach(() => {
    get.mockReset();
    add.mockReset();
    orderBy.mockClear();
    collection.mockClear();
  });

  describe("GET", () => {
    it("maps Firestore docs to the public task shape", async () => {
      get.mockResolvedValueOnce({
        docs: [
          {
            id: "t1",
            data: () => ({
              title: "Buy paint",
              description: "white matte",
              category: "maintenance",
              status: "pending",
              createdAt: 1,
              updatedAt: 2,
            }),
          },
        ],
      });

      const res = await GET();
      expect(res.status).toBe(200);
      expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
      const body = await res.json();
      expect(body).toEqual([
        expect.objectContaining({
          _id: "t1",
          title: "Buy paint",
          category: "maintenance",
          status: "pending",
        }),
      ]);
    });

    it("returns 500 on Firestore errors", async () => {
      get.mockRejectedValueOnce(new Error("boom"));
      const res = await GET();
      expect(res.status).toBe(500);
    });
  });

  describe("POST", () => {
    function jsonReq(body: unknown) {
      return new Request("http://t/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    it("rejects when title is missing", async () => {
      const res = await POST(jsonReq({ category: "maintenance" }) as never);
      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toMatchObject({ error: expect.any(String) });
      expect(add).not.toHaveBeenCalled();
    });

    it("creates a task and returns 201 with the new document", async () => {
      add.mockResolvedValueOnce({
        id: "new",
        get: async () => ({
          id: "new",
          data: () => ({
            title: "Buy paint",
            category: "maintenance",
            status: "pending",
            createdAt: 1,
            updatedAt: 1,
          }),
        }),
      });

      const res = await POST(
        jsonReq({ title: "Buy paint", category: "maintenance" }) as never
      );

      expect(res.status).toBe(201);
      expect(add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Buy paint",
          category: "maintenance",
          status: "pending",
        })
      );
      const body = await res.json();
      expect(body).toMatchObject({ _id: "new", title: "Buy paint" });
    });
  });
});
