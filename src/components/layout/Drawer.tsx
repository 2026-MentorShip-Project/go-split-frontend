"use client";

interface DrawerProps {
  open: boolean;
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  activeScreen: string;
  isHost: boolean;
}

const NAV_ITEMS = [
  { key: "home", label: "首頁", hint: "" },
  { key: "event", label: "活動款項", hint: "" },
  { key: "rules", label: "分攤規則", hint: "" },
];

const HOST_ITEMS = [
  { key: "group", label: "群組設定", hint: "" },
  { key: "settle", label: "分帳產出/繳款狀況", hint: "" },
];

export default function Drawer({
  open,
  visible,
  onClose,
  onNavigate,
  activeScreen,
  isHost,
}: DrawerProps) {
  if (!open) return null;

  const handleNav = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div className="drawer-root">
      <div
        className="drawer-backdrop"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />
      <div
        className="drawer-panel"
        style={{ transform: visible ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="drawer-head">
          <span className="sidebar-logo">💰</span>
          <span className="sidebar-name">分帳吧</span>
        </div>

        <div className="drawer-body">
          <ul className="drawer-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <button
                  className={`drawer-item${activeScreen === item.key ? " is-active" : ""}`}
                  onClick={() => handleNav(item.key)}
                >
                  <span className="drawer-item-label">{item.label}</span>
                  {item.hint && <span className="drawer-item-hint">{item.hint}</span>}
                  <span className="drawer-item-caret">›</span>
                </button>
              </li>
            ))}

            {isHost && (
              <>
                {HOST_ITEMS.map((item) => (
                  <li key={item.key}>
                    <button
                      className={`drawer-item${activeScreen === item.key ? " is-active" : ""}`}
                      onClick={() => handleNav(item.key)}
                    >
                      <span className="drawer-item-label">{item.label}</span>
                      <span className="drawer-item-caret">›</span>
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
