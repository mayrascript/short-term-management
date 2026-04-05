import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { nowTimestamp, slugify, toIso } from "@/lib/serverUtils";

const collectionRef = db.collection("expenseCategories");

export async function GET() {
  try {
    const snapshot = await collectionRef.orderBy("name", "asc").get();
    const categories = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        _id: doc.id,
        name: String(data.name ?? ""),
        slug: String(data.slug ?? ""),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    });
    return Response.json(categories);
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    if (!name) {
      return Response.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = slugify(name);
    if (!slug) {
      return Response.json({ error: "Invalid category name" }, { status: 400 });
    }

    const existing = await collectionRef.where("slug", "==", slug).limit(1).get();
    if (!existing.empty) {
      return Response.json({ error: "Category already exists" }, { status: 409 });
    }

    const ref = await collectionRef.add({
      name,
      slug,
      createdAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    });
    const created = await ref.get();
    const data = created.data() ?? {};
    return Response.json(
      {
        _id: created.id,
        name: String(data.name ?? ""),
        slug: String(data.slug ?? ""),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

