import { useState, useEffect, useRef } from "react";
import "./Chatpanel.css";
import { SUGGESTIONS } from "../Mockdata";
import { auth } from "@/firebase/config";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPanel({
  doc,
  documents,
  onDocSelect,
  userName,}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [doc?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, generating]);

  const sendMessage = async (text) => {
    if (!doc) {
      alert("Please select a document first.");
      return;
    }
    if (!text.trim() || generating) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setGenerating(true);
    setSteps(["Searching document"]);

    try {
      setSteps((prev) => [...prev, "Retrieving relevant chunks"]);

      const token = await auth.currentUser.getIdToken();

      const response = await fetch(
          "http://127.0.0.1:8000/ai/ask_question/",
          {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                  question: text,
                  document_id: doc.id,
              }),
          }
      );

      setSteps((prev) => [...prev, "Generating answer"]);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiMsg = {
        id: crypto.randomUUID(),
        role: "ai",
        label: "Answer",
        text: data.answer,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        label: "Error",
        text: error.message || "Something went wrong.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setGenerating(false);
      setSteps([]);
    }
  };

  const initials = userName
    ? userName.slice(0, 2).toUpperCase()
    : "ME";

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div style={{ fontSize: "1.5rem" }}>
          {doc?.emoji || "📄"}
        </div>

        <div className="chat-panel__doc-info">

          <select
            className="chat-doc-selector"
            value={doc?.id || ""}
            onChange={(e) => {
              const selected = documents.find(
                (d) => d.id === Number(e.target.value)
              );

              if (selected) {
                onDocSelect(selected);
              }
            }}
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.file_name}
              </option>
            ))}
          </select>

          <div className="chat-panel__doc-meta">
            {doc?.size} · Ready to answer
          </div>

        </div>

        {/* <div className="chat-panel__actions">
          <button className="chip-btn">
            🧩 <span>Quiz</span>
          </button>

          <button className="chip-btn">
            ✨ <span>Summary</span>
          </button>

          <button className="chip-btn">
            💡 <span>Insights</span>
          </button>

          <button className="chip-btn">
            ↗ <span>Share</span>
          </button>
        </div> */}
      </div>

      <div className="chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`message message--${m.role}`}
          >
            <div
              className={`message__avatar message__avatar--${
                m.role === "ai" ? "ai" : "user"
              }`}
            >
              {m.role === "ai" ? "BD" : initials}
            </div>

            <div
              className={`message__bubble message__bubble--${
                m.role === "ai" ? "ai" : "user"
              }`}
            >
              {m.label && (
                <div className="message__bubble-label">
                  {m.label}:
                </div>
              )}

              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {generating && (
          <div className="generating-card">
            <div className="generating-spinner"></div>

            <div className="generating-steps">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`generating-step ${
                    index < steps.length - 1
                      ? "generating-step--done"
                      : ""
                  }`}
                >
                  {index < steps.length - 1 ? "✓" : "⋯"} {step}
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      <div className="chat-input-bar">
        {/* <div className="chat-suggestions">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              className="suggestion-chip"
              disabled={generating}
              onClick={() =>
                sendMessage(suggestion.slice(2))
              }
            >
              {suggestion}
            </button>
          ))}
        </div> */}

        <div className="chat-input-row">
          <textarea
            className="chat-textarea"
            rows={1}
            placeholder="Ask anything about this document..."
            value={input}
            disabled={generating}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />

          <button
            className="chat-send-btn"
            disabled={generating}
            onClick={() => sendMessage(input)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line
                x1="22"
                y1="2"
                x2="11"
                y2="13"
              />

              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}