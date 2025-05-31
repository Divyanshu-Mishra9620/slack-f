import React, { useState, useEffect } from "react";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Auth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${VITE_API_URL}/auth/status`, {
          withCredentials: true,
        });
        setIsAuthenticated(response.data.authenticated);
        setUserInfo(response.data.user);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    window.location.href = `${VITE_API_URL}/auth/slack`;
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${VITE_API_URL}/auth/logout`, {
        withCredentials: true,
      });
      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Checking authentication...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fdf6ec]">
      <div className="flex items-center justify-end p-4 bg-[#fdf6ec]">
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            {userInfo?.image && (
              <img
                src={userInfo.image}
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-[#a67c52]"
              />
            )}
            <span className="text-[#5d3a1a] font-medium">
              {userInfo?.name || "Slack User"}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#d8a76c] text-white rounded-lg hover:bg-[#c48c57] transition"
            >
              Logout
            </button>
          </div>
        ) : (
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
            <span>Login with Slack</span>
          </button>
        )}
      </div>

      {isAuthenticated ? (
        children
      ) : (
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-[#5d3a1a] mb-4">
            Slack Message Manager
          </h2>
          <p className="text-[#8c6239] mb-6">
            Please login with Slack to manage your messages
          </p>
        </div>
      )}
    </div>
  );
};

export default Auth;
