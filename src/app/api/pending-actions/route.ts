import { db } from "@/db";
import { places, placeRatings, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  // Get all users
  const allUsers = await db.select({ id: users.id }).from(users);
  const userIds = allUsers.map((u) => u.id);

  // Get all places
  const allPlaces = await db.select({ id: places.id }).from(places);

  // Get all ratings grouped by user
  const allRatings = await db
    .select({ placeId: placeRatings.placeId, userId: placeRatings.userId })
    .from(placeRatings);

  // For the current user, count places they haven't rated
  const myRatedPlaceIds = new Set(
    allRatings.filter((r) => r.userId === session.userId).map((r) => r.placeId)
  );
  const myUnrated = allPlaces.filter((p) => !myRatedPlaceIds.has(p.id)).length;

  // Total unrated across all users (for the app badge)
  let totalUnrated = 0;
  for (const uid of userIds) {
    const ratedIds = new Set(
      allRatings.filter((r) => r.userId === uid).map((r) => r.placeId)
    );
    totalUnrated += allPlaces.filter((p) => !ratedIds.has(p.id)).length;
  }

  return NextResponse.json({
    places: myUnrated,
  });
}
