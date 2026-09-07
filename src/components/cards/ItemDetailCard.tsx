"use client";

import { EditIcon, TrashIcon, CheckIcon, XIcon } from "@/components/icons";
import Chip from "@/components/ui/Chip";

interface ItemDetailCardProps {
  no: number;
  name: string;
  amountText: string;
  tags: string[];
  note: string;
  readOnly: boolean;
  canStartEdit: boolean;
  nameVal: string;
  amountVal: string;
  noteVal: string;
  nameErr: boolean;
  amountBad: boolean;
  amountEmpty: boolean;
  alertOutline: string;
  hasNote: boolean;
  newRow: boolean;
  onStartEdit: () => void;
  onDoneEdit: () => void;
  onCancelAdd: () => void;
  onAskRemove: () => void;
  onSetName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetAmount: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetNote: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tagPicker: React.ReactNode;
  shareBlock: React.ReactNode;
}

export default function ItemDetailCard({
  no,
  name,
  amountText,
  tags,
  note,
  readOnly,
  canStartEdit,
  nameVal,
  amountVal,
  noteVal,
  nameErr,
  amountBad,
  amountEmpty,
  alertOutline,
  hasNote,
  newRow,
  onStartEdit,
  onDoneEdit,
  onCancelAdd,
  onAskRemove,
  onSetName,
  onSetAmount,
  onSetNote,
  tagPicker,
  shareBlock,
}: ItemDetailCardProps) {
  if (readOnly) {
    return (
      <div className="card" style={alertOutline ? { borderColor: alertOutline } : undefined}>
        <div className="card-pad">
          <div className="flex items-center between">
            <div className="flex items-center gap-8">
              <span className="fs12 text3">#{no}</span>
              <span className="fs16 fw700">{name}</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="fs16 fw500">{amountText}</span>
              {canStartEdit && (
                <button type="button" className="icon-btn-sm" onClick={onStartEdit}>
                  <EditIcon size={16} />
                </button>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex wrap gap-4" style={{ marginTop: 6 }}>
              {tags.map((t) => (
                <Chip key={t} label={t} kind="item" />
              ))}
            </div>
          )}

          {hasNote && <p className="fs12 text3" style={{ marginTop: 4 }}>{note}</p>}
          {shareBlock}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={alertOutline ? { borderColor: alertOutline } : undefined}>
      <div className="card-pad">
        <div className="flex items-center between">
          <span className="fs12 text3">#{no}{newRow ? " 新增明細" : " 編輯中"}</span>
          <div className="flex items-center gap-6">
            <button type="button" className="icon-btn-sm" onClick={onAskRemove} style={{ color: "var(--danger)" }}>
              <TrashIcon size={16} />
            </button>
            <button type="button" className="icon-btn-sm" onClick={onCancelAdd}>
              <XIcon size={16} />
            </button>
            <button type="button" className="icon-btn-sm icon-btn-sm--fill" onClick={onDoneEdit}>
              <CheckIcon size={16} />
            </button>
          </div>
        </div>

        <div className="flex-col gap-10" style={{ marginTop: 12 }}>
          <div className="field">
            <label className="field-label">名稱</label>
            <input
              className={`input${nameErr ? " input--err" : ""}`}
              value={nameVal}
              onChange={onSetName}
              placeholder="品項名稱"
            />
          </div>

          <div className="field">
            <label className="field-label">金額</label>
            <input
              className={`input${amountBad || amountEmpty ? " input--err" : ""}`}
              value={amountVal}
              onChange={onSetAmount}
              placeholder="0"
              inputMode="decimal"
            />
          </div>

          <div className="field">
            <label className="field-label">備註</label>
            <input className="input" value={noteVal} onChange={onSetNote} placeholder="備註（選填）" />
          </div>
        </div>

        {tagPicker}
        {shareBlock}
      </div>
    </div>
  );
}
