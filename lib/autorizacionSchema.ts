import { z } from "zod";

export const autorizacionSchema = z.object({
    documentType: z
        .string()
        .min(1, "El tipo de documento es obligatorio"),
    documentNumber: z
        .string()
        .min(1, "El número de documento es obligatorio"),
    fullName: z
        .string()
        .min(1, "El nombre es obligatorio"),
});

export type AutorizacionSchemaType = z.infer<typeof autorizacionSchema>;
