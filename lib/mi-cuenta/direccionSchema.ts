// lib/direccionSchema.ts
import { z } from "zod";

export const direccionSchema = z.object({
    titulo: z
        .string()
        .min(1, "El título es obligatorio")
        .min(3, "El título debe tener al menos 3 caracteres")
        .max(50, "El título no puede exceder 50 caracteres"),

    direccion: z
        .string()
        .min(1, "La dirección es obligatoria")
        .min(10, "La dirección debe tener al menos 10 caracteres")
        .max(200, "La dirección no puede exceder 200 caracteres"),

    referencia: z
        .string()
        .max(100, "La referencia no puede exceder 100 caracteres")
        .optional(),

    ciudad: z
        .string()
        .min(1, "El departamento es obligatorio"),

    provincia: z
        .string()
        .min(1, "La provincia es obligatoria"),

    distrito: z
        .string()
        .min(1, "El distrito es obligatorio"),

    codigoPostal: z
        .string()
        .regex(/^[0-9]{5}$/, "El código postal debe tener 5 dígitos")
        .optional()
        .or(z.literal("")),

    telefono: z
        .string()
        .min(1, "El teléfono es obligatorio")
        .regex(/^[0-9]{9}$/, "El teléfono debe tener 9 dígitos"),

    esPrincipal: z
        .boolean()
});

export type DireccionSchemaType = z.infer<typeof direccionSchema>;