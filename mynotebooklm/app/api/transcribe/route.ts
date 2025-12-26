import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Get audio file from FormData
    const formData = await request.formData();
    const audioFile = formData.get("file") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    // console.log("Received audio file:", {
    //   name: audioFile.name,
    //   type: audioFile.type,
    //   size: audioFile.size,
    // });

    // Convert to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create File object for OpenAI
    const file = new File([buffer], "audio.webm", {
      type: audioFile.type,
    });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en",
      response_format: "json", // or 'text', 'srt', 'verbose_json', 'vtt'
    });

    // console.log("Transcription result:", transcription.text);

    return NextResponse.json({
      success: true,
      text: transcription.text,
    });
  } catch (error) {
    console.error("Transcription error:", error);

    return NextResponse.json(
      {
        error: "Transcription failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
