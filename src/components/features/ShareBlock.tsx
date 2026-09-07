"use client";

import Dot from "@/components/ui/Dot";
import { LockIcon, UnlockIcon } from "@/components/icons";

interface VisibleShare {
  name: string;
  amount: string;
  hasCond: boolean;
  condText: string;
}

interface EditRow {
  id: string;
  name: string;
  on: boolean;
  hasCond: boolean;
  condText: string;
  amountVal: string;
  amountPh: string;
  locked: boolean;
  onToggle: () => void;
  onToggleLock: () => void;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ShareBlockProps {
  editing: boolean;
  shareCount: number;
  shareTitle: string;
  caret: string;
  expandable: boolean;
  onToggleExpand?: () => void;
  showMore: boolean;
  expandLabel: string;
  visibleShares: VisibleShare[];
  editRows?: EditRow[];
  errOpen?: boolean;
  errText?: string;
  onToggleEdit?: () => void;
  readOnly?: boolean;
}

export default function ShareBlock({
  editing,
  shareCount,
  shareTitle,
  caret,
  expandable,
  onToggleExpand,
  showMore,
  expandLabel,
  visibleShares,
  editRows,
  errOpen,
  errText,
  onToggleEdit,
  readOnly,
}: ShareBlockProps) {
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-pad">
        <div className="flex items-center between">
          <span className="fs14 fw500">
            {shareTitle}
            <span className="text3 fs12" style={{ marginLeft: 6 }}>
              ({shareCount})
            </span>
          </span>

          <div className="flex items-center gap-8">
            {expandable && (
              <button
                type="button"
                className="btn-link btn-link--muted"
                onClick={onToggleExpand}
              >
                {caret} {expandLabel}
              </button>
            )}
            {!readOnly && (
              <button
                type="button"
                className="btn-link"
                onClick={onToggleEdit}
              >
                {editing ? "完成" : "編輯"}
              </button>
            )}
          </div>
        </div>

        {!editing && (
          <div className="grid-cards" style={{ marginTop: 10 }}>
            {visibleShares.map((s, i) => (
              <div key={i} className="flex items-center between" style={{ padding: "6px 0" }}>
                <div className="flex items-center gap-6">
                  <span className="fs14">{s.name}</span>
                  {s.hasCond && (
                    <span className="chip chip-cond" style={{ fontSize: 11 }}>
                      {s.condText}
                    </span>
                  )}
                </div>
                <span className="fs14 fw500">{s.amount}</span>
              </div>
            ))}
          </div>
        )}

        {showMore && !editing && (
          <button
            type="button"
            className="btn-link btn-link--muted"
            style={{ marginTop: 6 }}
            onClick={onToggleExpand}
          >
            {expandLabel}
          </button>
        )}

        {editing && editRows && (
          <div className="flex-col gap-6" style={{ marginTop: 10 }}>
            {editRows.map((r) => (
              <div key={r.id} className="flex items-center gap-8" style={{ padding: "4px 0" }}>
                <button type="button" onClick={r.onToggle} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                  <Dot selected={r.on} />
                </button>

                <div className="grow flex-col" style={{ gap: 2 }}>
                  <span className="fs14">{r.name}</span>
                  {r.hasCond && (
                    <span className="chip chip-cond" style={{ fontSize: 11 }}>
                      {r.condText}
                    </span>
                  )}
                </div>

                <input
                  className="input input--sm"
                  style={{ width: 90, textAlign: "right" }}
                  value={r.amountVal}
                  placeholder={r.amountPh}
                  onChange={r.onAmountChange}
                  disabled={!r.on}
                />

                <button
                  type="button"
                  onClick={r.onToggleLock}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text3)" }}
                >
                  {r.locked ? <LockIcon size={18} /> : <UnlockIcon size={18} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {errOpen && errText && (
          <div className="error-banner" style={{ marginTop: 10 }}>
            <span>{errText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
