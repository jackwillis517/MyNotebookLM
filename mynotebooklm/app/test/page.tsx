"use client";

import { Button } from "@/components/ui/button";

export default function QueueTest() {
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

  return (
    <div>
      <h1>Test Page</h1>
      <Button onClick={handleTestQueue}>Test Queue</Button>
    </div>
  );
}
