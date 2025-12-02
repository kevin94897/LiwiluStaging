// lib/misDatosSchema.ts
import { z } from "zod";

export const misDatosSchema = z.object({
    nombre: z
        .string()
        .min(1, "El nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras"),

    apellido: z
        .string()
        .min(1, "El apellido es obligatorio")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras"),

    tipoDocumento: z
        .string()
        .min(1, "El tipo de documento es obligatorio"),

    numeroDocumento: z
        .string()
        .min(1, "El número de documento es obligatorio")
        .min(8, "El número de documento debe tener al menos 8 caracteres")
        .max(11, "El número de documento no puede exceder 11 caracteres")
        .regex(/^[0-9]+$/, "El número de documento solo puede contener números"),

    celular: z
        .string()
        .min(1, "El celular es obligatorio")
        .regex(/^[0-9]{9}$/, "El celular debe tener exactamente 9 dígitos")
});

export type MisDatosSchemaType = z.infer<typeof misDatosSchema>;