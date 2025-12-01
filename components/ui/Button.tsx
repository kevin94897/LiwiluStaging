// components/ui/Button.tsx
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
            ...props
        },
        ref
    ) => {
        // Estilos base
        const baseStyles = 'font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2';

        // Variantes de color
        const variants = {
            primary: 'bg-primary hover:bg-green-600 text-white shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed',
            secondary: 'bg-white hover:bg-gray-50 text-green-600 border-2 border-green-500 hover:border-green-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed',
            outline: 'bg-transparent hover:bg-green-50 text-green-600 border-2 border-green-500 hover:border-green-600 disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed'
        };

        // Tamaños
        const sizes = {
            sm: 'px-4 py-2 text-sm rounded-full',
            md: 'px-6 py-3 text-base rounded-full',
            lg: 'px-8 py-4 text-lg rounded-full'
        };

        // Ancho completo
        const widthClass = fullWidth ? 'w-full' : '';

        const buttonClasses = `
      ${baseStyles}
      ${variants[variant]}
      ${sizes[size]}
      ${widthClass}
      ${className}
    `.trim().replace(/\s+/g, ' ');

        return (
            <button
                ref={ref}
                className={buttonClasses}
                disabled={disabled}
                {...props}
            >
                {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                <span>{children}</span>
                {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;


// ============================================
// EJEMPLOS DE USO
// ============================================

/*
// Ejemplo 1: Botón "Agregar al carrito" (Secondary)
<Button variant="secondary" size="md">
  Agregar al carrito
</Button>

// Ejemplo 2: Botón "Seguir comprando" (Outline)
<Button variant="outline" size="md">
  Seguir comprando
</Button>

// Ejemplo 3: Botón "Ir a carrito" (Primary)
<Button variant="primary" size="md">
  Ir a carrito
</Button>

// Ejemplo 4: Botón con icono izquierdo
<Button 
  variant="primary" 
  size="md"
  leftIcon={
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  }
>
  Agregar al carrito
</Button>

// Ejemplo 5: Botón con icono derecho
<Button 
  variant="primary" 
  size="md"
  rightIcon={
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  }
>
  Continuar
</Button>

// Ejemplo 6: Botón de ancho completo
<Button variant="primary" size="lg" fullWidth>
  Finalizar compra
</Button>

// Ejemplo 7: Botón deshabilitado
<Button variant="primary" size="md" disabled>
  Agotado
</Button>

// Ejemplo 8: Botón pequeño
<Button variant="secondary" size="sm">
  Ver más
</Button>

// Ejemplo 9: Botón grande
<Button variant="primary" size="lg">
  Comprar ahora
</Button>

// Ejemplo 10: Con className personalizado
<Button 
  variant="primary" 
  size="md"
  className="transform hover:scale-105"
>
  Botón especial
</Button>
*/