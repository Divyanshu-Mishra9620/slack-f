import React from "react";
import MessageHistory from "./components/MessageHistory";

function App() {
  return (
    <div className="min-h-screen bg-[#fdf6ec] text-[#5d3a1a] font-sans">
      <header className="bg-[#d2b48c] border-b-4 border-[#a67c52] shadow-md p-6 text-center">
        <h1 className="text-4xl font-bold mb-2">Slack Messaging Dashboard</h1>
        <p className="text-md italic">Using Developer Sandbox Environment</p>
      </header>

      <main className="px-4 py-10">
        <MessageHistory />
      </main>
    </div>
  );
}

export default App;
