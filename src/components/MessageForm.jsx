import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MessageForm = ({ action, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    channel: initialData?.channel || "",
    text: initialData?.text || "",
    ts: initialData?.ts || "",
    postAt: initialData?.postAt ? new Date(initialData?.postAt * 1000) : null,
    oldest: null,
    latest: null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData((prev) => {
      const newFormData = {
        channel: initialData?.channel || "",
        text: initialData?.text || "",
        ts: initialData?.ts || "",
        postAt: initialData?.postAt
          ? new Date(initialData?.postAt * 1000)
          : null,
        oldest: null,
        latest: null,
      };

      const prevData = {
        channel: prev?.channel,
        text: prev?.text,
        ts: prev?.ts,
        postAt: prev?.postAt,
      };

      if (JSON.stringify(prevData) !== JSON.stringify(newFormData)) {
        return newFormData;
      }

      return prev;
    });
  }, [JSON.stringify(initialData)]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
    setError("");
  };

  const validateForm = () => {
    if (action === "send" && formData.postAt) {
      const now = new Date();
      if (formData.postAt <= now) {
        setError("Scheduled time must be in the future");
        return false;
      }
    }

    if (["get", "edit", "delete"].includes(action)) {
      if (!formData.channel) {
        setError("Channel is required");
        return false;
      }

      if (action === "get") {
        if (!formData.oldest && !formData.latest && !formData.ts) {
          setError("Please provide at least one timestamp or time range");
          return false;
        }
      } else {
        if (!formData.ts) {
          setError("Message timestamp is required");
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      const payload = {
        channel: formData.channel,
        text: formData.text,
      };

      if (action === "send") {
        payload.postAt = formData.postAt
          ? Math.floor(formData.postAt.getTime() / 1000)
          : null;
      } else {
        if (formData.ts) {
          payload.ts = formData.ts;
        }
        if (formData.oldest) {
          payload.oldest = Math.floor(formData.oldest.getTime() / 1000);
        }
        if (formData.latest) {
          payload.latest = Math.floor(formData.latest.getTime() / 1000);
        }
      }

      console.log("Submitting payload:", payload);
      await onSubmit(payload);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        error?.message ||
        "Failed to process request";
      setError(errorMsg);
      console.error("Submission error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-[#f3e2d2] border-4 border-[#a67c52] rounded-xl shadow-lg space-y-4"
    >
      <h2 className="text-center text-2xl font-semibold text-[#5d3a1a]">
        {action === "send"
          ? "Send Message"
          : action === "edit"
          ? "Edit Message"
          : action === "delete"
          ? "Delete Message"
          : "Retrieve Messages"}
      </h2>

      {error && (
        <div className="p-2 bg-red-100 text-red-800 rounded-md">{error}</div>
      )}

      <div>
        <label className="block text-[#5d3a1a] mb-1">Channel ID</label>
        <input
          type="text"
          name="channel"
          placeholder="e.g. C12345 or #general"
          value={formData.channel}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border-2 border-[#a67c52] rounded-lg bg-[#fbe7c6] text-[#5d3a1a] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
        />
      </div>

      {action !== "delete" && action !== "get" && (
        <div>
          <label className="block text-[#5d3a1a] mb-1">
            {action === "get" ? "Message Filter" : "Message Text"}
          </label>
          <textarea
            name="text"
            placeholder="Your message here"
            value={formData.text}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-[#a67c52] rounded-lg bg-[#fbe7c6] text-[#5d3a1a] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
            rows={4}
          />
        </div>
      )}

      {action === "send" && (
        <div>
          <label className="block text-[#5d3a1a] mb-1">Schedule Message</label>
          <DatePicker
            selected={formData.postAt}
            onChange={(date) => handleDateChange(date, "postAt")}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            minDate={new Date()}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select date/time (optional)"
            className="w-full px-4 py-2 border-2 border-[#a67c52] rounded-lg bg-[#fbe7c6] text-[#5d3a1a] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
            isClearable
          />
          <p className="text-sm text-[#8c6239] mt-1">
            Leave blank to send immediately
          </p>
        </div>
      )}

      {["edit", "delete"].includes(action) && (
        <div>
          <label className="block text-[#5d3a1a] mb-1">Message Timestamp</label>
          <input
            type="text"
            name="ts"
            placeholder="e.g. 1625153956.000200"
            value={formData.ts}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-[#a67c52] rounded-lg bg-[#fbe7c6] text-[#5d3a1a] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
          />
        </div>
      )}

      {action === "get" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5d3a1a] mb-1">Start Time</label>
              <DatePicker
                selected={formData.oldest}
                onChange={(date) => handleDateChange(date, "oldest")}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select start time"
                className="w-full px-4 py-2 border-2 border-[#a67c52] rounded-lg bg-[#fbe7c6] text-[#5d3a1a] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                isClearable
              />
            </div>
            <div>
              <label className="block text-[#5d3a1a] mb-1">End Time</label>
              <DatePicker
                selected={formData.latest}
                onChange={(date) => handleDateChange(date, "latest")}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select end time"
                className="w-full px-4 py-2 border-2 border-[#a67c52] rounded-lg bg-[#fbe7c6] text-[#5d3a1a] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                isClearable
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-[#5d3a1a] mb-1">
              OR Specific Timestamp
            </label>
            <input
              type="text"
              name="ts"
              placeholder="e.g. 1625153956.000200"
              value={formData.ts}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-[#a67c52] rounded-lg bg-[#fbe7c6] text-[#5d3a1a] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full py-2 bg-[#d8a76c] text-white font-semibold rounded-lg shadow-md hover:bg-[#c48c57] active:translate-y-[2px] active:shadow-sm transition-all duration-150"
      >
        {action === "send"
          ? "Send Message"
          : action === "edit"
          ? "Update Message"
          : action === "delete"
          ? "Delete Message"
          : "Retrieve Messages"}
      </button>
    </form>
  );
};

export default MessageForm;
