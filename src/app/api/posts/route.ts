import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { nowTimestamp, toIso, toTimestamp } from "@/lib/serverUtils";

const collectionRef = db.collection("posts");

export async function GET() {
  try {
    const snapshot = await collectionRef.orderBy("createdAt", "desc").get();
    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        _id: doc.id,
        idea: String(data.idea ?? ""),
        platform: String(data.platform ?? ""),
        status: String(data.status ?? "idea"),
        scheduledDate: toIso(data.scheduledDate),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    });
    return Response.json(posts);
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const idea = String(body.idea ?? "").trim();
    const platform = String(body.platform ?? "").trim();
    const status = String(body.status ?? "idea");
    const scheduledDate = toTimestamp(body.scheduledDate);

    if (!idea || !platform) {
      return Response.json({ error: "idea and platform are required" }, { status: 400 });
    }

    const ref = await collectionRef.add({
      idea,
      platform,
      status,
      scheduledDate: scheduledDate ?? null,
      createdAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    });
    const created = await ref.get();
    const data = created.data() ?? {};
    return Response.json(
      {
        _id: created.id,
        idea: String(data.idea ?? ""),
        platform: String(data.platform ?? ""),
        status: String(data.status ?? "idea"),
        scheduledDate: toIso(data.scheduledDate),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

