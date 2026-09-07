"use client";

interface ChipProps {
  label: string;
  kind: "item" | "cond";
  selected?: boolean;
  md?: boolean;
  hash?: boolean;
  onClick?: () => void;
  suffix?: string;
  className?: string;
}

export default function Chip({
  label,
  kind,
  selected,
  md,
  hash,
  onClick,
  suffix,
  className = "",
}: ChipProps) {
  const cls = [
    "chip",
    kind === "item" ? "chip-item" : "chip-cond",
    md && "chip-md",
    selected && "is-sel",
    onClick && "chip-btn",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} onClick={onClick} role={onClick ? "button" : undefined}>
      {hash && "#"}{label}{suffix && <span>{suffix}</span>}
    </span>
  );
}
