"use client";

import Chip from "@/components/ui/Chip";
import { XIcon } from "@/components/icons";

interface RuleGroupEditorProps {
  groupNo: number;
  chips: { label: string; onRemove: () => void }[];
  count: string;
  dup: boolean;
  queryVal: string;
  onSetQuery: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPick: () => void;
  pickOpen: boolean;
  pickRows: { label: string; sel: boolean; onToggle: () => void }[];
  pickEmpty: boolean;
  effLabel: string;
  effOpen: boolean;
  onOpenEff: () => void;
  modeOpts: { label: string; mark: string; sel: boolean; onPick: () => void }[];
  isPct: boolean;
  pctVal: string;
  onSetPct: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  onClosePick: () => void;
  opacity?: number;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export default function RuleGroupEditor({
  groupNo,
  chips,
  count,
  dup,
  queryVal,
  onSetQuery,
  onOpenPick,
  pickOpen,
  pickRows,
  pickEmpty,
  effLabel,
  effOpen,
  onOpenEff,
  modeOpts,
  isPct,
  pctVal,
  onSetPct,
  onDelete,
  onClosePick,
  opacity,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: RuleGroupEditorProps) {
  return (
    <div
      className="card card-pad"
      style={{ opacity: opacity ?? 1, cursor: "grab" }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center between">
        <span className="fs14 fw500">
          群組 {groupNo}
          <span className="text3 fs12" style={{ marginLeft: 6 }}>{count}</span>
        </span>
        <button
          type="button"
          className="icon-btn-sm"
          onClick={onDelete}
          style={{ color: "var(--danger)" }}
        >
          <XIcon size={16} />
        </button>
      </div>

      {dup && (
        <div className="error-banner" style={{ marginTop: 8 }}>
          <span>條件重複</span>
        </div>
      )}

      <div className="combo" style={{ marginTop: 10 }}>
        <div className="flex wrap gap-6 items-center">
          {chips.map((c, i) => (
            <Chip key={i} label={c.label} kind="cond" suffix=" ✕" onClick={c.onRemove} />
          ))}
          <button type="button" className="combo-trigger-pill" onClick={onOpenPick}>
            + 條件
          </button>
        </div>

        {pickOpen && (
          <>
            <div className="picker-backdrop" onClick={onClosePick} />
            <div className="picker-panel" style={{ marginTop: 6 }}>
              <input
                className="input input--sm"
                placeholder="搜尋條件…"
                value={queryVal}
                onChange={onSetQuery}
                autoFocus
              />
              {pickEmpty ? (
                <div className="picker-empty">無可用條件</div>
              ) : (
                pickRows.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    className={`picker-row${r.sel ? " is-sel" : ""}`}
                    onClick={r.onToggle}
                  >
                    <span>{r.label}</span>
                    {r.sel && <span>✓</span>}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-8" style={{ marginTop: 10 }}>
        <span className="fs14 text2">效果：</span>
        <div className="combo" style={{ flex: 1 }}>
          <button type="button" className="combo-trigger-pill" onClick={onOpenEff}>
            {effLabel}
          </button>
          {effOpen && (
            <>
              <div className="picker-backdrop" onClick={onClosePick} />
              <div className="picker-panel">
                {modeOpts.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    className={`picker-row${m.sel ? " is-sel" : ""}`}
                    onClick={m.onPick}
                  >
                    <span>{m.mark} {m.label}</span>
                    {m.sel && <span>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {isPct && (
        <div className="flex items-center gap-8" style={{ marginTop: 8 }}>
          <span className="fs14 text2">比例：</span>
          <input
            className="input input--sm"
            style={{ width: 90, textAlign: "right" }}
            value={pctVal}
            onChange={onSetPct}
            placeholder="0"
          />
          <span className="fs14 text3">%</span>
        </div>
      )}
    </div>
  );
}
