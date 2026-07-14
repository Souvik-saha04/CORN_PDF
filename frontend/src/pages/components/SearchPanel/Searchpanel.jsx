import './Searchpanel.css';

export default function SearchPanel() {
  return (
    <div className="panel search-panel">
      <h2 className="search-panel__title">Semantic Search</h2>

      <div className="search-bar">
        <span className="search-bar__icon">🔍</span>
        <input
          className="search-bar__input"
          placeholder="Search across all your documents…"
        />
      </div>

      <p className="search-panel__empty">
        🔍 Upload documents and type to start semantic searching
      </p>
    </div>
  );
}