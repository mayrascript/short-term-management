import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./clientApi";

describe("apiRequest", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefixes the path with /api and forces JSON headers", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hello: "world" }),
    });

    const result = await apiRequest<{ hello: string }>("/tasks");

    expect(fetch).toHaveBeenCalledWith(
      "/api/tasks",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        cache: "no-store",
      })
    );
    expect(result).toEqual({ hello: "world" });
  });

  it("throws with the server-provided error message when !response.ok", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "title is required" }),
    });

    await expect(apiRequest("/tasks", { method: "POST" })).rejects.toThrow(
      "title is required"
    );
  });

  it("falls back to a status-based message when the error body is unparseable", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("bad json");
      },
    });

    await expect(apiRequest("/tasks")).rejects.toThrow(/500/);
  });
});
