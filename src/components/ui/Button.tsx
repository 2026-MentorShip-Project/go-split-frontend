"use client";

interface ButtonProps {
  variant?: "primary" | "secondary" | "pill" | "link" | "cta";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}

const variantClass: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  pill: "btn-pill",
  link: "btn-link",
  cta: "btn-cta-lg",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  onClick,
  disabled,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn ${variantClass[variant] ?? ""} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
