import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { nowTimestamp, toIso, toTimestamp } from "@/lib/serverUtils";

const collectionRef = db.collection("reservations");

export async function GET() {
  try {
    const snapshot = await collectionRef.orderBy("checkIn", "asc").get();
    const reservations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        _id: doc.id,
        guestName: String(data.guestName ?? ""),
        checkIn: toIso(data.checkIn),
        checkOut: toIso(data.checkOut),
        revenue: Number(data.revenue ?? 0),
        status: String(data.status ?? "upcoming"),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    });
    return Response.json(reservations);
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const guestName = String(body.guestName ?? "").trim();
    const checkIn = toTimestamp(body.checkIn);
    const checkOut = toTimestamp(body.checkOut);
    const revenue = Number(body.revenue);
    const status = String(body.status ?? "upcoming");

    if (!guestName || !checkIn || !checkOut || Number.isNaN(revenue)) {
      return Response.json({ error: "Missing required reservation fields" }, { status: 400 });
    }

    const doc = await collectionRef.add({
      guestName,
      checkIn,
      checkOut,
      revenue,
      status,
      createdAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    });
    const created = await doc.get();
    const data = created.data() ?? {};
    return Response.json(
      {
        _id: created.id,
        guestName: String(data.guestName ?? ""),
        checkIn: toIso(data.checkIn),
        checkOut: toIso(data.checkOut),
        revenue: Number(data.revenue ?? 0),
        status: String(data.status ?? "upcoming"),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

