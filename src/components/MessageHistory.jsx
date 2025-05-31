import React, { useState } from "react";
import axios from "axios";
import MessageForm from "./MessageForm";
import Auth from "./Auth";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const MessageHistory = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleGetMessages = async (data) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/messages`, {
        params: {
          channel: data.channel,
          ts: data.ts,
          oldest: data.oldest,
          latest: data.latest,
        },
      });
      setMessages(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching messages");
      setMessages([]);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const formatTimestamp = (ts) => {
    return new Date(parseFloat(ts) * 1000).toLocaleString();
  };

  return (
    <Auth>
      <div className="min-h-screen bg-[#fdf6ec] py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-3xl font-bold text-center text-[#5d3a1a] mb-6">
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

          <section className="p-6 bg-[#f3e2d2] border-4 border-[#a67c52] rounded-xl shadow">
            <h3 className="text-xl font-semibold text-[#5d3a1a] mb-4">
              Send / Schedule Message
            </h3>
            <MessageForm
              action="send"
              onSubmit={async (data) => {
                try {
                  await axios.post(`${VITE_API_URL}/api/messages`, {
                    channel: data.channel,
                    text: data.text,
                    postAt: data.postAt,
                  });
                  showSuccess(
                    data.postAt
                      ? `Message scheduled for ${new Date(
                          data.postAt * 1000
                        ).toLocaleString()}!`
                      : "Message sent successfully!"
                  );
                } catch (err) {
                  setError(
                    err.response?.data?.error || "Error sending message"
                  );
                }
              }}
            />
          </section>

          <section className="p-6 bg-[#f3e2d2] border-4 border-[#a67c52] rounded-xl shadow">
            <h3 className="text-xl font-semibold text-[#5d3a1a] mb-4">
              Retrieve Messages
            </h3>
            <MessageForm action="get" onSubmit={handleGetMessages} />

            {messages.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-medium text-[#5d3a1a]">
                  Retrieved Messages ({messages.length})
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.ts}
                      className={`p-3 bg-[#fbe7c6] border border-[#a67c52] rounded-lg cursor-pointer hover:bg-[#f3d8b0] ${
                        selectedMessage?.ts === msg.ts
                          ? "ring-2 ring-[#d8a76c]"
                          : ""
                      }`}
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <p className="text-[#5d3a1a]">
                        <strong>Text:</strong> {msg.text}
                      </p>
                      <p className="text-sm text-[#8c6239]">
                        <strong>Timestamp:</strong> {msg.ts} (
                        {formatTimestamp(msg.ts)})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="p-6 bg-[#f3e2d2] border-4 border-[#a67c52] rounded-xl shadow">
            <h3 className="text-xl font-semibold text-[#5d3a1a] mb-4">
              Edit Message
            </h3>
            <MessageForm
              action="edit"
              initialData={selectedMessage}
              onSubmit={async (data) => {
                try {
                  await axios.put(`${VITE_API_URL}/api/messages`, {
                    channel: data.channel,
                    ts: data.ts,
                    text: data.text,
                  });
                  showSuccess("Message updated successfully!");
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

          <section className="p-6 bg-[#f3e2d2] border-4 border-[#a67c52] rounded-xl shadow">
            <h3 className="text-xl font-semibold text-[#5d3a1a] mb-4">
              Delete Message
            </h3>
            <MessageForm
              action="delete"
              initialData={selectedMessage}
              onSubmit={async (data) => {
                try {
                  await axios.delete(`${VITE_API_URL}/api/messages`, {
                    data: { channel: data.channel, ts: data.ts },
                  });
                  showSuccess("Message deleted successfully!");
                  setMessages(messages.filter((msg) => msg.ts !== data.ts));
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
