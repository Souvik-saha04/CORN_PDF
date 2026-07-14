import { useState } from 'react';
import './Chatpanel.css';
import { MOCK_MESSAGES, SUGGESTIONS } from '../Mockdata';

export default function ChatPanel({ doc, userName }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState([]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: crypto.randomUUID(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setGenerating(true);
    setSteps(['Understanding your question']);

    await new Promise(r => setTimeout(r, 800));
    setSteps(prev => [...prev, 'Answering your question']);
    await new Promise(r => setTimeout(r, 900));

    setGenerating(false);
    setSteps([]);
    const aiMsg = {
      id: crypto.randomUUID(),
      role: 'ai',
      label: 'Answer',
      text: 'Based on the document, ' + text.toLowerCase().replace('?', '') + ' — the text highlights that the primary mechanism involves a multi-layered approach, where individual components reinforce systemic outcomes. The authors cite three empirical studies supporting this conclusion.',
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  const initials = userName ? userName.slice(0, 2).toUpperCase() : 'ME';

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div style={{ fontSize: '1.5rem' }}>{doc?.emoji || '📄'}</div>
        <div className="chat-panel__doc-info">
          <div className="chat-panel__doc-name">{doc?.name || 'Document'}</div>
          <div className="chat-panel__doc-meta">{doc?.size} · Ready to answer</div>
        </div>
        <div className="chat-panel__actions">
          <button className="chip-btn">🧩 <span>Quiz</span></button>
          <button className="chip-btn">✨ <span>Summary</span></button>
          <button className="chip-btn">💡 <span>Insights</span></button>
          <button className="chip-btn">↗ <span>Share</span></button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(m => (
          <div key={m.id} className={`message message--${m.role}`}>
            <div className={`message__avatar message__avatar--${m.role === 'ai' ? 'ai' : 'user'}`}>
              {m.role === 'ai' ? 'BD' : initials}
            </div>
            <div className={`message__bubble message__bubble--${m.role === 'ai' ? 'ai' : 'user'}`}>
              {m.label && <div className="message__bubble-label">{m.label}:</div>}
              {m.text}
            </div>
          </div>
        ))}

        {generating && (
          <div className="generating-card">
            <div className="generating-spinner" />
            <div className="generating-steps">
              {steps.map((s, i) => (
                <div key={i} className={`generating-step ${i < steps.length - 1 ? 'generating-step--done' : ''}`}>
                  {i < steps.length - 1 ? '✓' : '⋯'} {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-bar">
        <div className="chat-suggestions">
          {SUGGESTIONS.map(s => (
            <button key={s} className="suggestion-chip" onClick={() => sendMessage(s.slice(2))}>
              {s}
            </button>
          ))}
        </div>
        <div className="chat-input-row">
          <textarea
            className="chat-textarea"
            rows={1}
            placeholder="Ask anything about this document…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
            }}
          />
          <button className="chat-send-btn" onClick={() => sendMessage(input)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}