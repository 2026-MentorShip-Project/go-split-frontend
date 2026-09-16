"use client";

interface IconButtonProps {
  variant?: "default" | "primary" | "soft" | "danger" | "sm" | "sm-fill" | "sm-disabled";
  title?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

const variantClass: Record<string, string> = {
  default: "icon-btn",
  primary: "icon-btn icon-btn--primary",
  soft: "icon-btn icon-btn--soft",
  danger: "icon-btn icon-btn--danger",
  sm: "icon-btn-sm",
  "sm-fill": "icon-btn-sm icon-btn-sm--fill",
  "sm-disabled": "icon-btn-sm icon-btn-sm--disabled",
};

export default function IconButton({
  variant = "default",
  title,
  onClick,
  children,
  className = "",
  style,
  disabled,
}: IconButtonProps) {
  return (
    <button
      className={`${variantClass[variant] ?? "icon-btn"} ${className}`.trim()}
      title={title}
      onClick={onClick}
      style={style}
      disabled={disabled || variant === "sm-disabled"}
    >
      {children}
    </button>
  );
}
