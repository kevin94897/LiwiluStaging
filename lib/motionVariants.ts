// lib/motionVariants.ts
import { Variants } from 'framer-motion';

// ============================================
// VARIANTES DE FADE
// ============================================

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -60 },
    visible: { opacity: 1, y: 0 }
};

// ============================================
// VARIANTES DE SLIDE
// ============================================

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0 }
};

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 }
};

// ============================================
// VARIANTES DE SCALE
// ============================================

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
};

export const scaleUp: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
};

// ============================================
// VARIANTES PARA PRODUCTOS/CARDS
// ============================================

export const cardHover: Variants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 }
};

export const cardTap: Variants = {
    initial: { scale: 1 },
    tap: { scale: 0.95 }
};

// ============================================
// VARIANTES PARA CONTAINERS (STAGGER)
// ============================================

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

export const staggerContainerFast: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

export const staggerContainerSlow: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3
        }
    }
};

// ============================================
// VARIANTES PARA ITEMS EN STAGGER
// ============================================

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export const staggerItemLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

export const staggerItemRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
};

// ============================================
// TRANSICIONES PREDEFINIDAS
// ============================================

export const transitions = {
    smooth: { duration: 0.6, ease: 'easeOut' },
    fast: { duration: 0.3, ease: 'easeOut' },
    slow: { duration: 0.8, ease: 'easeOut' },
    bounce: { type: 'spring', stiffness: 300, damping: 20 },
    elastic: { type: 'spring', stiffness: 100, damping: 10 }
};

// ============================================
// CONFIGURACIONES DE VIEWPORT
// ============================================

export const viewportConfig = {
    once: true,
    amount: 0.2
};

export const viewportConfigFull = {
    once: true,
    amount: 0.5
};

// ============================================
// ANIMACIONES PARA BOTONES
// ============================================

export const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
};

export const buttonPulse = {
    hover: {
        scale: 1.05,
        transition: {
            repeat: Infinity,
            repeatType: 'reverse' as const,
            duration: 0.5
        }
    }
};

// ============================================
// ANIMACIONES PARA SLIDERS
// ============================================

export const slideVariant: Variants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        x: -100,
        transition: { duration: 0.5, ease: 'easeIn' }
    }
};