import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userInfo: null,
    loading: true,
    error: null,
    authChecked: false,
  });
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      const hasAuthCookie = document.cookie.includes("slack_auth_visible");
      console.log("Has auth cookie:", hasAuthCookie);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/status`,
        {
          withCredentials: true,
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (response.data.authenticated) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          userInfo: response.data.user,
          loading: false,
          authChecked: true,
        }));
        return true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const retryResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/status`,
          { withCredentials: true }
        );

        const isAuthed = retryResponse.data.authenticated;
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: isAuthed,
          userInfo: retryResponse.data.user,
          loading: false,
          authChecked: true,
        }));
        return isAuthed;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        loading: false,
        error: "Failed to check authentication status",
        authChecked: true,
      }));
      return false;
    }
  };

  useEffect(() => {
    const handleAuthFlow = async () => {
      const params = new URLSearchParams(window.location.search);

      if (params.has("auth_success")) {
        try {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
          window.history.replaceState({}, "", window.location.pathname);

          const isAuthed = await checkAuthStatus();

          if (!isAuthed) {
            navigate("/?auth_error=1");
          }
        } catch (error) {
          console.error("Auth flow error:", error);
          navigate("/?auth_error=1");
        }
      } else if (params.has("auth_error")) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: "Authentication failed. Please try again.",
          authChecked: true,
        }));
        window.history.replaceState({}, "", window.location.pathname);
      } else {
        await checkAuthStatus();
      }
    };

    handleAuthFlow();
  }, [navigate]);

  const handleLogin = () => {
    setAuthState((prev) => ({ ...prev, error: null }));

    const authUrl = `${
      import.meta.env.VITE_API_URL
    }/auth/slack/callback?ts=${Date.now()}`;
    window.location.href = authUrl;
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        withCredentials: true,
      });
      setAuthState({
        isAuthenticated: false,
        userInfo: null,
        loading: false,
        error: null,
        authChecked: true,
      });
      navigate("/?logout_success=1");
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to logout. Please try again.",
      }));
    }
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-[#fdf6ec] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a67c52] mx-auto mb-4"></div>
          <p className="text-[#5d3a1a]">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6ec]">
      <div className="flex items-center justify-between p-4 bg-[#f3e2d2] border-b border-[#a67c52]">
        <div className="text-lg font-semibold text-[#5d3a1a]">
          Slack Message Manager
        </div>

        {authState.isAuthenticated ? (
          <div className="flex items-center space-x-4">
            {authState.userInfo?.image && (
              <img
                src={authState.userInfo.image}
                alt="User"
                className="w-8 h-8 rounded-full border border-[#a67c52]"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/32";
                }}
              />
            )}
            <span className="text-sm text-[#5d3a1a]">
              {authState.userInfo?.name || "Slack User"}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-[#d8a76c] text-white rounded-md hover:bg-[#c48c57] transition text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center space-x-2 px-3 py-1 bg-[#4A154B] text-white rounded-md hover:bg-[#3c0e3d] transition text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-current"
            >
              <path d="M6 15a2 2 0 1 1-2-2c0 1.103.897 2 2 2zm0-2zm.459-3h3.082c.402 0 .77-.238.928-.616L11.728 6h2.544l1.259 3.384c.158.378.526.616.928.616h3.082l-1.29 3.324c-.147.379-.515.616-.928.616H16.46l-.728 2H9.268l-.728-2H6.677c-.413 0-.781-.237-.928-.616L4.459 10zm5.551-2l-.8-2H8.79l-.8 2h3.02z" />
            </svg>
            <span>Login with Slack</span>
          </button>
        )}
      </div>

      <div className="p-4">
        {authState.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
            {authState.error}
          </div>
        )}

        {authState.isAuthenticated ? (
          children
        ) : (
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-[#a67c52]">
            <h2 className="text-xl font-bold text-[#5d3a1a] mb-4 text-center">
              Welcome to Slack Message Manager
            </h2>
            <p className="text-[#8c6239] mb-6 text-center">
              Please authenticate with Slack to manage your messages
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-4 py-2 bg-[#4A154B] text-white rounded-lg hover:bg-[#3c0e3d] transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M6 15a2 2 0 1 1-2-2c0 1.103.897 2 2 2zm0-2zm.459-3h3.082c.402 0 .77-.238.928-.616L11.728 6h2.544l1.259 3.384c.158.378.526.616.928.616h3.082l-1.29 3.324c-.147.379-.515.616-.928.616H16.46l-.728 2H9.268l-.728-2H6.677c-.413 0-.781-.237-.928-.616L4.459 10zm5.551-2l-.8-2H8.79l-.8 2h3.02z" />
                </svg>
                <span>Continue with Slack</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
