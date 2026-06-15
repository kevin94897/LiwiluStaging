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

/**
 * Validates a Carné de Extranjería (CE): 9 to 12 digits, only numbers.
 */
export const CE_REGEX = /^[0-9]{9,12}$/;

/**
 * Validates a Pasaporte (Perú): 1 letter + 7 numbers.
 */
export const PASSPORT_REGEX = /^[a-zA-Z][0-9]{7}$/;


export const validateDNI = (dni: string) => DNI_REGEX.test(dni);
export const validateRUC = (ruc: string) => RUC_REGEX.test(ruc);
export const validateCE = (ce: string) => CE_REGEX.test(ce);
export const validatePassport = (passport: string) => PASSPORT_REGEX.test(passport);

export const dniValidation = z
    .string()
    .min(1, "El DNI es obligatorio")
    .regex(DNI_REGEX, "El DNI debe tener 8 dígitos numéricos");

export const rucValidation = z
    .string()
    .min(1, "El RUC es obligatorio")
    .regex(RUC_REGEX, "El RUC debe tener 11 dígitos y comenzar con 10, 15 o 20");

// Helper for conditional document validation
export const validateDocument = (type: string, value: string) => {
    if (type === 'DNI') return validateDNI(value);
    if (type === 'RUC') return validateRUC(value);
    if (type === 'CE') return validateCE(value);
    if (type === 'PASAPORTE') return validatePassport(value);
    return false;
};

export const getDocumentErrorMessage = (type: string) => {
    if (type === 'DNI') return "El DNI debe tener 8 dígitos numéricos";
    if (type === 'RUC') return "El RUC debe tener 11 dígitos y comenzar con 10, 15 o 20";
    if (type === 'CE') return "El Carné de Extranjería debe contener entre 9 y 12 dígitos";
    if (type === 'PASAPORTE') return "El pasaporte debe tener 1 letra y 7 números (ej. P1234567)";
    return "Seleccione un tipo de documento";
};
