"use client";

import { useEffect, useState } from "react";
import { initSplitEngine, splitEngineReady } from "@/lib/engine";

export interface SplitEngineState {
  ready: boolean;
  error: string | null;
}

/**
 * Loads the shared WASM allocation engine. Gate anything calling detailShares on
 * `ready`; the engine throws rather than guessing before the binary is running.
 */
export function useSplitEngine(): SplitEngineState {
  const [state, setState] = useState<SplitEngineState>({
    ready: splitEngineReady(),
    error: null,
  });

  useEffect(() => {
    if (splitEngineReady()) return;
    let cancelled = false;

    initSplitEngine()
      .then(() => {
        if (!cancelled) setState({ ready: true, error: null });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState({
          ready: false,
          error: e instanceof Error ? e.message : "載入分攤計算引擎失敗",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
