"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

type InputMode = "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";

interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, "inputMode"> {
  error?: boolean;
  small?: boolean;
  inputMode?: InputMode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, small, className = "", ...props }, ref) => {
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
        ref={ref}
        className={cls}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
