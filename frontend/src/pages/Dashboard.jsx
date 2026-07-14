import { useEffect, useState } from 'react';
import './Dashboard.css';

import Sidebar from "./components/Sidebar/Sidebar";
import HomePanel from "./components/HomePanel/Homepanel";
import ChatPanel from "./components/ChatPanel/Chatpanel";
import SummaryPanel from "./components/SummaryPanel/Summarypanel";
import QuizPanel from "./components/QuizPanel/Quizpanel";
import SearchPanel from "./components/SearchPanel/Searchpanel";
import DocsPanel from "./components/DocsPanel/DocsPanel";
import { MOCK_DOCS } from "./components/Mockdata";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeDoc, setActiveDoc] = useState(MOCK_DOCS[0]);
  const [activeView, setActiveView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleDocSelect = (doc) => {
    setActiveDoc(doc);
    setActiveView('chat');
  };

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const panels = {
    home: <HomePanel />,
    chat: <ChatPanel doc={activeDoc} userName={userName} />,
    summary: <SummaryPanel doc={activeDoc} />,
    quiz: <QuizPanel doc={activeDoc} />,
    search: <SearchPanel />,
    docs: <DocsPanel docs={MOCK_DOCS} onDocSelect={handleDocSelect} />,
  };

  return (
    <div className="dashboard">
      <button className="sidebar__toggle" onClick={() => setSidebarOpen(o => !o)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6"  x2="21" y2="6"  />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {sidebarOpen && <div className="sidebar__overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        isOpen={sidebarOpen}
      />

      <main className="dashboard__main">
        {panels[activeView] ?? null}
      </main>
    </div>
  );
}