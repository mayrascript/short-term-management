import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { nowTimestamp, toIso } from "@/lib/serverUtils";

const collectionRef = db.collection("guests");
type ParamsContext = { params: Promise<{ id: string }> };

const serializeGuest = (id: string, data: Record<string, unknown>) => ({
  _id: id,
  name: String(data.name ?? ""),
  email: typeof data.email === "string" ? data.email : undefined,
  phone: typeof data.phone === "string" ? data.phone : undefined,
  notes: typeof data.notes === "string" ? data.notes : undefined,
  createdAt: toIso(data.createdAt),
  updatedAt: toIso(data.updatedAt),
});

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const { id } = await context.params;
    const doc = await collectionRef.doc(id).get();
    if (!doc.exists) {
      return Response.json({ error: "Guest not found" }, { status: 404 });
    }
    return Response.json(serializeGuest(doc.id, doc.data() ?? {}));
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();

    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }

    const docRef = collectionRef.doc(id);
    const existing = await docRef.get();
    if (!existing.exists) {
      return Response.json({ error: "Guest not found" }, { status: 404 });
    }

    const update: Record<string, unknown> = {
      name,
      email: typeof body.email === "string" ? body.email.trim() || null : null,
      phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
      notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
      updatedAt: nowTimestamp(),
    };

    await docRef.update(update);
    const updated = await docRef.get();
    return Response.json(serializeGuest(updated.id, updated.data() ?? {}));
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const { id } = await context.params;
    const docRef = collectionRef.doc(id);
    const existing = await docRef.get();
    if (!existing.exists) {
      return Response.json({ error: "Guest not found" }, { status: 404 });
    }

    await docRef.delete();
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
