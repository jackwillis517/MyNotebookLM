"use client";

import { useEffect, useState } from "react";
import { upload } from "@/actions/upload";
import { embed } from "@/actions/embed";
import { readAllFiles } from "@/actions/db";
import { files } from "@/db/schema";
import { formatBytes } from "@/lib/utils";
import { FileText, Upload, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useChatContext } from "@/contexts/ChatProvider";

export default function LeftPanel() {
  const { selectedThreadId } = useChatContext();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileList, setFileList] = useState<(typeof files.$inferSelect)[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!selectedThreadId) return;
      const files = await readAllFiles(selectedThreadId);
      setFileList(files);
    };
    fetchFiles();
  }, [refresh, selectedThreadId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      e.currentTarget.form?.requestSubmit();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedThreadId) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const uploadedFile = formData.get("file") as File;
    formData.append("thread_id", selectedThreadId);

    setUploading(true);
    setMessage("Uploading...");

    const result = await upload(formData);

    if (result.success) {
      setMessage(`Embedding ${result.title}...`);

      const embeddingFormData = new FormData();
      const filepath = "./uploads/" + uploadedFile.name;
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
    } else {
      console.log(result.error);
      setMessage(`✗ Error: ${result.error}`);
    }

    setRefresh((prev) => prev + 1);
    setUploading(false);
  };

  return (
    <div className="h-full flex flex-col bg-panel-background rounded-lg border border-panel-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Documents</h2>
        {/*<Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <Upload className="h-4 w-4" />
        </Button>*/}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {fileList.map((file) => (
          <Card
            key={file.id}
            className="p-3 bg-secondary/50 border-border hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <form onSubmit={handleSubmit} className="text-center">
          <input
            type="file"
            name="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.txt,.md,.doc,.docx,.csv"
            disabled={uploading}
          />

          <Button asChild variant="outline" type="button" disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              {uploading ? (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? "Uploading..." : "Upload Document"}
            </label>
          </Button>
        </form>
      </div>
    </div>
  );
}
