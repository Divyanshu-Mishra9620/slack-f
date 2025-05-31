import React, { useState } from "react";
import axios from "axios";
import MessageForm from "./MessageForm";
import Auth from "./Auth";
import { Spinner } from "./Spinner";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const MessageHistory = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loadingGet, setLoadingGet] = useState(false);

  const handleGetMessages = async (data) => {
    setError("");
    setMessages([]);
    setLoadingGet(true);

    try {
      const response = await axios.get(`${VITE_API_URL}/api/messages`, {
        params: {
          channel: data.channel,
          ts: data.ts,
          oldest: data.oldest,
          latest: data.latest,
        },
      });
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching messages");
    } finally {
      setLoadingGet(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const formatTimestamp = (ts) => {
    return new Date(parseFloat(ts) * 1000).toLocaleString();
  };

  return (
    <Auth>
      <div className="min-h-screen bg-[#fdf6ec] py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-3xl font-bold text-center text-[#5d3a1a]">
            Slack Message Operations
          </h2>

          {success && (
            <div className="p-4 bg-green-100 text-green-800 border border-green-400 rounded-md shadow">
              {success}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-100 text-red-800 border border-red-400 rounded-md shadow">
              {error}
            </div>
          )}

          {/* Send / Schedule Section */}
          <section className="bg-[#f3e2d2] border-2 border-[#a67c52] rounded-xl shadow-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-[#5d3a1a] mb-2">
              Send / Schedule Message
            </h3>
            <MessageForm
              action="send"
              onSubmit={async (data) => {
                setError("");
                try {
                  await axios.post(`${VITE_API_URL}/api/messages`, {
                    channel: data.channel,
                    text: data.text,
                    postAt: data.postAt,
                  });
                  if (data.postAt) {
                    showSuccess(
                      `Message scheduled for ${new Date(
                        data.postAt * 1000
                      ).toLocaleString()}!`
                    );
                  } else {
                    showSuccess("Message sent successfully!");
                  }
                } catch (err) {
                  setError(
                    err.response?.data?.error || "Error sending message"
                  );
                }
              }}
            />
          </section>

          {/* Retrieve Section */}
          <section className="bg-[#f3e2d2] border-2 border-[#a67c52] rounded-xl shadow-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-[#5d3a1a] mb-2">
              Retrieve Messages
            </h3>
            <MessageForm action="get" onSubmit={handleGetMessages} />

            {/* Show loading spinner while retrieving */}
            {loadingGet && (
              <div className="flex justify-center mt-4">
                <Spinner className="w-8 h-8 text-[#a67c52]" />
              </div>
            )}

            {/* Display messages once loaded */}
            {messages.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-lg font-medium text-[#5d3a1a]">
                  Retrieved Messages ({messages.length})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2 p-2 bg-white border border-[#a67c52] rounded-lg shadow-inner">
                  {messages.map((msg) => (
                    <div
                      key={msg.ts}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-3 bg-[#fbe7c6] border border-[#a67c52] rounded-lg cursor-pointer hover:bg-[#f3d8b0] transition ${
                        selectedMessage?.ts === msg.ts
                          ? "ring-2 ring-[#d8a76c]"
                          : ""
                      }`}
                    >
                      <p className="text-[#5d3a1a]">
                        <span className="font-medium">Text:</span> {msg.text}
                      </p>
                      <p className="text-sm text-[#8c6239] mt-1">
                        <span className="font-medium">Timestamp:</span> {msg.ts}{" "}
                        ({formatTimestamp(msg.ts)})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Edit Section */}
          <section className="bg-[#f3e2d2] border-2 border-[#a67c52] rounded-xl shadow-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-[#5d3a1a] mb-2">
              Edit Message
            </h3>
            <MessageForm
              action="edit"
              initialData={selectedMessage || {}}
              onSubmit={async (data) => {
                setError("");
                try {
                  await axios.put(`${VITE_API_URL}/api/messages`, {
                    channel: data.channel,
                    ts: data.ts,
                    text: data.text,
                  });
                  showSuccess("Message updated successfully!");
                  // Clear selection and results
                  setMessages([]);
                  setSelectedMessage(null);
                } catch (err) {
                  setError(
                    err.response?.data?.error || "Error editing message"
                  );
                }
              }}
            />
          </section>

          {/* Delete Section */}
          <section className="bg-[#f3e2d2] border-2 border-[#a67c52] rounded-xl shadow-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-[#5d3a1a] mb-2">
              Delete Message
            </h3>
            <MessageForm
              action="delete"
              initialData={selectedMessage || {}}
              onSubmit={async (data) => {
                setError("");
                try {
                  await axios.delete(`${VITE_API_URL}/api/messages`, {
                    data: { channel: data.channel, ts: data.ts },
                  });
                  showSuccess("Message deleted successfully!");
                  // Filter out deleted message from local state
                  setMessages((msgs) =>
                    msgs.filter((msg) => msg.ts !== data.ts)
                  );
                  setSelectedMessage(null);
                } catch (err) {
                  setError(
                    err.response?.data?.error || "Error deleting message"
                  );
                }
              }}
            />
          </section>
        </div>
      </div>
    </Auth>
  );
};

export default MessageHistory;
