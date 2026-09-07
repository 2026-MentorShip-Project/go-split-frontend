"use client";

interface TagManageRowProps {
  label: string;
  editing: boolean;
  dupEditing: boolean;
  menu: boolean;
  idle: boolean;
  inputVal: string;
  onSetVal: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCommit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
}

export default function TagManageRow({
  label,
  editing,
  dupEditing,
  menu,
  idle,
  inputVal,
  onSetVal,
  onCommit,
  onKeyDown,
  onOpenMenu,
  onCloseMenu,
  onStartEdit,
  onDelete,
}: TagManageRowProps) {
  if (editing) {
    return (
      <div className="flex items-center gap-8">
        <input
          className="input input--sm"
          style={{
            borderRadius: 99,
            border: "1px solid #E4C374",
            background: "var(--tag-item-bg)",
            color: "var(--tag-item-fg)",
            flex: 1,
          }}
          value={inputVal}
          onChange={onSetVal}
          onKeyDown={onKeyDown}
          autoFocus
        />
        {dupEditing && (
          <span className="fs12" style={{ color: "var(--danger)" }}>重複</span>
        )}
        <button type="button" className="btn-link" onClick={onCommit}>
          確認
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-8 badge-tag-pos">
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 12px",
          borderRadius: 99,
          border: "1px solid #E4C374",
          background: "var(--tag-item-bg)",
          color: "var(--tag-item-fg)",
          fontSize: 14,
          cursor: idle ? "pointer" : undefined,
        }}
        onClick={idle ? onOpenMenu : undefined}
      >
        {label}
      </span>

      {menu && (
        <>
          <div className="picker-backdrop" onClick={onCloseMenu} />
          <div className="dropdown-menu" style={{ top: "100%", left: 0, marginTop: 4 }}>
            <button type="button" onClick={onStartEdit}>編輯</button>
            <button type="button" onClick={onDelete} style={{ color: "var(--danger)" }}>刪除</button>
          </div>
        </>
      )}
    </div>
  );
}
