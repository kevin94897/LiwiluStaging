// components/ui/Button.tsx
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'outline_white';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    href?: string;
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
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            children,
            leftIcon,
            rightIcon,
            className = '',
            // disabled = false,
            href,
            ...props
        },
        ref
    ) => {
        // Estilos base
        const baseStyles = 'font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 text-center';

        // Variantes de color
        const variants = {
            primary: `
                bg-primary
                hover:bg-primary-dark
                text-neutral-white
                disabled:bg-neutral-grayLight
                disabled:text-white
                disabled:cursor-not-allowed
            `.trim().replace(/\s+/g, ' '),

            secondary: `
                bg-neutral-white
                hover:bg-primary-dark
                text-primary
                hover:text-white
                hover:border-primary-dark
                disabled:bg-neutral-grayLight
                disabled:text-white
                disabled:cursor-not-allowed
            `.trim().replace(/\s+/g, ' '),

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
            `.trim().replace(/\s+/g, ' '),

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
            `.trim().replace(/\s+/g, ' ')
        };

        // Tamaños
        const sizes = {
            sm: 'px-4 py-3 text-sm rounded-full',
            md: 'px-8 py-3 text-base rounded-full',
            lg: 'px-8 py-4 text-lg rounded-full'
        };

        // Ancho completo
        const widthClass = fullWidth ? 'w-full' : '';

        // Deshabilitar eventos si es enlace deshabilitado
        const pointerEventsClass = disabled && href ? 'pointer-events-none' : '';

        const buttonClasses = `
            ${baseStyles}
            ${variants[variant]}
            ${sizes[size]}
            ${widthClass}
            ${className}
            ${pointerEventsClass}
        `.trim().replace(/\s+/g, ' ');

        const content = (
            <>
                {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                <span>{children}</span>
                {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </>
        );

        // Renderizado condicional
        if (href) {
            return (
                <a
                    ref={ref as React.ForwardedRef<HTMLAnchorElement>}
                    href={href}
                    className={buttonClasses}
                    aria-disabled={disabled}
                    {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                >
                    {content}
                </a>
            );
        }

        return (
            <button
                ref={ref as React.ForwardedRef<HTMLButtonElement>}
                className={buttonClasses}
                disabled={disabled}
                {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            >
                {content}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;