import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { nowTimestamp, toIso } from "@/lib/serverUtils";

const collectionRef = db.collection("tasks");

type ParamsContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {
      updatedAt: nowTimestamp(),
    };

    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.description === "string") updates.description = body.description.trim();
    if (typeof body.category === "string") updates.category = body.category;
    if (typeof body.status === "string") updates.status = body.status;

    const docRef = collectionRef.doc(id);
    const existing = await docRef.get();
    if (!existing.exists) {
      return Response.json(null);
    }

    await docRef.update(updates);
    const updated = await docRef.get();
    const data = updated.data() ?? {};
    return Response.json({
      _id: updated.id,
      title: String(data.title ?? ""),
      description: typeof data.description === "string" ? data.description : undefined,
      category: String(data.category ?? "maintenance"),
      status: String(data.status ?? "pending"),
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    });
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

