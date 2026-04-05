import "server-only";
import { Timestamp } from "firebase-admin/firestore";

export const toIso = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
};

export const toTimestamp = (value: unknown): Timestamp | undefined => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  return Timestamp.fromDate(date);
};

export const nowTimestamp = () => Timestamp.now();

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

type ExpensePayloadResult =
  | {
      ok: true;
      payload: {
        description: string;
        amount: number;
        category: string;
        currency: "COP" | "USD";
        comment?: string;
        receiptUrl?: string;
        tags: string[];
        date?: Timestamp;
      };
    }
  | { ok: false; status: number; error: string };

export const buildExpensePayload = (rawBody: unknown): ExpensePayloadResult => {
  const body = (rawBody ?? {}) as Record<string, unknown>;
  const description = String(body.description ?? "").trim();
  const amount = Number(body.amount);
  const category = String(body.category ?? "").trim();
  const currency = String(body.currency ?? "COP").toUpperCase();
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  const receiptUrl = typeof body.receiptUrl === "string" ? body.receiptUrl.trim() : "";
  const tags = Array.isArray(body.tags)
    ? body.tags
        .filter((tag: unknown): tag is string => typeof tag === "string")
        .map((tag: string) => tag.trim())
        .filter(Boolean)
    : [];

  if (!description || !category || Number.isNaN(amount)) {
    return { ok: false, status: 400, error: "description, amount and category are required" };
  }

  if (currency !== "COP" && currency !== "USD") {
    return { ok: false, status: 400, error: "currency must be COP or USD" };
  }

  if (receiptUrl && !isValidHttpUrl(receiptUrl)) {
    return { ok: false, status: 400, error: "receiptUrl must be a valid http/https URL" };
  }

  const dateTimestamp = toTimestamp(body.date);

  return {
    ok: true,
    payload: {
      description,
      amount,
      category,
      currency,
      comment: comment || undefined,
      receiptUrl: receiptUrl || undefined,
      tags,
      date: dateTimestamp,
    },
  };
};

