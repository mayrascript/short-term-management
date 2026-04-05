import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { nowTimestamp, toIso, toTimestamp } from "@/lib/serverUtils";

const collectionRef = db.collection("posts");

type ParamsContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {
      updatedAt: nowTimestamp(),
    };

    if (typeof body.idea === "string") updates.idea = body.idea.trim();
    if (typeof body.platform === "string") updates.platform = body.platform.trim();
    if (typeof body.status === "string") updates.status = body.status;
    if (body.scheduledDate !== undefined) updates.scheduledDate = toTimestamp(body.scheduledDate) ?? null;

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
      idea: String(data.idea ?? ""),
      platform: String(data.platform ?? ""),
      status: String(data.status ?? "idea"),
      scheduledDate: toIso(data.scheduledDate),
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    });
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

