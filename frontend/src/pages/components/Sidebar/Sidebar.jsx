import './Sidebar.css';
import { AiFillHome } from "react-icons/ai";
import { BsChatLeftDotsFill } from "react-icons/bs";
import { TbNotes } from "react-icons/tb";
import { PiExam } from "react-icons/pi";
import { FaSearch, FaFolder } from "react-icons/fa";

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',      icon: <AiFillHome /> },
  { id: 'chat',    label: 'Ask AI',    icon: <BsChatLeftDotsFill /> },
  { id: 'summary', label: 'Summary',   icon: <TbNotes /> },
  { id: 'quiz',    label: 'Quiz',      icon: <PiExam /> },
  { id: 'search',  label: 'Search',    icon: <FaSearch /> },
];

export default function Sidebar({ activeView, setActiveView, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>

      <div className="sidebar__logo">
        <img src="/cornPDF_logo.png" alt="cornPDF logo" />
      </div>

      <button className="sidebar__upload-btn" onClick={() => setActiveView('docs')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Upload Document
      </button>

      <div className="sidebar__section-title">Navigation</div>
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeView === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <div className="sidebar__nav-item-icon">{item.icon}</div>
            {item.label}
          </button>
        ))}

        {/* Documents button */}
        <button
          className={`sidebar__nav-item ${activeView === 'docs' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => setActiveView('docs')}
        >
          <div className="sidebar__nav-item-icon"><FaFolder /></div>
          My Documents
        </button>
      </nav>

      <div className="premium-banner" style={{ marginTop: 'auto' }}>
        <div>
          <div className="premium-banner__text">⚡ Premium</div>
          <div className="premium-banner__price">$19 / month</div>
        </div>
        <button className="premium-banner__btn">›</button>
      </div>

    </aside>
  );
}