import { useState, useRef, useEffect, useCallback } from 'react';
import './Homepanel.css';
import { onAuthStateChanged } from "firebase/auth";
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
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setOpen(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}




export default function HomePanel() {

  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

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
    { emoji: '💬', title: 'Ask Questions', desc: 'Chat with your documents naturally', accent: '#f5c518' },
    { emoji: '✨', title: 'Smart Summaries', desc: 'Get concise overviews in seconds', accent: '#f97316' },
    { emoji: '🧩', title: 'Generate Quizzes', desc: 'Test your knowledge automatically', accent: '#fbbf24' },
    { emoji: '🔍', title: 'Semantic Search', desc: 'Find anything across all documents', accent: '#ef4444' },
    { emoji: '💡', title: 'Extract Insights', desc: 'Surface hidden patterns & key data', accent: '#f5c518' },
  ];

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

    await fetchDocuments(user);

  } catch (err) {
    console.error(err);
    showAlert("Upload Failed", err.message);
  } finally {
    setLoading(false);
  }
};

  const fetchDocuments = useCallback(async (user) => {
    if (!user) return;

    const token = await user.getIdToken();

    try {
      const res = await fetch("http://127.0.0.1:8000/documents/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setDocuments(data);
    } catch {
      showAlert("Error", "Failed to fetch documents.");
    }
  }, [showAlert]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDocuments(user);
      }
    });
    return () => unsubscribe();
  }, [fetchDocuments]);

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
                <Avatar>
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
      </div>

      <div
        className={`upload-zone ${drag ? 'upload-zone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
      >
        <div className="upload-zone__icon">📄</div>
        <div className="upload-zone__title">
          {file ? file.name : "Drop your PDF here"}
        </div>
        <p className="upload-zone__sub">
          Supports PDF — up to 50MB
        </p>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="upload-zone__actions">
          <button
            className="upload-zone__btn"
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

      <div className="feature-grid">
        {features.map(f => (
          <div
            key={f.title}
            className="feature-card"
            style={{ '--card-accent': f.accent }}
            onClick={() => showAlert("Feature", "Feature selected")}          >
            <span className="feature-card__emoji">{f.emoji}</span>
            <div className="feature-card__title">{f.title}</div>
            <div className="feature-card__desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="recent-docs-grid">
        {documents.map(doc => (
          <div
            key={doc.id}
            className="doc-card"
            onClick={() => window.open(doc.file_url, "_blank")}
          >
            <div className="doc-card__header">
              <div className="doc-card__icon">📄</div>
              <div className="doc-card__badge">PDF</div>
            </div>
            <div className="doc-card__name">{doc.file_name}</div>
            <div className="doc-card__meta">
              {doc.status} · {new Date(doc.uploaded_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
