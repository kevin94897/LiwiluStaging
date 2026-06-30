import { z } from "zod";
import { dniValidation, CE_REGEX } from "./validations";

export const dniSchema = z.object({
    dni: dniValidation
});

export const ceSchema = z.object({
    dni: z.string().min(1, "El CE es obligatorio").regex(CE_REGEX, "El CE debe tener entre 9 y 12 dígitos numéricos"),
});
