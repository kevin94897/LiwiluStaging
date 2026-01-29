// lib/direccionSchema.ts
import { z } from "zod";

export const direccionSchema = z.object({
    numeroDptoPiso: z
        .string()
        .min(1, "El número de dpto/piso es obligatorio")
        .max(50, "El número de dpto/piso no puede exceder 50 caracteres"),

    direccion: z
        .string()
        .min(1, "La dirección es obligatoria")
        .min(10, "La dirección debe tener al menos 10 caracteres")
        .max(200, "La dirección no puede exceder 200 caracteres"),

    referencia: z
        .string()
        .min(1, "La referencia es obligatoria")
        .max(100, "La referencia no puede exceder 100 caracteres"),

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


    esPrincipal: z
        .boolean()
});

export type DireccionSchemaType = z.infer<typeof direccionSchema>;