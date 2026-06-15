import { toast, ToastOptions } from 'react-hot-toast';

/**
 * Standard toast configuration for the Liwilu project.
 */
const defaultOptions: ToastOptions = {
    duration: 2000,
    position: 'bottom-right',
    style: {
        fontSize: '14px',
        fontFamily: 'Outfit, sans-serif',
        borderRadius: '8px',
        background: '#fff',
        color: '#333',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
};

/**
 * Utility to display standardized toast notifications.
 * 
 * @param message - Message to display
 * @param type - Type of toast: 'success', 'error', or 'loading'
 * @param options - Optional overrides for the toast
 */
export const showToast = (
    message: string,
    type: 'success' | 'error' | 'loading' = 'success',
    options?: ToastOptions
) => {
    const combinedOptions = { ...defaultOptions, ...options };

    switch (type) {
        case 'success':
            return toast.success(message, combinedOptions);
        case 'error':
            return toast.error(message, combinedOptions);
        case 'loading':
            return toast.loading(message, combinedOptions);
        default:
            return toast(message, combinedOptions);
    }
};

/**
 * Dismisses a specific toast or all toasts.
 * @param toastId - Optional ID of the toast to dismiss
 */
export const dismissToast = (toastId?: string) => {
    toast.dismiss(toastId);
};
