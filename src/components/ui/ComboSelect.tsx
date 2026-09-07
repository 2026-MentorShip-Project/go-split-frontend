"use client";

interface ComboSelectProps {
  label: string;
  placeholder?: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: React.ReactNode;
  pill?: boolean;
}

export default function ComboSelect({
  label,
  placeholder,
  open,
  onOpen,
  onClose,
  children,
  pill,
}: ComboSelectProps) {
  return (
    <div className="combo">
      <button
        className={pill ? "combo-trigger-pill" : "combo-trigger"}
        onClick={open ? onClose : onOpen}
      >
        {label || placeholder}
      </button>
      {open && (
        <>
          <div className="picker-backdrop" onClick={onClose} />
          <div className="picker-panel">{children}</div>
        </>
      )}
    </div>
  );
}
