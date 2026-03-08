import React, { forwardRef } from 'react';
import { PiWarningCircleFill } from 'react-icons/pi';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = '', containerClassName = '', error, label, id, disabled, rows = 4, ...props }, ref) => {
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
                <textarea
                    id={id}
                    ref={ref}
                    rows={rows}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3 border-2 rounded-sm transition-all duration-200 outline-none resize-none
                        disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                        placeholder:text-gray-400
                        ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 hover:border-green-400'
                        }
                        ${className}
                    `.trim().replace(/\s+/g, ' ')}
                    {...props}
                />
                {error && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                        <PiWarningCircleFill size={14} /> {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
