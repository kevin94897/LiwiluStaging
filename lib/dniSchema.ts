import { z } from "zod";

export const dniSchema = z.object({
    dni: z
        .string()
        .min(1, "El DNI es obligatorio")
        .length(8, "El DNI debe tener 8 dígitos")
});
