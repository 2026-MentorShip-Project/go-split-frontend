"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "pill" | "link" | "cta";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  pill: "btn-pill",
  link: "btn-link",
  cta: "btn-cta-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`btn ${variantClass[variant]} ${className}`.trim()}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
