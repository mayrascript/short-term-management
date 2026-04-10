import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { nowTimestamp, toIso } from "@/lib/serverUtils";

const collectionRef = db.collection("guests");

const serializeGuest = (id: string, data: Record<string, unknown>) => ({
  _id: id,
  name: String(data.name ?? ""),
  email: typeof data.email === "string" ? data.email : undefined,
  phone: typeof data.phone === "string" ? data.phone : undefined,
  notes: typeof data.notes === "string" ? data.notes : undefined,
  createdAt: toIso(data.createdAt),
  updatedAt: toIso(data.updatedAt),
});

export async function GET() {
  try {
    const snapshot = await collectionRef.orderBy("name", "asc").get();
    const guests = snapshot.docs.map((doc) => serializeGuest(doc.id, doc.data()));
    return Response.json(guests);
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();

    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    const payload: Record<string, unknown> = {
      name,
      createdAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    if (notes) payload.notes = notes;

    const doc = await collectionRef.add(payload);
    const created = await doc.get();
    return Response.json(serializeGuest(created.id, created.data() ?? {}), { status: 201 });
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
