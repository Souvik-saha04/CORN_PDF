import { useState } from 'react';
import './Sidebar.css';
import { AiFillHome } from "react-icons/ai";
import { BsChatLeftDotsFill } from "react-icons/bs";
import { TbNotes } from "react-icons/tb";
import { PiExam } from "react-icons/pi";
import { FaSearch, FaFolder } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',      icon: <AiFillHome /> },
  { id: 'chat',    label: 'Ask AI',    icon: <BsChatLeftDotsFill />, badge: 'NEW' },
  { id: 'summary', label: 'Summary',   icon: <TbNotes /> },
  { id: 'quiz',    label: 'Quiz',      icon: <PiExam /> },
  // { id: 'search',  label: 'Search',    icon: <FaSearch /> },
];

export default function Sidebar({ activeView, setActiveView, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>

      

      <div className="sidebar__logo">
        <img src="/cornPDF_logo.png" alt="cornPDF logo" />
      </div>

      <button className="sidebar__upload-btn" onClick={() => setActiveView('home')}>
        <span className="sidebar__upload-btn-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
        Upload Document
        <HiSparkles className="sidebar__upload-btn-sparkle" size={14} />
      </button>

      <div className="sidebar__section-title">
        <span className="sidebar__section-line" />
        Navigation
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeView === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <div className="sidebar__nav-item-icon">{item.icon}</div>
            <span className="sidebar__nav-item-label">{item.label}</span>
            {item.badge && <span className="sidebar__nav-item-badge">{item.badge}</span>}
          </button>
        ))}

        <button
          className={`sidebar__nav-item ${activeView === 'docs' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => setActiveView('docs')}
        >
          <div className="sidebar__nav-item-icon"><FaFolder /></div>
          <span className="sidebar__nav-item-label">My Documents</span>
        </button>
      </nav>

    </aside>
  );
}