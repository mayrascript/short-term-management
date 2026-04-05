import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { nowTimestamp, toIso } from "@/lib/serverUtils";

const collectionRef = db.collection("tasks");

export async function GET() {
  try {
    const snapshot = await collectionRef.orderBy("createdAt", "desc").get();
    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        _id: doc.id,
        title: String(data.title ?? ""),
        description: typeof data.description === "string" ? data.description : undefined,
        category: String(data.category ?? "maintenance"),
        status: String(data.status ?? "pending"),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    });
    return Response.json(tasks);
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "maintenance");
    const description = typeof body.description === "string" ? body.description.trim() : undefined;
    const status = String(body.status ?? "pending");

    if (!title || !category) {
      return Response.json({ error: "title and category are required" }, { status: 400 });
    }

    const ref = await collectionRef.add({
      title,
      category,
      description: description || null,
      status,
      createdAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    });
    const created = await ref.get();
    const data = created.data() ?? {};
    return Response.json(
      {
        _id: created.id,
        title: String(data.title ?? ""),
        description: typeof data.description === "string" ? data.description : undefined,
        category: String(data.category ?? "maintenance"),
        status: String(data.status ?? "pending"),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

