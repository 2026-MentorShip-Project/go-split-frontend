"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Drawer from "@/components/layout/Drawer";
import { useStore } from "@/store";
import { isEventDetailPage } from "@/lib/routes";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const menuOpen = useStore((s) => s.menuOpen);
  const menuIn = useStore((s) => s.menuIn);
  const role = useStore((s) => s.role);
  const settled = useStore((s) => s.settled);
  const openMenu = useStore((s) => s.openMenu);
  const closeMenu = useStore((s) => s.closeMenu);

  const showNav = isEventDetailPage(pathname);
  const isHost = role === "host";

  const handleNavigate = (screen: string) => {
    closeMenu();
    // Navigation is handled by the pages via Next.js router
  };

  return (
    <div id="app-root" style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <div className="app-body">
        <div className="app-row">
          {showNav && (
            <Sidebar
              onNavigate={handleNavigate}
              activeScreen=""
              isHost={isHost}
              isSettled={settled}
              showNav={showNav}
            />
          )}
          <div className="app-scroll">{children}</div>
        </div>
        {showNav && (
          <Drawer
            open={menuOpen}
            visible={menuIn}
            onClose={closeMenu}
            onNavigate={handleNavigate}
            activeScreen=""
            isHost={isHost}
            isSettled={settled}
          />
        )}
      </div>
    </div>
  );
}
