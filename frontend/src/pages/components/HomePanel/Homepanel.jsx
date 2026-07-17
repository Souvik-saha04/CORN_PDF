import { useState, useRef, useMemo, useCallback } from 'react';
import { File, MessageSquareMore, NotebookPen, Puzzle, Microscope, Lightbulb, UploadCloud, X, LayoutGrid, List, Search, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import './Homepanel.css';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase/config';


export function CustomAlert({ open, setOpen, title, message }) {
  // Purely presentational — picks an icon/tone based on the title text.
  const lower = (title || "").toLowerCase();
  const isError = lower.includes("error") || lower.includes("failed") || lower.includes("invalid") || lower.includes("too large") || lower.includes("no file") || lower.includes("logout error");
  const isSuccess = lower.includes("success");

  const Icon = isError ? AlertTriangle : isSuccess ? CheckCircle2 : Info;
  const tone = isError ? "error" : isSuccess ? "success" : "info";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="theme-alert" data-tone={tone}>
        <div className="theme-alert__icon">
          <Icon size={22} strokeWidth={2} />
        </div>

        <AlertDialogHeader>
          <AlertDialogTitle className="theme-alert__title">{title}</AlertDialogTitle>
          <AlertDialogDescription className="theme-alert__desc">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction className="theme-alert__action" onClick={() => setOpen(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Pure formatting helper — no API involved.
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HomePanel({
    documents,
    fetchDocuments,
}) {

  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // New UI-only state — client-side search & view toggle for the docs list.
  const [docQuery, setDocQuery] = useState("");
  const [docView, setDocView] = useState("grid"); // "grid" | "list"

  // 🔥 Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    message: "",
  });

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const showAlert = useCallback((title, message) => {
    setAlertContent({ title, message });
    setAlertOpen(true);
  }, []);

  const features = [
    { emoji: <MessageSquareMore size={26} strokeWidth={1.75} />, title: 'Ask Questions', desc: 'Chat with your documents naturally', spotlight: true },
    { emoji: <NotebookPen size={26} strokeWidth={1.75} />, title: 'Smart Summaries', desc: 'Get concise overviews in seconds' },
    { emoji: <Puzzle size={26} strokeWidth={1.75} />, title: 'Generate Quizzes', desc: 'Test your knowledge automatically' },
    { emoji: <Microscope size={26} strokeWidth={1.75} />, title: 'Semantic Search', desc: 'Find anything across all documents' },
    { emoji: <Lightbulb size={26} strokeWidth={1.75} />, title: 'Extract Insights', desc: 'Surface hidden patterns & key data' },
  ];

  // Derived, read-only — groups existing `documents` by their status field.
  // No new requests are made; this only reshapes data already fetched.
  const statusCounts = useMemo(() => {
    const counts = {};
    (documents || []).forEach(doc => {
      const key = doc.status || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    if (!docQuery.trim()) return documents || [];
    const q = docQuery.toLowerCase();
    return (documents || []).filter(doc =>
      (doc.file_name || "").toLowerCase().includes(q)
    );
  }, [documents, docQuery]);

  async function Logout() {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      navigate('/');
    } catch {
      showAlert("Logout Error", "Something went wrong while logging out.");
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      showAlert("Invalid File", "Only PDF files are allowed.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      showAlert("File Too Large", "File must be less than 50MB.");
      return;
    }

    setFile(selectedFile);
  };

  // Thin UI wrapper around the existing setFile state — no new behavior.
  const removeSelectedFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onUpload = async () => {
  if (!file) {
    showAlert("No File", "Please select a file before uploading.");
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    showAlert("Authentication Error", "User not logged in.");
    return;
  }

  setLoading(true);

  try {
    const token = await user.getIdToken();

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "http://127.0.0.1:8000/documents/create/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    showAlert("Success", data.message);

    setFile(null);

    await fetchDocuments();

  } catch (err) {
    console.error(err);
    showAlert("Upload Failed", err.message);
  } finally {
    setLoading(false);
  }
  };


  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) return;

    if (droppedFile.type !== "application/pdf") {
      showAlert("Invalid File", "Only PDF files are allowed.");
      return;
    }

    setFile(droppedFile);
  };

  return (
    <div className="panel home-panel">

      {/* 🔥 ALERT COMPONENT */}
      <CustomAlert
        open={alertOpen}
        setOpen={setAlertOpen}
        title={alertContent.title}
        message={alertContent.message}
      />

      <div className="home-panel__header">
        <h1 className="home-panel__greeting">
          Good morning,&nbsp;

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="avatar-trigger">
                <Avatar className="avatar-sm">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={Logout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          &nbsp;<mark>Genius</mark>
        </h1>
        <p className="home-panel__sub">What would you like to explore today?</p>

        {/* New: quick-glance stats strip, derived from documents already in props */}
        {documents && documents.length > 0 && (
          <div className="stats-strip">
            <div className="stats-strip__chip stats-strip__chip--total">
              <span className="stats-strip__value">{documents.length}</span>
              <span className="stats-strip__label">Total Docs</span>
            </div>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div className="stats-strip__chip" key={status}>
                <span className="stats-strip__value">{count}</span>
                <span className="stats-strip__label">{status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className={`upload-zone ${drag ? 'upload-zone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
      >
        <div className="upload-zone__icon">
          <UploadCloud size={30} strokeWidth={1.75} />
        </div>

        {file ? (
          <div className="file-chip" onClick={(e) => e.stopPropagation()}>
            <File size={16} strokeWidth={2} />
            <span className="file-chip__name">{file.name}</span>
            <span className="file-chip__size">{formatBytes(file.size)}</span>
            <button className="file-chip__remove" onClick={removeSelectedFile} aria-label="Remove file">
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="upload-zone__title">Drop your PDF here</div>
        )}

        <p className="upload-zone__sub">
          Supports PDF — up to 50MB
        </p>

        {loading && (
          <div className="upload-progress">
            <div className="upload-progress__bar" />
          </div>
        )}

        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="upload-zone__actions">
          <button
            className="upload-zone__btn upload-zone__btn--ghost"
            onClick={() => fileInputRef.current.click()}
          >
            Browse Files
          </button>
          <button
            className="upload-zone__btn"
            onClick={onUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* New: asymmetric bento layout — first card is the spotlight */}
      <div className="feature-grid">
        {features.map(f => (
          <div
            key={f.title}
            className={`feature-card ${f.spotlight ? 'feature-card--spotlight' : ''}`}
            onClick={() => showAlert("Feature", "Feature selected")}
          >
            <span className="feature-card__emoji">{f.emoji}</span>
            <div className="feature-card__title">{f.title}</div>
            <div className="feature-card__desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="recent-docs">
        <div className="recent-docs__bar">
          <div className="recent-docs__title">Recent Documents</div>

          <div className="recent-docs__controls">
            <div className="docs-search">
              <Search size={14} strokeWidth={2} />
              <input
                type="text"
                placeholder="Search documents..."
                value={docQuery}
                onChange={(e) => setDocQuery(e.target.value)}
              />
            </div>
            <div className="docs-view-toggle">
              <button
                className={docView === "grid" ? "is-active" : ""}
                onClick={() => setDocView("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid size={15} strokeWidth={2} />
              </button>
              <button
                className={docView === "list" ? "is-active" : ""}
                onClick={() => setDocView("list")}
                aria-label="List view"
              >
                <List size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {filteredDocuments && filteredDocuments.length > 0 ? (
          <div className={docView === "grid" ? "recent-docs-grid" : "recent-docs-list"}>
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="doc-card"
                onClick={() => window.open(doc.file_url, "_blank")}
              >
                <div className="doc-card__header">
                  <div className="doc-card__icon"><File size={20} strokeWidth={1.75} /></div>
                  <div className="doc-card__badge">PDF</div>
                </div>
                <div className="doc-card__name">{doc.file_name}</div>
                
                <div className={`docs-card__status docs-card__status--${doc.status.toLowerCase()}`}>
                  {doc.status}
                </div>· {new Date(doc.uploaded_at).toLocaleDateString()}
              </div>
            ))}
          </div>
        ) : (
          <div className="recent-docs__empty">
            {docQuery ? "No documents match your search." : "No documents yet — upload a PDF to get started."}
          </div>
        )}
      </div>

    </div>
  );
}