"use client";

import { EditIcon, TrashIcon, CheckIcon, XIcon } from "@/components/icons";

interface DraftDetailCardProps {
  no: number;
  name: string;
  amount: string | number;
  note: string;
  nameText: string;
  amountText: string;
  readOnly: boolean;
  nameErr: boolean;
  amountBad: boolean;
  amountEmpty: boolean;
  alertOutline: string;
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

export default function DraftDetailCard({
  no,
  name,
  amount,
  note,
  nameText,
  amountText,
  readOnly,
  nameErr,
  amountBad,
  amountEmpty,
  alertOutline,
  onStartEdit,
  onDoneEdit,
  onCancelAdd,
  onAskRemove,
  onSetName,
  onSetAmount,
  onSetNote,
  tagPicker,
  shareBlock,
}: DraftDetailCardProps) {
  if (readOnly) {
    return (
      <div className="card" style={alertOutline ? { borderColor: alertOutline } : undefined}>
        <div className="card-pad">
          <div className="flex items-center between">
            <div className="flex items-center gap-8">
              <span className="fs12 text3">#{no}</span>
              <span className="fs16 fw700">{nameText}</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="fs16 fw500">{amountText}</span>
              <button type="button" className="icon-btn-sm" onClick={onStartEdit}>
                <EditIcon size={16} />
              </button>
            </div>
          </div>
          {note && <p className="fs12 text3" style={{ marginTop: 4 }}>{note}</p>}
          {tagPicker}
          {shareBlock}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={alertOutline ? { borderColor: alertOutline } : undefined}>
      <div className="card-pad">
        <div className="flex items-center between">
          <span className="fs12 text3">#{no} 新增明細</span>
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
              value={name}
              onChange={onSetName}
              placeholder="品項名稱"
            />
          </div>

          <div className="field">
            <label className="field-label">金額</label>
            <input
              className={`input${amountBad || amountEmpty ? " input--err" : ""}`}
              value={amount}
              onChange={onSetAmount}
              placeholder="0"
              inputMode="decimal"
            />
          </div>

          <div className="field">
            <label className="field-label">備註</label>
            <input className="input" value={note} onChange={onSetNote} placeholder="備註（選填）" />
          </div>
        </div>

        {tagPicker}
        {shareBlock}
      </div>
    </div>
  );
}
