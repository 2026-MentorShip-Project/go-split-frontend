"use client";

interface SidebarProps {
  onNavigate: (screen: string) => void;
  activeScreen: string;
  isHost: boolean;
  isGuest: boolean;
  isArchived?: boolean;
  showNav: boolean;
}

const NAV_ITEMS = [
  { key: "event", label: "活動款項" },
  { key: "rules", label: "分攤規則" },
];

const HOST_ITEMS = [
  { key: "group", label: "群組設定" },
  { key: "payment", label: "分帳作業" },
];

export default function Sidebar({
  onNavigate,
  activeScreen,
  isHost,
  isGuest,
  isArchived = false,
  showNav,
}: SidebarProps) {
  const showHostItems = isHost && !isArchived;

  return (
    <aside data-tour="event-nav" className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">💰</span>
        <span className="sidebar-name">分帳吧</span>
      </div>

      {showNav && (
        <>
          {!isGuest && (
            <button
              key={'home'}
              className={`sidebar-item${activeScreen ==='home' ? " is-active" : ""}`}
              onClick={() => onNavigate('home')}
            >
              首頁
            </button>
          )}
          <div className="sidebar-label">活動</div>
          <nav className="sidebar-section">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`sidebar-item${activeScreen === item.key ? " is-active" : ""}`}
                onClick={() => onNavigate(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {showHostItems && (
            <>
              <div className="sidebar-divider" />
              <div className="sidebar-label">管理</div>
              <nav className="sidebar-section">
                {HOST_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    className={`sidebar-item${activeScreen === item.key ? " is-active" : ""}`}
                    onClick={() => onNavigate(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </>
          )}

          {!isArchived && (
            <>
              <div className="sidebar-divider" />
              <button className="sidebar-item" onClick={() => onNavigate("tour")}>
                使用導覽
              </button>
            </>
          )}
        </>
      )}
    </aside>
  );
}
