import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { buildExpensePayload, nowTimestamp, toIso } from "@/lib/serverUtils";

const collectionRef = db.collection("expenses");
type ParamsContext = { params: Promise<{ id: string }> };

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

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const { id } = await context.params;
    const parsed = buildExpensePayload(await request.json());
    if (!parsed.ok) {
      return Response.json({ error: parsed.error }, { status: parsed.status });
    }

    const docRef = collectionRef.doc(id);
    const existing = await docRef.get();
    if (!existing.exists || existing.data()?.isDeleted === true) {
      return Response.json({ error: "Expense not found" }, { status: 404 });
    }

    await docRef.update({
      ...parsed.payload,
      date: parsed.payload.date ?? existing.data()?.date ?? nowTimestamp(),
      updatedAt: nowTimestamp(),
    });
    const updated = await docRef.get();
    return Response.json(serializeExpense(updated.id, updated.data() ?? {}));
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const { id } = await context.params;
    const docRef = collectionRef.doc(id);
    const existing = await docRef.get();
    if (!existing.exists || existing.data()?.isDeleted === true) {
      return Response.json({ error: "Expense not found" }, { status: 404 });
    }

    await docRef.update({
      isDeleted: true,
      deletedAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    });
    const updated = await docRef.get();
    return Response.json(serializeExpense(updated.id, updated.data() ?? {}));
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

