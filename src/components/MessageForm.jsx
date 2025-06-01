import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Spinner } from "./Spinner";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData((prev) => {
      const newForm = {
        channel: initialData?.channel || "",
        text: initialData?.text || "",
        ts: initialData?.ts || "",
        postAt: initialData?.postAt
          ? new Date(initialData?.postAt * 1000)
          : null,
        oldest: null,
        latest: null,
      };
      const prevCore = {
        channel: prev.channel,
        text: prev.text,
        ts: prev.ts,
        postAt: prev.postAt,
      };
      if (JSON.stringify(prevCore) !== JSON.stringify(newForm)) {
        return newForm;
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

    setLoading(true);
    try {
      const payload = {
        channel: formData.channel.trim(),
        text: formData.text.trim(),
      };

      if (action === "send") {
        payload.postAt = formData.postAt
          ? Math.floor(formData.postAt.getTime() / 1000)
          : null;
      } else {
        if (formData.ts) payload.ts = formData.ts.trim();
        if (formData.oldest)
          payload.oldest = Math.floor(formData.oldest.getTime() / 1000);
        if (formData.latest)
          payload.latest = Math.floor(formData.latest.getTime() / 1000);
      }

      await onSubmit(payload);
    } catch (err) {
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.details ||
        err?.message ||
        "Failed to process request";
      setError(errMsg);
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border-2 border-[#a67c52] rounded-lg bg-[#fbe7c6] text-[#5d3a1a] focus:outline-none focus:ring-2 focus:ring-[#8c6239] transition";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-[#a67c52] space-y-4"
    >
      <h2 className="text-center text-2xl font-semibold text-[#5d3a1a]">
        {action === "send"
          ? "Send / Schedule Message"
          : action === "edit"
          ? "Edit Message"
          : action === "delete"
          ? "Delete Message"
          : "Retrieve Messages"}
      </h2>

      {error && (
        <div className="p-2 bg-red-100 text-red-800 rounded-md text-center">
          {error}
        </div>
      )}

      <div>
        <label className="block text-[#5d3a1a] mb-1 font-medium">
          Channel ID
        </label>
        <input
          type="text"
          name="channel"
          placeholder="e.g. C12345 or #general"
          value={formData.channel}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {action !== "delete" && (
        <div>
          <label className="block text-[#5d3a1a] mb-1 font-medium">
            {action === "get"
              ? "Message Filter (Text contains)"
              : "Message Text"}
          </label>
          <textarea
            name="text"
            placeholder={
              action === "get" ? "Filter substring" : "Your message here"
            }
            value={formData.text}
            onChange={handleChange}
            rows={action === "get" ? 2 : 4}
            className={inputClass}
          />
        </div>
      )}

      {action === "send" && (
        <div>
          <label className="block text-[#5d3a1a] mb-1 font-medium">
            Schedule Message
          </label>
          <DatePicker
            selected={formData.postAt}
            onChange={(date) => handleDateChange(date, "postAt")}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={1}
            minDate={new Date()}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select date/time (optional)"
            className={`${inputClass}`}
            isClearable
          />
          <p className="text-sm text-[#8c6239] mt-1">
            Leave blank to send immediately
          </p>
        </div>
      )}

      {["edit", "delete"].includes(action) && (
        <div>
          <label className="block text-[#5d3a1a] mb-1 font-medium">
            Message Timestamp
          </label>
          <input
            type="text"
            name="ts"
            placeholder="e.g. 1625153956.000200"
            value={formData.ts}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      )}

      {action === "get" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5d3a1a] mb-1 font-medium">
                Start Time
              </label>
              <DatePicker
                selected={formData.oldest}
                onChange={(date) => handleDateChange(date, "oldest")}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select start time"
                className={inputClass}
                isClearable
              />
            </div>
            <div>
              <label className="block text-[#5d3a1a] mb-1 font-medium">
                End Time
              </label>
              <DatePicker
                selected={formData.latest}
                onChange={(date) => handleDateChange(date, "latest")}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select end time"
                className={inputClass}
                isClearable
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="block text-[#5d3a1a] mb-1 font-medium">
              OR Specific Timestamp
            </label>
            <input
              type="text"
              name="ts"
              placeholder="e.g. 1625153956.000200"
              value={formData.ts}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center py-2 ${
          loading
            ? "bg-[#c48c57] cursor-not-allowed"
            : "bg-[#d8a76c] hover:bg-[#c48c57]"
        } text-white font-semibold rounded-lg shadow-md transition-all duration-150`}
      >
        {loading ? (
          <Spinner className="w-5 h-5 text-white animate-spin mr-2" />
        ) : null}
        {action === "send"
          ? loading
            ? "Sending..."
            : "Send Message"
          : action === "edit"
          ? loading
            ? "Updating..."
            : "Update Message"
          : action === "delete"
          ? loading
            ? "Deleting..."
            : "Delete Message"
          : loading
          ? "Retrieving..."
          : "Retrieve Messages"}
      </button>
    </form>
  );
};

export default MessageForm;
