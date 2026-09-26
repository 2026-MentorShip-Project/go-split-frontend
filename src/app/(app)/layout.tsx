"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Drawer from "@/components/layout/Drawer";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import { isEventDetailPage, ROUTES } from "@/lib/routes";
import { getEvent } from "@/api/event";
import type { RoleType } from "@/lib/types";

function extractEventId(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/events\/(\d+)/);
  return match ? match[1] : null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { menuOpen, menuIn, guest, role, cur, closeMenu, setRole } = useStore(
    useShallow((s) => ({
      menuOpen: s.menuOpen,
      menuIn: s.menuIn,
      guest: s.guest,
      role: s.role,
      cur: s.cur,
      closeMenu: s.closeMenu,
      setRole: s.setRole,
    }))
  );

  const showNav = isEventDetailPage(pathname);
  const isHost = role === "host";
  const hasGuestSession = typeof window !== "undefined" && Boolean(localStorage.getItem("guest_session"));
  const isGuest = guest || hasGuestSession;
  const eventId = useMemo(() => extractEventId(pathname), [pathname]);

  useEffect(() => {
    if (!isGuest) return;
    if (
      pathname !== ROUTES.HOME &&
      pathname !== ROUTES.EVENTS.CREATE &&
      pathname !== ROUTES.EVENTS.INVITE
    ) return;

    const guestEventId = (() => {
      if (cur > 0) return cur;
      if (typeof window === "undefined") return 0;
      try {
        const raw = localStorage.getItem("guest_session");
        const parsed = raw ? JSON.parse(raw) : null;
        const id = Number(parsed?.event_id ?? 0);
        return Number.isFinite(id) && id > 0 ? id : 0;
      } catch {
        return 0;
      }
    })();
    const target = guestEventId ? ROUTES.EVENTS.DETAIL(guestEventId) : ROUTES.LOGIN;
    if (pathname !== target) router.replace(target);
  }, [cur, isGuest, pathname, router]);

  useEffect(() => {
    if (!eventId) return;
    getEvent(Number(eventId))
      .then((ev) => setRole(ev.my_role as RoleType))
      .catch(() => {});
  }, [eventId, setRole]);

  const activeScreen = useMemo(() => {
    if (!pathname) return "";
    if (pathname === "/dashboard") return "home";
    if (pathname.includes("/group")) return "group";
    if (pathname.includes("/rules")) return "rules";
    if (pathname.includes("/settle")) return "settle";
    if (pathname.match(/^\/events\/\d+$/)) return "event";
    return "";
  }, [pathname]);

  const handleNavigate = useCallback((screen: string) => {
    closeMenu();
    switch (screen) {
      case "home":
        router.push(ROUTES.HOME);
        break;
      case "event":
        if (eventId) router.push(ROUTES.EVENTS.DETAIL(eventId));
        break;
      case "group":
        if (eventId) router.push(ROUTES.EVENTS.GROUP(eventId));
        break;
      case "rules":
        if (eventId) router.push(ROUTES.EVENTS.RULES(eventId));
        break;
      case "settle":
        if (eventId) router.push(ROUTES.EVENTS.SETTLE(eventId));
        break;
    }
  }, [closeMenu, router, eventId]);

  return (
    <div id="app-root" style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <div className="app-body">
        <div className="app-row">
          {showNav && (
            <Sidebar
              onNavigate={handleNavigate}
              activeScreen={activeScreen}
              isHost={isHost}
              isGuest={isGuest}
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
            activeScreen={activeScreen}
            isHost={isHost}
            isGuest={isGuest}
          />
        )}
      </div>
    </div>
  );
}
