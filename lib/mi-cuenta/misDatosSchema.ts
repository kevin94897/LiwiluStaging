// lib/misDatosSchema.ts
import { z } from "zod";
import { DNI_REGEX, RUC_REGEX, CE_REGEX, PASSPORT_REGEX } from "../validations";

export const misDatosSchema = z.object({
    nombre: z
        .string()
        .min(1, "El nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.-]+$/, "El nombre solo puede contener letras, puntos, comas y guiones"),


    apellido: z
        .string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.-]+$/, "El apellido solo puede contener letras, puntos, comas y guiones")
        .optional()
        .or(z.literal("")),


    email: z
        .string()
        .min(1, "El correo electrónico es obligatorio")
        .email("El correo electrónico no es válido"),

    tipoDocumento: z
        .string()
        .min(1, "El tipo de documento es obligatorio"),

    numeroDocumento: z
        .string()
        .min(1, "El número de documento es obligatorio"),

    celular: z
        .string()
        .min(1, "El celular es obligatorio")
        .regex(/^[0-9]{9}$/, "El celular debe tener exactamente 9 dígitos")
}).superRefine((data, ctx) => {
    if (data.tipoDocumento === 'DNI') {
        if (!DNI_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El DNI debe tener 8 dígitos numéricos",
                path: ["numeroDocumento"],
            });
        }
    } else if (data.tipoDocumento === 'RUC') {
        if (!RUC_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El RUC debe tener 11 dígitos y comenzar con 10, 15 o 20",
                path: ["numeroDocumento"],
            });
        }
    } else if (data.tipoDocumento === 'CE') {
        if (!CE_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El Carné de Extranjería debe contener entre 9 y 12 dígitos",
                path: ["numeroDocumento"],
            });
        }
    } else if (data.tipoDocumento === 'Pasaporte') {
        if (!PASSPORT_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El pasaporte debe tener 1 letra y 7 números (ej. P1234567)",
                path: ["numeroDocumento"],
            });
        }
    }
    
    // Validate apellido is required for non-RUC document types
    if (data.tipoDocumento !== 'RUC') {
        if (!data.apellido || data.apellido.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El apellido es obligatorio",
                path: ["apellido"],
            });
        }
    }
});

export type MisDatosSchemaType = z.infer<typeof misDatosSchema>;
