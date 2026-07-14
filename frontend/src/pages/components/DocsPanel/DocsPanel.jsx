import './DocsPanel.css';

export default function DocsPanel({ docs, onDocSelect }) {
  return (
    <div className="docs-panel">
      <h2 className="docs-panel__title">My Documents</h2>
      <p className="docs-panel__sub">Click any document to start chatting with it.</p>

      <div className="docs-panel__grid">
        {docs.map(doc => (
          <button key={doc.id} className="docs-card" onClick={() => onDocSelect(doc)}>
            <div className="docs-card__icon" style={{ background: `linear-gradient(135deg, ${doc.color}, ${doc.color}88)` }}>
              {doc.emoji}
            </div>
            <div className="docs-card__info">
              <div className="docs-card__name">{doc.name}</div>
              <div className="docs-card__meta">{doc.size} · {doc.date}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}