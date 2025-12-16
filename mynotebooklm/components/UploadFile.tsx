"use client";
import { useState } from "react";
import { upload } from "@/actions/upload";
import { embed } from "@/actions/embed";
import { semanticSearch } from "@/actions/search";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UploadFile() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("No file selected");
  const [input, setInput] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "No file selected");
  };

  const handleSemanticSearch = async () => {
    const result = await semanticSearch(input);
    console.log(result);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("thread_id", "09e1ea79-36f0-4671-abbc-9913db9722ae");

    console.log(Object.fromEntries(formData));

    setUploading(true);
    setMessage("Uploading...");

    const result = await upload(formData);

    if (result.success) {
      setMessage(`Embedding ${result.title}...`);

      const embeddingFormData = new FormData();
      const filepath = "./uploads/" + fileName;
      embeddingFormData.append("filepath", filepath);
      embeddingFormData.append("file_id", result.file_id!);
      embeddingFormData.append("type", result.type!);

      const embeddingResult = await embed(embeddingFormData);

      if (embeddingResult.success) {
        setMessage(`Uploaded ${result.title} successfully`);
      } else {
        console.log(embeddingResult.error);
        setMessage(`✗ Error: ${embeddingResult.error}`);
      }

      form.reset();
      setFileName("No file selected");
    } else {
      console.log(result.error);
      setMessage(`✗ Error: ${result.error}`);
    }

    setUploading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="mb-5 mt-5">
            <input
              type="file"
              id="file"
              name="file"
              accept=".pdf,.txt,.md,.doc,.docx,.csv"
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />

            <label
              htmlFor="file"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Choose File
            </label>

            <span className="ml-3 text-sm text-gray-600">{fileName}</span>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {message && <p className="text-sm">{message}</p>}
      </form>

      <div className="p-4 border-t border-panel-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSemanticSearch()}
            placeholder="Semantic Search Query"
            className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={() => {
              handleSemanticSearch();
            }}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
