import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LeftPanel = () => {
  const documents = [
    { id: 1, name: "Research Paper.pdf", size: "2.4 MB" },
    { id: 2, name: "Meeting Notes.docx", size: "156 KB" },
    { id: 3, name: "Project Brief.pdf", size: "1.8 MB" },
  ];

  return (
    <div className="h-full flex flex-col bg-panel-background rounded-lg border border-panel-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Documents</h2>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="p-3 bg-secondary/50 border-border hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {doc.name}
                </p>
                <p className="text-xs text-muted-foreground">{doc.size}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button className="w-full mt-4" variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Upload Document
      </Button>
    </div>
  );
};

export default LeftPanel;
