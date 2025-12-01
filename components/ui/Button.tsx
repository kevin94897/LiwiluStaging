// components/ui/Button.tsx
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

// 1. Unimos las propiedades del botón y del ancla (<a>)
type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type ButtonElementProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonBaseProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

// Interfaz para el componente final: puede tener propiedades de botón Y/O de enlace
export interface ButtonProps extends ButtonBaseProps, LinkProps, ButtonElementProps { }

// 2. Definimos el tipo de referencia que puede ser un botón o un ancla
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
            disabled = false,
            href, // 3. Desestructuramos href
            ...props
        },
        ref
    ) => {
        // Estilos base
        const baseStyles = 'font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 text-center';

        // Variantes de color
        const variants = {
            primary: 'bg-primary hover:bg-green-600 text-white shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed',
            secondary: 'bg-white hover:bg-gray-50 text-green-600 border-2 border-green-500 hover:border-green-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed',
            outline: 'bg-transparent hover:bg-green-50 text-green-600 border-2 border-green-500 hover:border-green-600 disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed'
        };

        // Tamaños
        const sizes = {
            sm: 'px-4 py-2 text-sm rounded-full',
            md: 'px-8 py-3 text-base rounded-full',
            lg: 'px-8 py-4 text-lg rounded-full'
        };

        // Ancho completo
        const widthClass = fullWidth ? 'w-full' : '';

        // Deshabilitar si se usa href y la prop disabled es true
        const pointerEventsClass = disabled ? 'pointer-events-none' : '';

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

        // 4. Renderizado condicional
        if (href) {
            // Renderizar como <a>
            return (
                <a
                    ref={ref as React.ForwardedRef<HTMLAnchorElement>} // Casteo seguro
                    href={href}
                    className={buttonClasses}
                    aria-disabled={disabled} // Accesibilidad para enlaces deshabilitados
                    {...(props as LinkProps)} // Aseguramos pasar props de enlace
                >
                    {content}
                </a>
            );
        }

        // Renderizar como <button>
        return (
            <button
                ref={ref as React.ForwardedRef<HTMLButtonElement>} // Casteo seguro
                className={buttonClasses}
                disabled={disabled}
                {...(props as ButtonElementProps)} // Aseguramos pasar props de botón
            >
                {content}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;