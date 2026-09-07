"use client";

import { BackIcon } from "@/components/icons";

interface TopbarProps {
  variant: "back" | "hamburger";
  title: string;
  onBack?: () => void;
  onMenuOpen?: () => void;
  rightAction?: React.ReactNode;
}

export default function Topbar({
  variant,
  title,
  onBack,
  onMenuOpen,
  rightAction,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-row">
        <div className="topbar-row--start">
          {variant === "back" ? (
            <button className="icon-btn" onClick={onBack} aria-label="返回">
              <BackIcon />
            </button>
          ) : (
            <button className="icon-btn hamburger" onClick={onMenuOpen} aria-label="選單">
              <span /><span /><span />
            </button>
          )}
        </div>
        <h1 className="topbar-title">{title}</h1>
        <div className="topbar-row--start">
          {rightAction ?? <span style={{ width: 40 }} />}
        </div>
      </div>
    </header>
  );
}
