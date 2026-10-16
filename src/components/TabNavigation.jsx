export default function TabNavigation({ tabs, activeTab, onTabChange, className = "" }) {
  return (
    <nav className={`tab-navigation ${className}`} role="tablist" aria-label="Soruşturma Bölümleri">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`tab-button ${isActive ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
            {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
          </button>
        );
      })}
    </nav>
  );
}
