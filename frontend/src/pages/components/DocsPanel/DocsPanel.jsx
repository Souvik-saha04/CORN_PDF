import './DocsPanel.css';
import { File } from "lucide-react";
import { Trash } from "lucide-react";
import { LoaderCircle } from "lucide-react";


export default function DocsPanel({ docs, onDocSelect,onDelete,deletingDocId,}) {
  return (
    <div className="docs-panel">
      <h2 className="docs-panel__title">My Documents</h2>
      <p className="docs-panel__sub">Click any document to start chatting with it.</p>

      <div className="docs-panel__grid">
        {docs.map(doc => (
          <div key={doc.id}
              className={`docs-card ${
                  doc.status !== "READY"
                      ? "docs-card--disabled"
                      : ""
              }`}
              disabled={doc.status !== "READY"}
              onClick={() => onDocSelect(doc)}>
            <div>
              <File className="docs-card__icon" color="grey"/>
            </div>

            <div className="docs-card__info">

                <div className="docs-card__name">
                    {doc.file_name}
                </div>

                <div className={`docs-card__status docs-card__status--${doc.status.toLowerCase()}`}>
                  {doc.status}
                </div>

            </div>
            {deletingDocId === doc.id ? (
    <LoaderCircle
        className="docs-card__loader"
        size={22}/>
) : (
    <Trash
        className="docs-card__delete"
        size={22}
        color="red"
        strokeWidth={2}
        onClick={(e) => {
            e.stopPropagation();

            if (window.confirm("Delete this document?")) {
                onDelete(doc.id);
            }
        }}/>
)}
          </div>
        ))}
      </div>
    </div>
  );
}
