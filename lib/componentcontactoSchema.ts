// lib/contactoSchema.ts
import { z } from "zod";

export const contactoSchema = z.object({
    celular: z
        .string()
        .min(1, "El número de celular es obligatorio")
        .regex(/^[0-9]{9}$/, "Debe ser un número válido de 9 dígitos"),
    documento: z
        .string()
        .min(1, "El documento es obligatorio")
        .min(8, "Debe tener al menos 8 caracteres")
        .max(11, "Debe tener máximo 11 caracteres"),
    aceptaPrivacidad: z
        .boolean()
        .refine(val => val === true, "Debes aceptar las políticas de privacidad")
});

export type ContactoSchemaType = z.infer<typeof contactoSchema>;