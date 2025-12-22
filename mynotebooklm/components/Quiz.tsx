"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuizQuestion {
  question: string;
  answers: string[];
  answer: number;
}

interface QuizData {
  [key: string]: QuizQuestion;
}

interface QuizProps {
  quizData: QuizData;
}

export default function Quiz({ quizData }: QuizProps) {
  const questions = Object.values(quizData);
  const totalQuestions = questions.length;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number[]>(
    Array(totalQuestions).fill(5, -1),
  );
  const currentQuestion = questions[currentQuestionIndex];
  const answerLabels = ["A", "B", "C", "D"];

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-zinc-100 border-zinc-100 p-8">
      <div className="space-y-6">
        {/* Question Counter */}
        <div className="text-black text-sm">
          {currentQuestionIndex + 1} / {totalQuestions}
        </div>

        {/* Question */}
        <h2 className="text-xl font-medium text-black leading-relaxed">
          {currentQuestion.question}
        </h2>

        {/* Answers */}
        <div className="space-y-3">
          {currentQuestion.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedAnswer((prev) => {
                  const newAnswers = [...prev];
                  newAnswers[currentQuestionIndex] = index;
                  return newAnswers;
                });
              }}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                selectedAnswer[currentQuestionIndex] === index
                  ? selectedAnswer[currentQuestionIndex] ===
                    currentQuestion.answer
                    ? "bg-green-500 border-green-400"
                    : "bg-red-500 border-red-400"
                  : "bg-zinc-300 hover:bg-zinc-350"
              }`}
            >
              <span className="text-black">
                {answerLabels[index]}. {answer}
              </span>
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="bg-transparent border-zinc-700 text-black hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
