"use client";

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: boolean;
  small?: boolean;
  type?: string;
  inputMode?: string;
  className?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
}

export default function Input({
  value,
  onChange,
  placeholder,
  error,
  small,
  type = "text",
  inputMode,
  className = "",
  readOnly,
  style,
}: InputProps) {
  const cls = [
    "input",
    small && "input--sm",
    error && "input--err",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      type={type}
      inputMode={inputMode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
      className={cls}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      style={style}
    />
  );
}
