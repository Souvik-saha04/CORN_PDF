import { useEffect, useState } from "react";
import {FileSearchCorner} from "lucide-react";
import "./Dashboard.css";

import Sidebar from "./components/Sidebar/Sidebar";
import HomePanel from "./components/HomePanel/Homepanel";
import ChatPanel from "./components/ChatPanel/Chatpanel";
import SummaryPanel from "./components/SummaryPanel/Summarypanel";
import QuizPanel from "./components/QuizPanel/Quizpanel";
import SearchPanel from "./components/SearchPanel/Searchpanel";
import DocsPanel from "./components/DocsPanel/DocsPanel";

import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { buildApiUrl } from "../lib/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const [documents, setDocuments] = useState([]);

  const [activeDoc, setActiveDoc] = useState(null);

  const [activeView, setActiveView] = useState("home");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

        setUser(currentUser);

    });

    return () => unsubscribe();

}, []);

  useEffect(() => {

    if(user){
        fetchDocuments();
    }

}, [user]);

  const fetchDocuments = async () => {
  if (!user) return;

  try {
    const token = await user.getIdToken();

    const response = await fetch(
      buildApiUrl("/documents/"),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    setDocuments(data);

    const readyDocs = data.filter(doc => doc.status === "READY");

  if (readyDocs.length > 0) {
    setActiveDoc(readyDocs[0]);
  } else {
    setActiveDoc(null);
  }
  } catch (error) {
    console.error("Failed to load documents", error);
  }
};
const processedDocuments = documents.filter(
  doc => doc.status === "READY"
);
console.log(documents);
console.log(processedDocuments);
  const handleDeleteDocument = async (docId) => {
    try {
        setDeletingDocId(docId);

        const token = await user.getIdToken();

        const response = await fetch(
            buildApiUrl(`/documents/${docId}/delete/`),
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Failed to delete document");
          }
        }

        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));

        if (activeDoc?.id === docId) {
          setActiveDoc(null);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to delete document.");
    } finally {
        setDeletingDocId(null);
    }
};
  

  const handleDocSelect = (doc) => {
  if (doc.status !== "READY") return;

  setActiveDoc(doc);
  setActiveView("chat");
};

  const userName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  const panels = {
    home: <HomePanel documents={processedDocuments}
          fetchDocuments={fetchDocuments} 
          setActiveView={setActiveView} 
          docs={documents}
          onDocSelect={handleDocSelect}
          onDelete={handleDeleteDocument}
          deletingDocId={deletingDocId}/>,

    chat: activeDoc ? (
        <ChatPanel
          doc={{
            id: activeDoc.id,
            name: activeDoc.file_name,
            size: `${(activeDoc.file_size / 1024 / 1024).toFixed(2)} MB`,
            emoji: <FileSearchCorner/>,
          }}
          documents={processedDocuments}
          onDocSelect={handleDocSelect}
          userName={userName}/>
    ) : (
      <div>No document selected.</div>
    ),

    summary: <SummaryPanel doc={activeDoc} />,

    quiz: <QuizPanel doc={activeDoc} documents={processedDocuments}/>,

    // search: <SearchPanel />,

    docs: (
      <DocsPanel
    docs={documents}
    onDocSelect={handleDocSelect}
    onDelete={handleDeleteDocument}
    deletingDocId={deletingDocId}/>
    ),
  };

  return (
    <div className="dashboard">
      <button
        className="sidebar__toggle"
        onClick={() => setSidebarOpen((o) => !o)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {sidebarOpen && (
        <div
          className="sidebar__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        isOpen={sidebarOpen}
      />

      <main className="dashboard__main">
        {panels[activeView]}
      </main>
    </div>
  );
}