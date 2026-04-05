import { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebaseAdmin";
import { buildExpensePayload, nowTimestamp, toIso } from "@/lib/serverUtils";

const collectionRef = db.collection("expenses");

const serializeExpense = (id: string, data: Record<string, unknown>) => ({
  _id: id,
  description: String(data.description ?? ""),
  amount: Number(data.amount ?? 0),
  category: String(data.category ?? ""),
  comment: typeof data.comment === "string" ? data.comment : undefined,
  tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
  currency: (String(data.currency ?? "COP").toUpperCase() === "USD" ? "USD" : "COP") as "COP" | "USD",
  receiptUrl: typeof data.receiptUrl === "string" ? data.receiptUrl : undefined,
  date: toIso(data.date),
  isDeleted: data.isDeleted === true,
  deletedAt: toIso(data.deletedAt) ?? null,
  createdAt: toIso(data.createdAt),
  updatedAt: toIso(data.updatedAt),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = collectionRef.where("isDeleted", "==", includeDeleted).orderBy("date", "desc");

    if (startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) {
        query = query.where("date", ">=", Timestamp.fromDate(start));
      }
    }
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999Z`);
      if (!Number.isNaN(end.getTime())) {
        query = query.where("date", "<=", Timestamp.fromDate(end));
      }
    }

    const snapshot = await query.get();
    const expenses = snapshot.docs.map((doc) => serializeExpense(doc.id, doc.data()));
    return Response.json(expenses);
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = buildExpensePayload(await request.json());
    if (!parsed.ok) {
      return Response.json({ error: parsed.error }, { status: parsed.status });
    }

    const now = nowTimestamp();
    const ref = await collectionRef.add({
      ...parsed.payload,
      date: parsed.payload.date ?? now,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ref.get();
    return Response.json(serializeExpense(created.id, created.data() ?? {}), { status: 201 });
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

