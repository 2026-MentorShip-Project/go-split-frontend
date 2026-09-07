"use client";

import { useCallback } from "react";
import { useStore } from "@/store";
import Sidebar from "./Sidebar";
import Drawer from "./Drawer";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const menuOpen = useStore((s) => s.menuOpen);
  const menuIn = useStore((s) => s.menuIn);
  const closeMenu = useStore((s) => s.closeMenu);
  const role = useStore((s) => s.role);
  const settled = useStore((s) => s.settled);

  const isHost = role === "host" || role === "co";

  const handleNavigate = useCallback((_screen: string) => {
    closeMenu();
  }, [closeMenu]);

  return (
    <div id="app-root">
      <div className="app-body">
        <div className="app-row">
          <Sidebar
            onNavigate={handleNavigate}
            activeScreen=""
            isHost={isHost}
            isSettled={settled}
            showNav
          />
          <div className="app-scroll">{children}</div>
        </div>
      </div>

      <Drawer
        open={menuOpen}
        visible={menuIn}
        onClose={closeMenu}
        onNavigate={handleNavigate}
        activeScreen=""
        isHost={isHost}
        isSettled={settled}
      />
    </div>
  );
}
