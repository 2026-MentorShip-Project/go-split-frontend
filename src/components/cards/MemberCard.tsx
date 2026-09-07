"use client";

import { EditIcon, TrashIcon, CheckIcon } from "@/components/icons";
import Chip from "@/components/ui/Chip";

interface MemberCardProps {
  name: string;
  rawName: string;
  role: string;
  tagText: string;
  hasTags: boolean;
  canEdit: boolean;
  editing: boolean;
  removable: boolean;
  login: string;
  onStartEdit: () => void;
  onDoneEdit: () => void;
  onSetName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAskRemove: () => void;
  onOpen: () => void;
  roleOpts: { label: string; sel: boolean; locked: boolean; onPick: () => void }[];
  condChips: { label: string; onRemove: () => void }[];
  condLocked: boolean;
  noConds: boolean;
  condQueryVal: string;
  onSetCondQuery: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenCondPick: () => void;
  onCloseCondPick: () => void;
  condPickOpen: boolean;
  condPickRows: { label: string; sel: boolean; onToggle: () => void }[];
  condPickEmpty: boolean;
  noteVal: string;
  onSetNote: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MemberCard({
  name,
  rawName,
  role,
  tagText,
  hasTags,
  canEdit,
  editing,
  removable,
  login,
  onStartEdit,
  onDoneEdit,
  onSetName,
  onAskRemove,
  onOpen,
  roleOpts,
  condChips,
  condLocked,
  noConds,
  condQueryVal,
  onSetCondQuery,
  onOpenCondPick,
  onCloseCondPick,
  condPickOpen,
  condPickRows,
  condPickEmpty,
  noteVal,
  onSetNote,
}: MemberCardProps) {
  if (!editing) {
    return (
      <div className="card card-pad" onClick={canEdit ? onOpen : undefined} style={{ cursor: canEdit ? "pointer" : undefined }}>
        <div className="flex items-center between">
          <div className="flex-col gap-4">
            <span className="fs16 fw700">{name}</span>
            <span className="fs12 text3">{role}</span>
          </div>
          <div className="flex items-center gap-6">
            {hasTags && <span className="fs12 text3">{tagText}</span>}
            {canEdit && (
              <button type="button" className="icon-btn-sm" onClick={(e) => { e.stopPropagation(); onStartEdit(); }}>
                <EditIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-pad">
      <div className="flex items-center between">
        <span className="fs14 fw500">{login || name}</span>
        <div className="flex items-center gap-6">
          {removable && (
            <button type="button" className="icon-btn-sm" onClick={onAskRemove} style={{ color: "var(--danger)" }}>
              <TrashIcon size={16} />
            </button>
          )}
          <button type="button" className="icon-btn-sm icon-btn-sm--fill" onClick={onDoneEdit}>
            <CheckIcon size={16} />
          </button>
        </div>
      </div>

      <div className="flex-col gap-10" style={{ marginTop: 12 }}>
        <div className="field">
          <label className="field-label">名稱</label>
          <input className="input" value={rawName} onChange={onSetName} />
        </div>

        <div className="field">
          <label className="field-label">角色</label>
          <div className="flex wrap gap-6">
            {roleOpts.map((o) => (
              <button
                key={o.label}
                type="button"
                className={`pill-toggle${o.sel ? " is-sel" : ""}`}
                onClick={o.onPick}
                disabled={o.locked}
                style={o.locked ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">條件標籤</label>
          {condLocked ? (
            <span className="fs12 text3">無法編輯</span>
          ) : (
            <div className="combo">
              <div className="flex wrap gap-6 items-center">
                {condChips.map((c, i) => (
                  <Chip key={i} label={c.label} kind="cond" suffix=" ✕" onClick={c.onRemove} />
                ))}
                {noConds ? (
                  <span className="fs12 text3">無可用條件</span>
                ) : (
                  <button type="button" className="combo-trigger-pill" onClick={onOpenCondPick}>
                    + 條件
                  </button>
                )}
              </div>

              {condPickOpen && (
                <>
                  <div className="picker-backdrop" onClick={onCloseCondPick} />
                  <div className="picker-panel">
                    <input
                      className="input input--sm"
                      placeholder="搜尋條件…"
                      value={condQueryVal}
                      onChange={onSetCondQuery}
                      autoFocus
                    />
                    {condPickEmpty ? (
                      <div className="picker-empty">無符合條件</div>
                    ) : (
                      condPickRows.map((r) => (
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
          )}
        </div>

        <div className="field">
          <label className="field-label">備註</label>
          <input className="input" value={noteVal} onChange={onSetNote} placeholder="備註…" />
        </div>
      </div>
    </div>
  );
}
