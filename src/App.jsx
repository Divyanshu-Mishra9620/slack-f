import React from "react";
import { Routes, Route } from "react-router-dom";
import MessageHistory from "./components/MessageHistory";
import AuthRedirect from "./components/AuthRedirect";
import Auth from "./components/Auth";

function App() {
  return (
    <div className="min-h-screen bg-[#fdf6ec]">
      <Routes>
        <Route
          path="/"
          element={
            <Auth>
              <MessageHistory />
            </Auth>
          }
        />
        <Route path="/auth-redirect" element={<AuthRedirect />} />
      </Routes>
    </div>
  );
}

export default App;
