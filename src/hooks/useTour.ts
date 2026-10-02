"use client";

import { useEffect } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useStore } from "@/store";

export interface TourStep {
  target: string;
  title: string;
  description: string;
}

const seenKey = (key: string) => `tour_seen:${key}`;

function hasSeen(key: string) {
  try {
    return localStorage.getItem(seenKey(key)) === "1";
  } catch {
    return false;
  }
}

function markSeen(key: string) {
  try {
    localStorage.setItem(seenKey(key), "1");
  } catch {}
}

function visibleElement(selector: string) {
  const el = document.querySelector(selector);
  return el && el.getClientRects().length > 0 ? el : null;
}

// Runs a tour once per browser, or again when setTourReplay(key) is called.
// Steps whose target isn't rendered or visible (role-gated buttons, sidebar
// vs. hamburger by breakpoint) are skipped.
export function useTour(key: string, steps: readonly TourStep[], ready: boolean) {
  const replay = useStore((s) => s.tourReplay === key);
  const setTourReplay = useStore((s) => s.setTourReplay);

  useEffect(() => {
    if (!ready || (!replay && hasSeen(key))) return;

    const driveSteps: DriveStep[] = steps.flatMap((s) => {
      const element = visibleElement(s.target);
      return element ? [{ element, popover: { title: s.title, description: s.description } }] : [];
    });
    if (driveSteps.length === 0) return;

    let unmounting = false;
    const tour = driver({
      steps: driveSteps,
      showProgress: driveSteps.length > 1,
      progressText: "{{current}} / {{total}}",
      nextBtnText: "下一步",
      prevBtnText: "上一步",
      doneBtnText: "知道了",
      popoverClass: "gs-tour",
      onDestroyed: () => {
        if (unmounting) return;
        markSeen(key);
        setTourReplay(null);
      },
    });
    // Let the drawer finish closing before highlighting.
    const timer = setTimeout(() => tour.drive(), 350);

    return () => {
      unmounting = true;
      clearTimeout(timer);
      tour.destroy();
    };
  }, [key, steps, ready, replay, setTourReplay]);
}
