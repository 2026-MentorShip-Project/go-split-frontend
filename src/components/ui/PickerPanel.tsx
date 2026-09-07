"use client";

interface PickerPanelProps {
  items: { label: string; selected: boolean; disabled?: boolean; onClick: () => void }[];
  empty?: boolean;
  emptyText?: string;
  right?: boolean;
}

export default function PickerPanel({ items, empty, emptyText, right }: PickerPanelProps) {
  if (empty || items.length === 0) {
    return (
      <div className="picker-panel" style={right ? { right: 0 } : undefined}>
        <div className="picker-empty">{emptyText ?? "無選項"}</div>
      </div>
    );
  }

  return (
    <div className="picker-panel" style={right ? { right: 0 } : undefined}>
      {items.map((item) => (
        <button
          key={item.label}
          className={`picker-row${item.selected ? " is-sel" : ""}${item.disabled ? " is-used" : ""}`}
          onClick={item.onClick}
          disabled={item.disabled}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
