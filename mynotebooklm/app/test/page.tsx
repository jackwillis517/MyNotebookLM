"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { hybridSearch, semanticSearch } from "@/actions/search";

export default function QueueTest() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<any[]>([]);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);

  // Submit query
  const handleTestQueue = async () => {
    const response = await fetch("http://localhost:8000/query/async", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "What is RAG?" }),
    });

    const data = await response.json();
    const taskId = data.task_id;

    // Connect to WebSocket to get result
    const ws = new WebSocket(`ws://localhost:8000/ws/${taskId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Status:", data.status);

      if (data.status === "completed") {
        console.log("Result:", data.result);
        ws.close();
      }
    };
  };

  const handleHybridSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await hybridSearch(searchQuery, 5);
      setSearchResults(results);
      // console.log("Hybrid Search Results:", results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;

    setIsSemanticSearching(true);
    try {
      const results = await semanticSearch(semanticQuery, 5);
      setSemanticResults(results);
      // console.log("Semantic Search Results:", results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSemanticSearching(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <Button onClick={handleTestQueue}>Test LightRAG</Button>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4">Hybrid Search Test</h2>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter search query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleHybridSearch()}
            className="flex-1"
          />
          <Button onClick={handleHybridSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Results ({searchResults.length}):</h3>
            {searchResults.map((result, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">
                  Score: {result.similarity.toFixed(4)} | File ID:{" "}
                  {result.file_id}
                </div>
                <p className="text-sm">{result.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4">Semantic Search Test</h2>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter search query..."
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
            className="flex-1"
          />
          <Button onClick={handleSemanticSearch} disabled={isSemanticSearching}>
            {isSemanticSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {semanticResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">
              Results ({semanticResults.length}):
            </h3>
            {semanticResults.map((result, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">
                  Score: {result.similarity.toFixed(4)} | File ID:{" "}
                  {result.file_id}
                </div>
                <p className="text-sm">{result.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
