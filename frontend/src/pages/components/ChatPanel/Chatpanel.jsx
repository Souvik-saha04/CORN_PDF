import { useState, useEffect, useRef } from "react";
import "./Chatpanel.css";
import { SUGGESTIONS } from "../Mockdata";
import { auth } from "@/firebase/config";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ChatPanel({ doc, documents, onDocSelect, userName }) {
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  const sendMessage = async (text) => {
    if (!doc) {
      alert("Please select a document first.");
      return;
    }
    if (!text.trim() || generating) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setGenerating(true);
    setSteps(["Searching document"]);

    try {
      setSteps((prev) => [...prev, "Retrieving relevant chunks"]);
      const token = await auth.currentUser.getIdToken();

      const response = await fetch("http://127.0.0.1:8000/ai/ask_question/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: text, document_id: doc.id }),
      });

      setSteps((prev) => [...prev, "Generating answer"]);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to get response");

      const aiMsg = { id: crypto.randomUUID(), role: "ai", label: "Answer", text: data.answer };
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

  const initials = userName ? userName.slice(0, 2).toUpperCase() : "ME";

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div className="chat-panel__doc-icon">
          <FileText size={20} strokeWidth={1.75} />
        </div>

        <div className="chat-panel__doc-info">
          <Select
            value={doc?.id ? String(doc.id) : ""}
            onValueChange={(val) => {
              const selected = documents.find((d) => d.id === Number(val));
              if (selected) onDocSelect(selected);
            }}
          >
            <SelectTrigger className="chat-doc-selector">
              <SelectValue placeholder="Choose a document" />
            </SelectTrigger>
            <SelectContent className="chat-doc-selector__content" style={{ backgroundColor: '#12121a', color: '#f0f0f0' }}>
              {documents.map((d) => (
                <SelectItem key={d.id} value={String(d.id)} className="chat-doc-selector__item">
                  {d.file_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="chat-panel__doc-meta">
            <span className="chat-panel__status-dot" />
            {doc?.size ? `${doc.size} · ` : ""}Ready to answer
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !generating && (
          <div className="chat-empty">
            <div className="chat-empty__icon">
              <Sparkles size={26} strokeWidth={1.75} />
            </div>
            <div className="chat-empty__title">Ask me anything</div>
            <p className="chat-empty__sub">
              I've read through your document — go ahead and ask a question.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`message message--${m.role}`}>
            <div className={`message__avatar message__avatar--${m.role === "ai" ? "ai" : "user"}`}>
              {m.role === "ai" ? <Sparkles size={15} strokeWidth={2} /> : initials}
            </div>

            <div className={`message__bubble message__bubble--${m.role === "ai" ? "ai" : "user"}`}>
              {m.label && <div className="message__bubble-label">{m.label}</div>}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}

        {generating && (
          <div className="generating-card">
            <div className="generating-spinner" />
            <div className="generating-steps">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`generating-step ${index < steps.length - 1 ? "generating-step--done" : ""}`}
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
        <div className="chat-input-row">
          <textarea
            className="chat-textarea"
            rows={1}
            placeholder="Ask anything about this document..."
            value={input}
            disabled={generating}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />

          <button className="chat-send-btn" disabled={generating} onClick={() => sendMessage(input)}>
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}