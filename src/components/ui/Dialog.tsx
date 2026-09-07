"use client";

interface DialogProps {
  title: string;
  body: string;
  danger?: boolean;
  onClose?: () => void;
  actions: React.ReactNode;
}

export default function Dialog({ title, body, danger, onClose, actions }: DialogProps) {
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="dialog-close" onClick={onClose}>
            ✕
          </button>
        )}
        <h2 className={`dialog-title${danger ? " dialog-title--danger" : ""}`}>{title}</h2>
        <p className="dialog-body">{body}</p>
        <div className="dialog-actions">{actions}</div>
      </div>
    </div>
  );
}
