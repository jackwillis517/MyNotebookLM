"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FlashcardItem {
  question: string;
  answer: string;
}

interface FlashcardData {
  [key: string]: FlashcardItem;
}

interface FlashcardProps {
  flashcardData: FlashcardData;
}

export default function Flashcard({ flashcardData }: FlashcardProps) {
  const cards = Object.values(flashcardData);
  const totalCards = cards.length;
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const currentCard = cards[currentCardIndex];

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-zinc-100 border-zinc-100 p-8">
      <div className="space-y-6">
        {/* Card Counter */}
        <div className="text-black text-sm">
          {currentCardIndex + 1} / {totalCards}
        </div>

        {/* Flashcard with Flip Button */}
        <div className="min-h-[300px] flex items-center justify-center">
          <button
            onClick={handleFlip}
            className="w-full h-full min-h-[300px] p-8 rounded-lg bg-zinc-300 hover:bg-zinc-350  transition-all duration-300 flex items-center justify-center text-center"
          >
            <div className="space-y-4">
              <div className="text-black text-sm uppercase tracking-wide">
                {isFlipped ? "Answer" : "Question"}
              </div>
              <p className="text-xl font-medium text-black leading-relaxed">
                {isFlipped ? currentCard.answer : currentCard.question}
              </p>
              <div className="text-sm text-zinc-500 mt-6">Click to flip</div>
            </div>
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            variant="outline"
            className="bg-transparent border-zinc-700 text-black hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentCardIndex === totalCards - 1}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
