"use client";

import { useEffect, useState } from "react";
import { getEvent, type EventDetail } from "@/api/event";
import { getShares, getTransfers } from "@/api/settlement";
import { buildSettlementPreview, type SettlementPreview } from "@/lib/settlement";

export interface SettlementPreviewState {
  loading: boolean;
  error: string | null;
  event: EventDetail | null;
  preview: SettlementPreview | null;
}

export function useSettlementPreview(eventId: number): SettlementPreviewState {
  const [state, setState] = useState<SettlementPreviewState>({
    loading: true,
    error: null,
    event: null,
    preview: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ loading: true, error: null, event: null, preview: null });
      try {
        const event = await getEvent(eventId);
        if (cancelled) return;

        if (event.my_role !== "host") {
          setState({ loading: false, error: null, event, preview: null });
          return;
        }

        const [shares, transfers] = await Promise.all([
          getShares(eventId),
          getTransfers(eventId),
        ]);
        if (cancelled) return;

        setState({
          loading: false,
          error: null,
          event,
          preview: buildSettlementPreview(event, shares, transfers),
        });
      } catch (e) {
        if (cancelled) return;
        setState({
          loading: false,
          error: e instanceof Error ? e.message : "載入分帳資料失敗",
          event: null,
          preview: null,
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return state;
}
