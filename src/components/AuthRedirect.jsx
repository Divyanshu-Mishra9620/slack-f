import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorReason = params.get("reason");

    if (params.get("auth_success") === "1") {
      navigate("/", {
        state: {
          authSuccess: true,
          timestamp: Date.now(),
        },
      });
    } else if (params.get("auth_error") === "1") {
      navigate("/", {
        state: {
          authError: true,
          reason: errorReason || "unknown_error",
        },
      });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#fdf6ec] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a67c52] mx-auto mb-4"></div>
        <p className="text-[#5d3a1a]">Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
