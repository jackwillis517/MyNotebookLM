"use server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { db } from "@/db";
import { files } from "@/db/schema";

export async function upload(formData: FormData) {
  const file = formData.get("file") as File;
  const threadId = formData.get("thread_id") as string;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    // Create uploads directory
    const uploadsDir = join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save to database
    const [doc] = await db
      .insert(files)
      .values({
        thread_id: threadId,
        title: file.name,
        size: file.size.toString(),
        type: file.type,
      })
      .returning();

    return {
      success: true,
      title: doc.title,
      createdAt: doc.createdAt,
    };
  } catch (error) {
    console.log("Upload error:", error);
    return { success: false, error: "Upload failed" };
  }
}
