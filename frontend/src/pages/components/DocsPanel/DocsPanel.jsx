import './DocsPanel.css';
import { File } from "lucide-react";
import { Trash } from "lucide-react";

export default function DocsPanel({ docs, onDocSelect,onDelete}) {
  return (
    <div className="docs-panel">
      <h2 className="docs-panel__title">My Documents</h2>
      <p className="docs-panel__sub">Click any document to start chatting with it.</p>

      <div className="docs-panel__grid">
        {docs.map(doc => (
          <button key={doc.id} className="docs-card" onClick={() => onDocSelect(doc)}>
            <div>
              <File className="docs-card__icon" color="grey"/>
            </div>

            <div className="docs-card__info">

                <div className="docs-card__name">
                    {doc.file_name}
                </div>

                <div className="docs-card__meta">
                    {doc.status}
                </div>

            </div>
            <Trash className="docs-card__delete" size={22} color="red" strokeWidth={2} onClick={(e) => {e.stopPropagation();  onDelete(doc.id);}}/>
          </button>
        ))}
      </div>
    </div>
  );
}
