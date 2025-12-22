"use client";

import { useState } from "react";
import { useChatContext } from "@/contexts/ChatProvider";
import Quiz from "./Quiz";
import Flashcard from "./Flashcards";
import PdfDownloadButton from "./PdfDownloadButton";
import createQuiz from "../actions/quiz";
import createFlashcards from "../actions/flashcard";
import createReport from "../actions/report";
import { FileQuestion, CreditCard, File, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RightPanel() {
  const { selectedThreadId } = useChatContext();
  const [isGenerating, setIsGenerating] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [report, setReport] = useState("");

  const generationTools = [
    {
      id: 1,
      name: "Quiz",
      icon: FileQuestion,
      onclick: async () => {
        if (isGenerating === 0) {
          setIsGenerating(1);
          const quizQuestions = await createQuiz(selectedThreadId!);
          setFlashcards(null);
          setReport("");
          setQuiz(quizQuestions.quiz);
          setIsGenerating(0);
        }
      },
      description: "Create quiz questions from your documents",
    },
    {
      id: 2,
      name: "Flashcards",
      icon: CreditCard,
      onclick: async () => {
        if (isGenerating === 0) {
          setIsGenerating(2);
          const flashcardQuestions = await createFlashcards(selectedThreadId!);
          setQuiz(null);
          setReport("");
          setFlashcards(flashcardQuestions.flashcards);
          setIsGenerating(0);
        }
      },
      description: "Generate study flashcards",
    },
    {
      id: 3,
      name: "Report",
      icon: File,
      onclick: async () => {
        if (isGenerating === 0) {
          setIsGenerating(3);
          const reportContent = await createReport(selectedThreadId!);
          setQuiz(null);
          setFlashcards(null);
          setReport(reportContent);
          setIsGenerating(0);
        }
      },
      description: "Create a downloadable summary",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-panel-background rounded-lg border border-panel-border p-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Generate</h2>

      <div className="space-y-3 mb-6">
        {generationTools.map((tool) => {
          let Icon = tool.icon;
          if (isGenerating === tool.id) {
            Icon = LoaderCircle;
          }
          return (
            <Button
              key={tool.id}
              variant="outline"
              onClick={tool.onclick}
              className="w-full justify-start h-auto p-4 border-border hover:bg-secondary/50 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start gap-3 text-left">
                {isGenerating === tool.id ? (
                  <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                )}
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
          <div className="text-sm text-muted-foreground text-center">
            {quiz != null ? (
              <Quiz quizData={quiz} />
            ) : flashcards != null ? (
              <Flashcard flashcardData={flashcards} />
            ) : report != "" ? (
              <div className="space-y-4">
                <div className="text-left">
                  <p className="text-sm text-foreground mb-2">
                    Executive report generated successfully!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click the button below to download your report as a PDF.
                  </p>
                </div>
                <PdfDownloadButton reportContent={report} />
              </div>
            ) : (
              <></>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
