import { useState } from 'react';
import './DocsPanel.css';
import { FileText, MessageSquareText, Eye, Trash2, LoaderCircle, Clock, MoreVertical, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DocsPanel({ docs, onDocSelect, onDelete, onViewDoc, deletingDocId }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="docs-panel">
      <div className="docs-panel__header">
        <div>
          <h2 className="docs-panel__title">My Documents</h2>
          <p className="docs-panel__sub">Click any document to start chatting with it.</p>
        </div>
      </div>

      <div className="docs-panel__grid">
        {docs.map(doc => (
          <div
            key={doc.id}
            className={`docs-card ${doc.status !== "READY" ? "docs-card--disabled" : ""}`}
            onClick={() => onDocSelect(doc)}
          >
            <div className="docs-card__preview">
              <div className="docs-card__preview-icon">
                <FileText size={30} strokeWidth={1.5} />
              </div>

              <div className={`docs-card__status docs-card__status--${doc.status.toLowerCase()}`}>
                {doc.status === "PROCESSING" && <Clock size={11} strokeWidth={2.5} />}
                {doc.status}
              </div>

              {deletingDocId === doc.id ? (
                <LoaderCircle className="docs-card__loader" size={18} />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="docs-card__menu-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical size={18} strokeWidth={2.5} />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="docs-card__menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem
                      className="docs-card__menu-item"
                      onClick={() => onDocSelect(doc)}
                    >
                      <MessageSquareText size={16} strokeWidth={2.5} />
                      Chat
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="docs-card__menu-item"
                      onClick={() => onViewDoc ? onViewDoc(doc) : window.open(doc.file_url, "_blank")}
                    >
                      <Eye size={16} strokeWidth={2.5} />
                      View Doc
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="docs-card__menu-item docs-card__menu-item--danger"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="docs-card__info">
              <div className="docs-card__name">{doc.file_name}</div>
              <div className="docs-card__meta">
                Last updated {new Date(doc.uploaded_at || doc.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="docs-delete-alert">
          <div className="docs-delete-alert__icon">
            <AlertTriangle size={22} strokeWidth={2} />
          </div>

          <AlertDialogHeader>
            <AlertDialogTitle className="docs-delete-alert__title">
              Delete this document?
            </AlertDialogTitle>
            <AlertDialogDescription className="docs-delete-alert__desc">
              This action cannot be undone. <strong>{deleteTarget?.file_name}</strong> will be permanently removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="docs-delete-alert__cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="docs-delete-alert__confirm"
              onClick={confirmDelete}
            >
              <Trash2 size={15} strokeWidth={2.5} />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}