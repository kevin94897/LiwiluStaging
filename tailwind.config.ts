import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
			},
			colors: {
				primary: {
					DEFAULT: '#10B981',
					hover: '#059669',
					light: '#45B171',
					dark: '#047857',
				},
				secondary: {
					DEFAULT: '#0F766E',
					hover: '#115E59',
				},
				success: '#10B981',
				error: '#EF4444',
				warning: '#F59E0B',
				info: '#3B82F6',
				neutral: {
					black: '#1F2937',
					'gray-dark': '#374151',
					gray: '#6B7280',
					'gray-light': '#D1D5DB',
					'gray-lighter': '#F3F4F6',
					white: '#FFFFFF',
				},
				bg: {
					success: '#D1FAE5',
					error: '#FEE2E2',
					disabled: '#F3F4F6',
				},
				border: {
					DEFAULT: '#E5E7EB',
					error: '#FCA5A5',
					success: '#6EE7B7',
				},
			},
			borderRadius: {
				xs: '4px',
				sm: '8px',
				md: '12px',
				lg: '16px',
				xl: '24px',
				full: '9999px',
			},
			boxShadow: {
				sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
				md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
				lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
				xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
			},
		},
	},
	plugins: [],
};
export default config;
