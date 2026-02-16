// lib/autorizacionSchema.ts
import { z } from "zod";
import { DNI_REGEX, RUC_REGEX, PASSPORT_REGEX } from "./validations";


export const autorizacionSchema = z.object({
    documentType: z
        .string()
        .min(1, "El tipo de documento es obligatorio"),

    documentNumber: z
        .string()
        .min(1, "El número de documento es obligatorio"),

    fullName: z
        .string()
        .min(1, "El nombre completo es obligatorio")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.-]+$/, "El nombre solo puede contener letras, puntos, comas y guiones"),


}).superRefine((data, ctx) => {
    if (data.documentType === 'DNI') {
        if (!DNI_REGEX.test(data.documentNumber)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El DNI debe tener exactamente 8 números",
                path: ["documentNumber"],
            });
        }
    } else if (data.documentType === 'RUC') {
        if (!RUC_REGEX.test(data.documentNumber)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El RUC debe tener 11 números y empezar con 10, 15 o 20",
                path: ["documentNumber"],
            });
        }
    } else if (data.documentType === 'PASAPORTE') {
        if (!PASSPORT_REGEX.test(data.documentNumber)) {

            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El pasaporte debe tener 1 letra y 7 números (ej. P1234567)",
                path: ["documentNumber"],
            });
        }
    } else {
        if (data.documentNumber.length < 8 || data.documentNumber.length > 20) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Número de documento inválido",
                path: ["documentNumber"],
            });
        }
    }

});

export type AutorizacionSchemaType = z.infer<typeof autorizacionSchema>;
