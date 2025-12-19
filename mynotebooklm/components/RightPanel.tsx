"use client";

import { FileQuestion, CreditCard, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useChatContext } from "@/contexts/ChatProvider";
import createQuiz from "../actions/quiz";

export default function RightPanel() {
  const { selectedThreadId } = useChatContext();

  const generationTools = [
    {
      id: 1,
      name: "Quiz",
      icon: FileQuestion,
      onclick: async () => {
        await createQuiz(selectedThreadId!);
      },
      description: "Create quiz questions from your documents",
    },
    {
      id: 2,
      name: "Flashcards",
      icon: CreditCard,
      onclick: async () => {
        console.log("Flashcards clicked");
      },
      description: "Generate study flashcards",
    },
    {
      id: 3,
      name: "Report",
      icon: File,
      onclick: async () => {
        console.log("Report clicked");
      },
      description: "Create a concise text summary",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-panel-background rounded-lg border border-panel-border p-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Generate</h2>

      <div className="space-y-3 mb-6">
        {generationTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.id}
              variant="outline"
              onClick={tool.onclick}
              className="w-full justify-start h-auto p-4 border-border hover:bg-secondary/50 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start gap-3 text-left">
                <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {tool.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="flex-1 border-t border-panel-border pt-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Results</h3>
        <Card className="p-4 bg-secondary/30 border-border h-full">
          <p className="text-sm text-muted-foreground text-center">
            Select a generation tool above to see results here
          </p>
        </Card>
      </div>
    </div>
  );
}
