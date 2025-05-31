import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "./Spinner";

const AuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("auth_success") === "1") {
      navigate("/", { state: { authSuccess: true } });
    } else if (params.get("auth_error") === "1") {
      navigate("/", { state: { authError: true } });
    } else if (params.get("logout_success") === "1") {
      navigate("/", { state: { logoutSuccess: true } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <div className="min-h-screen bg-[#fdf6ec] flex items-center justify-center">
      <div className="text-center">
        <Spinner className="w-16 h-16 text-[#a67c52] mx-auto mb-4" />
        <p className="text-[#5d3a1a] text-lg">Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
