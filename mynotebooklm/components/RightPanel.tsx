"use client";

import { FileQuestion, CreditCard, File, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useChatContext } from "@/contexts/ChatProvider";
import Quiz from "./Quiz";
import Flashcards from "./Flashcards";
import createQuiz from "../actions/quiz";

export default function RightPanel() {
  const { selectedThreadId } = useChatContext();
  const [isGenerating, setIsGenerating] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [report, setReport] = useState(null);

  const exampleQuiz = {
    "1": {
      question: "What is the capital of France?",
      answers: ["Paris", "Berlin", "Washington D.C", "Moscow"],
      answer: 0,
    },
    "2": {
      question: "What is the capital of Germany?",
      answers: ["Paris", "Berlin", "Washington D.C", "Moscow"],
      answer: 1,
    },
    "3": {
      question: "What is the capital of the United States?",
      answers: ["Berlin", "Paris", "Washington D.C", "Moscow"],
      answer: 2,
    },
    "4": {
      question: "What is the capital of Russia?",
      answers: ["Berlin", "Paris", "Washington D.C", "Moscow"],
      answer: 3,
    },
  };

  const exampleFlashcards = {
    "1": {
      question: "What is the capital of France?",
      answer: "Paris",
    },
    "2": {
      question: "What is the capital of Germany?",
      answer: "Berlin",
    },
    "3": {
      question: "What is the capital of the United States?",
      answer: "Washington D.C",
    },
    "4": {
      question: "What is the capital of Russia?",
      answer: "Moscow",
    },
  };

  const generationTools = [
    {
      id: 1,
      name: "Quiz",
      icon: FileQuestion,
      onclick: async () => {
        if (isGenerating === 0) {
          setIsGenerating(1);
          const quizQuestions = await createQuiz(selectedThreadId!);
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
            {quiz != null ? <Quiz quizData={quiz} /> : <></>}
            {/*<Quiz quizData={exampleQuiz} />*/}
            {/*<Flashcards flashcardData={exampleFlashcards} />*/}
          </div>
        </Card>
      </div>
    </div>
  );
}
