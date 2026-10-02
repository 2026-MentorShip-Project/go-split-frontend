"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const { menuOpen, menuIn, guest, role, cur, closeMenu, setRole, setTourReplay } = useStore(
    useShallow((s) => ({
      menuOpen: s.menuOpen,
      menuIn: s.menuIn,
      guest: s.guest,
      role: s.role,
      cur: s.cur,
      closeMenu: s.closeMenu,
      setRole: s.setRole,
      setTourReplay: s.setTourReplay,
    }))
  );

  const showNav = isEventDetailPage(pathname);
  const isHost = role === "host";
  const hasGuestSession = typeof window !== "undefined" && Boolean(localStorage.getItem("guest_session"));
  const isGuest = guest || hasGuestSession;
  const eventId = useMemo(() => extractEventId(pathname), [pathname]);
  // Track which eventId archived/settled belong to, so we never reset state
  // synchronously in an effect (and avoid stale values while switching events).
  const [eventMeta, setEventMeta] = useState<{
    eventId: string;
    archived: boolean;
    settled: boolean;
  } | null>(null);
  const fetchedEventIdRef = useRef<string | null>(null);
  const isArchived = eventMeta?.eventId === eventId && eventMeta.archived;
  const isSettled = eventMeta?.eventId === eventId && eventMeta.settled;

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
    if (!eventId) {
      fetchedEventIdRef.current = null;
      return;
    }
    // Only skip after a successful fetch for this event. Marking the ref before
    // the request resolves caused cancelled fetches (Strict Mode / sub-route
    // navigations) to permanently leave role stuck at the default "member".
    if (fetchedEventIdRef.current === eventId) return;

    let cancelled = false;
    getEvent(Number(eventId))
      .then((ev) => {
        if (cancelled) return;
        fetchedEventIdRef.current = eventId;
        setRole(ev.my_role as RoleType);
        setEventMeta({ eventId, archived: ev.archived, settled: ev.settled });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [eventId, setRole]);

  const activeScreen = useMemo(() => {
    if (!pathname) return "";
    if (pathname === "/dashboard") return "home";
    if (pathname.includes("/group")) return "group";
    if (pathname.includes("/rules")) return "rules";
    if (pathname.includes("/payments") || pathname.includes("/settle")) return "payment";
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
      case "payment":
        if (!eventId) break;
        void getEvent(Number(eventId))
          .then((ev) => {
            setEventMeta({ eventId, archived: ev.archived, settled: ev.settled });
            setRole(ev.my_role as RoleType);
            router.push(
              ev.settled
                ? ROUTES.EVENTS.PAYMENTS(eventId)
                : ROUTES.EVENTS.SETTLE(eventId),
            );
          })
          .catch(() => {
            router.push(
              isSettled
                ? ROUTES.EVENTS.PAYMENTS(eventId)
                : ROUTES.EVENTS.SETTLE(eventId),
            );
          });
        break;
      case "tour":
        if (!eventId) break;
        setTourReplay("event");
        if (activeScreen !== "event") router.push(ROUTES.EVENTS.DETAIL(eventId));
        break;
    }
  }, [closeMenu, router, eventId, isSettled, setRole, setTourReplay, activeScreen]);

  return (
    <div
      id="app-root"
      className={showNav ? undefined : "no-rail"}
      style={{ height: "100dvh", display: "flex", flexDirection: "column" }}
    >
      <div className="app-body">
        <div className="app-row">
          {showNav && (
            <Sidebar
              onNavigate={handleNavigate}
              activeScreen={activeScreen}
              isHost={isHost}
              isGuest={isGuest}
              isArchived={isArchived}
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
            isArchived={isArchived}
          />
        )}
      </div>
    </div>
  );
}
