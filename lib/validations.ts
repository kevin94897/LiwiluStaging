// lib/validations.ts
import { z } from "zod";

/**
 * Validates a DNI (Perú): 8 digits, only numbers.
 */
export const DNI_REGEX = /^[0-9]{8}$/;

/**
 * Validates a RUC (Perú): 11 digits, starts with 10, 15 or 20.
 */
export const RUC_REGEX = /^(10|15|20)[0-9]{9}$/;

export const validateDNI = (dni: string) => DNI_REGEX.test(dni);
export const validateRUC = (ruc: string) => RUC_REGEX.test(ruc);

export const dniValidation = z
    .string()
    .min(1, "El DNI es obligatorio")
    .regex(DNI_REGEX, "El DNI debe tener exactamente 8 dígitos numéricos");

export const rucValidation = z
    .string()
    .min(1, "El RUC es obligatorio")
    .regex(RUC_REGEX, "El RUC debe tener 11 dígitos y empezar con 10, 15 o 20");

// Helper for conditional document validation
export const validateDocument = (type: string, value: string) => {
    if (type === 'DNI') return validateDNI(value);
    if (type === 'RUC') return validateRUC(value);
    // For other types (CE, Pasaporte), we can be more permissive or add specific rules if needed
    return value.length >= 8 && value.length <= 15;
};

export const getDocumentErrorMessage = (type: string) => {
    if (type === 'DNI') return "El DNI debe tener 8 números";
    if (type === 'RUC') return "El RUC debe tener 11 números y empezar con 10, 15 o 20";
    return "Número de documento inválido";
};
