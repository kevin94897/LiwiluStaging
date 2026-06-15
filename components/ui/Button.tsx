// components/ui/Button.tsx
import React from "react";
import { Slot } from "@radix-ui/react-slot";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outline_white";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  disabled?: boolean;
  asChild?: boolean;
}

// ✅ Union type en lugar de extends para evitar conflictos
export type ButtonProps = ButtonBaseProps &
  (
    | React.ButtonHTMLAttributes<HTMLButtonElement>
    | React.AnchorHTMLAttributes<HTMLAnchorElement>
  );

type CombinedRef = HTMLButtonElement | HTMLAnchorElement;

const Button = React.forwardRef<CombinedRef, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      children,
      leftIcon,
      rightIcon,
      className = "",
      disabled = false,
      href,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    // Estilos base
    const baseStyles =
      "font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 text-center";

    // Variantes de color
    const variants = {
      primary: `
                bg-primary
                hover:bg-primary-dark
                text-neutral-white
                disabled:bg-neutral-grayLight
                disabled:text-white
                disabled:cursor-not-allowed
            `
        .trim()
        .replace(/\s+/g, " "),

      secondary: `
                bg-neutral-white
                hover:bg-primary-dark
                text-primary
                hover:text-white
                hover:border-primary-dark
                disabled:bg-neutral-grayLight
                disabled:text-white
                disabled:cursor-not-allowed
            `
        .trim()
        .replace(/\s+/g, " "),

      outline: `
                bg-transparent
                text-primary
                border-2 border-primary
                hover:text-primary-dark
                hover:border-primary-dark
                disabled:bg-neutral-grayLight
                disabled:text-white
                disabled:border-neutral-grayLight
                disabled:cursor-not-allowed
            `
        .trim()
        .replace(/\s+/g, " "),

      outline_white: `
                text-white
                border-2 border-white
                hover:border-transparent
                hover:text-primary
                hover:bg-white
                disabled:bg-neutral-grayLight
                disabled:text-white
                disabled:border-neutral-grayLight
                disabled:cursor-not-allowed
            `
        .trim()
        .replace(/\s+/g, " "),
    };

    // Tamaños
    const sizes = {
      sm: "px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm rounded-full",
      md: "px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base rounded-full",
      lg: "px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-full",
    };

    // Ancho completo
    const widthClass = fullWidth ? "w-full" : "";

    // Deshabilitar eventos si es enlace deshabilitado
    const pointerEventsClass = disabled && href ? "pointer-events-none" : "";

    const buttonClasses = `
            ${baseStyles}
            ${variants[variant]}
            ${sizes[size]}
            ${widthClass}
            ${className}
            ${pointerEventsClass}
        `
      .trim()
      .replace(/\s+/g, " ");

    const content = (
      <>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </>
    );

    // Renderizado condicional
    const Comp = asChild ? Slot : href ? "a" : "button";

    return (
      <Comp
        ref={ref as any}
        className={buttonClasses}
        {...(href ? { href, "aria-disabled": disabled } : { disabled })}
        {...(props as any)}
      >
        {asChild ? children : content}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export default Button;
