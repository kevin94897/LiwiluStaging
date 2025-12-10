import React, { forwardRef } from 'react';
import { PiWarningCircleFill } from 'react-icons/pi';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
    options?: { value: string | number; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', containerClassName = '', error, label, id, disabled, children, options, ...props }, ref) => {
        return (
            <div className={`w-full ${containerClassName}`}>
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                        {label}
                    </label>
                )}
                <select
                    id={id}
                    ref={ref}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3 border-2 rounded-sm transition-all duration-200 outline-none appearance-none bg-white
                        disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                        ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 hover:border-green-400'
                        }
                        ${className}
                    `.trim().replace(/\s+/g, ' ')}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                    }}
                    {...props}
                >
                    {children}
                    {!children && options && options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                        <PiWarningCircleFill size={14} /> {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
