import { put, del } from "@vercel/blob";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Upload a file to Vercel Blob
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const folder = (form.get("folder") as string) || "uploads";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Archivo muy grande (max 5MB)" }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imagenes" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${folder}/${session.username}-${Date.now()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url });
}

// Delete a file from Vercel Blob
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  await del(url);
  return NextResponse.json({ ok: true });
}
